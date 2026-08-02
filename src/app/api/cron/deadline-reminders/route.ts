import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendEmail } from '@/lib/email';
import { renderDeadlineReminderEmail } from '@/lib/email-templates/deadline-reminder';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    // Validate optional Vercel Cron authorization secret
    const cronSecret = process.env.CRON_SECRET;
    const authHeader = req.headers.get('authorization');
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // 1. Fetch users who have deadline reminders enabled
    const users = await db.user.findMany({
      where: {
        emailNotificationsEnabled: true,
        deadlineRemindersEnabled: true,
      },
      include: {
        applications: {
          where: {
            deadline: { not: null },
          },
        },
      },
    });

    let emailsSent = 0;
    const logResults: any[] = [];

    for (const user of users) {
      for (const app of user.applications) {
        if (!app.deadline) continue;

        const deadlineDate = new Date(app.deadline);
        const deadlineStart = new Date(deadlineDate.getFullYear(), deadlineDate.getMonth(), deadlineDate.getDate());
        
        // Calculate difference in whole days
        const diffMs = deadlineStart.getTime() - todayStart.getTime();
        const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

        // Trigger reminders for 5, 4, 3, 2, and 1 day out
        if (diffDays >= 1 && diffDays <= 5) {
          // Check if email already sent today for this application
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

          const urgencyText = diffDays === 1 ? 'LAST DAY' : `${diffDays} days left`;
          const subject = `⚠️ [Deadline Alert] ${app.organization} - ${urgencyText} to apply!`;

          const emailRes = await sendEmail({
            to: user.email,
            subject,
            html: emailHtml,
          });

          if (emailRes.success) {
            emailsSent++;
            await db.sentEmailLog.create({
              data: {
                userId: user.id,
                applicationId: app.id,
                emailType: `DEADLINE_REMINDER_${diffDays}_DAY`,
              },
            });
            logResults.push({ user: user.email, app: app.title, days: diffDays });
          }
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
    console.error('Deadline Reminders Cron Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
