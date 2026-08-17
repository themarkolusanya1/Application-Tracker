import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendEmail } from '@/lib/email';
import { renderDeadlineReminderEmail } from '@/lib/email-templates/deadline-reminder';

export const dynamic = 'force-dynamic';

/**
 * Convert an HH:MM time string from a user's timezone to UTC hour + minute.
 * Falls back to the raw HH:MM if the timezone is invalid.
 */
function getUTCHourMinute(
  timeHHMM: string,
  timezone: string
): { hour: number; minute: number } {
  try {
    const [hStr, mStr] = timeHHMM.split(':');
    const h = parseInt(hStr, 10);
    const m = parseInt(mStr, 10);

    // Build a Date object for "today at HH:MM in user timezone"
    const now = new Date();
    // Use a reference date string in the user's locale to get offset
    const localDateStr = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(now);

    // Parse YYYY-MM-DD
    const [year, month, day] = localDateStr.split('-').map(Number);

    // Create a Date representing that time in the user's timezone via UTC trick
    const localDate = new Date(
      Date.UTC(year, month - 1, day, h, m, 0)
    );

    // Compute UTC offset by comparing local noon in that tz to UTC noon
    const noonUTC = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
    const noonLocal = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(noonUTC);
    const [noonHStr, noonMStr] = noonLocal.split(':');
    const offsetMinutes = 12 * 60 - (parseInt(noonHStr, 10) * 60 + parseInt(noonMStr, 10));

    const utcMs = localDate.getTime() + offsetMinutes * 60 * 1000;
    const utcDate = new Date(utcMs);

    return { hour: utcDate.getUTCHours(), minute: utcDate.getUTCMinutes() };
  } catch {
    // Fallback: treat the time as UTC
    const [hStr, mStr] = timeHHMM.split(':');
    return { hour: parseInt(hStr, 10), minute: parseInt(mStr, 10) };
  }
}

export async function GET(req: Request) {
  try {
    // Validate optional Vercel Cron authorization secret
    const cronSecret = process.env.CRON_SECRET;
    const authHeader = req.headers.get('authorization');
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    const currentUTCHour = now.getUTCHours();
    const currentUTCMinute = now.getUTCMinutes();
    const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

    // 1. Fetch users who have deadline reminders enabled
    const users = await db.user.findMany({
      where: {
        emailNotificationsEnabled: true,
        deadlineRemindersEnabled: true,
      },
      include: {
        applications: {
          where: { deadline: { not: null } },
        },
      },
    });

    let emailsSent = 0;
    const logResults: any[] = [];

    for (const user of users) {
      // --- Parse this user's reminder schedule ---
      const rawDays = user.reminderDays ?? '5,4,3,2,1';
      const reminderDaySet = new Set(
        rawDays
          .split(',')
          .map((d) => parseInt(d.trim(), 10))
          .filter((d) => !isNaN(d) && d >= 0)
      );

      const rawTime = user.reminderTime ?? '08:00';
      const rawTz = user.userTimezone ?? 'UTC';
      const { hour: targetUTCHour, minute: targetUTCMinute } = getUTCHourMinute(rawTime, rawTz);

      // Only send emails during the user's chosen UTC hour window (±30 min)
      const currentMinutes = currentUTCHour * 60 + currentUTCMinute;
      const targetMinutes = targetUTCHour * 60 + targetUTCMinute;
      if (Math.abs(currentMinutes - targetMinutes) > 30) {
        // Not in the right time window for this user — skip
        logResults.push({ user: user.email, skipped: 'outside_time_window', target: rawTime });
        continue;
      }

      // --- DEADLINE REMINDERS ---
      for (const app of user.applications) {
        if (!app.deadline) continue;

        const deadlineDate = new Date(app.deadline);
        const deadlineStart = new Date(
          Date.UTC(deadlineDate.getUTCFullYear(), deadlineDate.getUTCMonth(), deadlineDate.getUTCDate())
        );
        const diffMs = deadlineStart.getTime() - todayStart.getTime();
        const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

        // Skip if not in user's chosen reminder days
        if (!reminderDaySet.has(diffDays)) continue;

        // Skip already-rejected/withdrawn apps
        const status = app.status ?? '';
        if (['REJECTED', 'WITHDRAWN', 'Rejected', 'Withdrawn'].includes(status)) continue;

        // Deduplicate: don't send the same reminder twice in one day
        const existingLog = await db.sentEmailLog.findFirst({
          where: {
            userId: user.id,
            applicationId: app.id,
            emailType: `DEADLINE_REMINDER_${diffDays}_DAY`,
            sentAt: { gte: todayStart },
          },
        });
        if (existingLog) continue;

        const formattedDate = deadlineDate.toLocaleDateString([], {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });

        const emailHtml = renderDeadlineReminderEmail({
          userName: user.name || 'Applicant',
          organization: app.organization,
          title: app.title,
          daysRemaining: diffDays,
          deadlineDate: formattedDate,
          applicationType: app.applicationType,
          appUrl: app.url || undefined,
        });

        let urgencyText: string;
        if (diffDays === 0) {
          urgencyText = 'LAST DAY — Apply Now!';
        } else if (diffDays === 1) {
          urgencyText = 'LAST DAY';
        } else {
          urgencyText = `${diffDays} days left`;
        }
        const subject = `⚠️ [Deadline Alert] ${app.organization} — ${urgencyText} to apply!`;

        const emailRes = await sendEmail({ to: user.email, subject, html: emailHtml });

        if (emailRes.success) {
          emailsSent++;
          await db.sentEmailLog.create({
            data: {
              userId: user.id,
              applicationId: app.id,
              emailType: `DEADLINE_REMINDER_${diffDays}_DAY`,
            },
          });
          logResults.push({ user: user.email, type: 'Deadline', app: app.title, days: diffDays });
        }
      }
    }

    return NextResponse.json({
      success: true,
      emailsSent,
      logResults,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Reminders Cron Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
