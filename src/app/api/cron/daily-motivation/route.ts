import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendEmail } from '@/lib/email';
import { renderDailyMotivationEmail } from '@/lib/email-templates/daily-motivation';

export const dynamic = 'force-dynamic';

const MOTIVATIONAL_QUOTES = [
  { quote: "The future depends on what you do today.", author: "Mahatma Gandhi" },
  { quote: "Opportunities don't happen, you create them.", author: "Chris Grosser" },
  { quote: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { quote: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
  { quote: "Your dream career is built one application at a time.", author: "MyTraks Philosophy" },
  { quote: "Action is the foundational key to all success.", author: "Pablo Picasso" },
  { quote: "Start where you are. Use what you have. Do what you can.", author: "Arthur Ashe" },
];

export async function GET(req: Request) {
  try {
    const cronSecret = process.env.CRON_SECRET;
    const authHeader = req.headers.get('authorization');
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const users = await db.user.findMany({
      where: {
        emailNotificationsEnabled: true,
        dailyMotivationEnabled: true,
      },
      include: {
        applications: true,
      },
    });

    // Select a quote based on the day of the year
    const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    const selectedQuote = MOTIVATIONAL_QUOTES[dayOfYear % MOTIVATIONAL_QUOTES.length];

    let emailsSent = 0;

    for (const user of users) {
      // Check if motivation email was already sent today
      const existingLog = await db.sentEmailLog.findFirst({
        where: {
          userId: user.id,
          emailType: 'DAILY_MOTIVATION',
          sentAt: { gte: todayStart },
        },
      });

      if (existingLog) continue;

      const inProgressCount = user.applications.filter(a => {
        if (a.applicationType === 'scholarship') {
          return a.status === 'Researching' || a.status === 'Documents in Progress';
        }
        return a.status === 'WISH_LIST';
      }).length;

      const emailHtml = renderDailyMotivationEmail({
        userName: user.name || 'Applicant',
        quote: selectedQuote.quote,
        author: selectedQuote.author,
        inProgressCount,
      });

      const emailRes = await sendEmail({
        to: user.email,
        subject: `✨ Daily Focus: "${selectedQuote.quote.substring(0, 45)}..."`,
        html: emailHtml,
      });

      if (emailRes.success) {
        emailsSent++;
        await db.sentEmailLog.create({
          data: {
            userId: user.id,
            emailType: 'DAILY_MOTIVATION',
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      emailsSent,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Daily Motivation Cron Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
