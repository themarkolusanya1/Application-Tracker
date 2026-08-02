interface DailyMotivationProps {
  userName: string;
  quote: string;
  author: string;
  inProgressCount: number;
}

export function renderDailyMotivationEmail({
  userName,
  quote,
  author,
  inProgressCount,
}: DailyMotivationProps): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Daily Motivation - MyTraks</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f7f9fb; margin: 0; padding: 30px 15px; color: #191c1e;">
  <div style="max-width: 580px; margin: 0 auto; background-color: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
    
    <!-- Header -->
    <div style="background-color: #4648d4; padding: 24px 32px; text-align: center;">
      <h1 style="color: #ffffff; font-size: 22px; font-weight: 800; margin: 0;">MyTraks</h1>
      <p style="color: rgba(255,255,255,0.85); font-size: 13px; margin: 4px 0 0 0; font-weight: 500;">✨ Daily Focus & Motivation</p>
    </div>

    <!-- Content -->
    <div style="padding: 32px;">
      <h2 style="font-size: 18px; font-weight: 700; color: #0f172a; margin: 0 0 16px 0;">Good morning, ${userName}! 👋</h2>
      
      <!-- Motivational Quote Block -->
      <div style="background-color: #f1f5f9; border-left: 4px solid #4648d4; padding: 20px; border-radius: 0 14px 14px 0; margin-bottom: 24px;">
        <p style="font-size: 15px; font-style: italic; color: #1e293b; margin: 0 0 8px 0; line-height: 1.5;">
          "${quote}"
        </p>
        <div style="font-size: 12px; font-weight: 700; color: #64748b; text-align: right;">— ${author}</div>
      </div>

      ${inProgressCount > 0 ? `
        <div style="background-color: #fffbeb; border: 1px solid #fef3c7; border-radius: 14px; padding: 16px 20px; margin-bottom: 24px;">
          <div style="font-size: 13px; font-weight: 700; color: #b45309;">
            💡 You currently have <strong>${inProgressCount} application${inProgressCount > 1 ? 's' : ''} in progress</strong> waiting for submission. Take a step today to move closer to your goal!
          </div>
        </div>
      ` : `
        <p style="font-size: 14px; color: #475569; margin: 0 0 24px 0;">
          Ready to discover your next career or academic opportunity? Log in to your MyTraks workspace and add new targets today!
        </p>
      `}

      <div style="text-align: center;">
        <a href="https://mytraks.vercel.app/dashboard" target="_blank" style="display: inline-block; background-color: #4648d4; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 700; padding: 14px 32px; border-radius: 50px; box-shadow: 0 4px 14px rgba(70, 72, 212, 0.35);">
          Start Today's Focus →
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 32px; text-align: center; font-size: 12px; color: #94a3b8;">
      Sent automatically by MyTraks. Turn off daily emails anytime in your Settings.
    </div>

  </div>
</body>
</html>
  `;
}
