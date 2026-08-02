import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendEmail } from '@/lib/email';
import { renderMonthlyReportEmail } from '@/lib/email-templates/monthly-report';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const cronSecret = process.env.CRON_SECRET;
    const authHeader = req.headers.get('authorization');
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    // Calculate previous month details
    const priorMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const priorMonthIndex = priorMonthDate.getMonth();
    const priorMonthYear = priorMonthDate.getFullYear();
    const monthName = priorMonthDate.toLocaleString('default', { month: 'long', year: 'numeric' });

    const users = await db.user.findMany({
      where: {
        emailNotificationsEnabled: true,
        monthlyReportEnabled: true,
      },
      include: {
        applications: true,
      },
    });

    let emailsSent = 0;

    for (const user of users) {
      // Check if monthly report for this month/year was already sent
      const existingLog = await db.sentEmailLog.findFirst({
        where: {
          userId: user.id,
          emailType: `MONTHLY_REPORT_${priorMonthYear}_${priorMonthIndex}`,
        },
      });

      if (existingLog) continue;

      const isSubmitted = (a: any) => {
        if (a.applicationType === 'scholarship') {
          return a.status !== 'Researching' && a.status !== 'Documents in Progress';
        }
        return a.status !== 'WISH_LIST';
      };

      const monthlyApps = user.applications.filter(a => {
        const d = new Date(a.appliedDate || a.createdAt);
        return d.getMonth() === priorMonthIndex && d.getFullYear() === priorMonthYear;
      });

      const submittedMonthlyApps = monthlyApps.filter(isSubmitted);
      const draftMonthlyApps = monthlyApps.filter(a => !isSubmitted(a));
      const monthlyOffers = submittedMonthlyApps.filter(a => a.status === 'OFFERED' || a.status === 'Admitted').length;

      const goalTarget = 5; // Default target
      const goalPercentage = Math.min(100, Math.round((submittedMonthlyApps.length / goalTarget) * 100));

      const emailHtml = renderMonthlyReportEmail({
        userName: user.name || 'Applicant',
        monthName,
        totalSubmitted: submittedMonthlyApps.length,
        inProgressCount: draftMonthlyApps.length,
        offersCount: monthlyOffers,
        goalTarget,
        goalPercentage,
      });

      const emailRes = await sendEmail({
        to: user.email,
        subject: `📊 Your ${monthName} Application Performance Report - MyTraks`,
        html: emailHtml,
      });

      if (emailRes.success) {
        emailsSent++;
        await db.sentEmailLog.create({
          data: {
            userId: user.id,
            emailType: `MONTHLY_REPORT_${priorMonthYear}_${priorMonthIndex}`,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      monthName,
      emailsSent,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Monthly Report Cron Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
