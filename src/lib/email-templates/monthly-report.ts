interface MonthlyReportProps {
  userName: string;
  monthName: string;
  totalSubmitted: number;
  inProgressCount: number;
  offersCount: number;
  goalTarget: number;
  goalPercentage: number;
}

export function renderMonthlyReportEmail({
  userName,
  monthName,
  totalSubmitted,
  inProgressCount,
  offersCount,
  goalTarget,
  goalPercentage,
}: MonthlyReportProps): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Your ${monthName} Progress Report - MyTraks</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f7f9fb; margin: 0; padding: 30px 15px; color: #191c1e;">
  <div style="max-width: 580px; margin: 0 auto; background-color: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
    
    <!-- Header -->
    <div style="background-color: #4648d4; padding: 32px; text-align: center;">
      <h1 style="color: #ffffff; font-size: 24px; font-weight: 800; margin: 0;">MyTraks</h1>
      <p style="color: rgba(255,255,255,0.9); font-size: 14px; margin: 6px 0 0 0; font-weight: 600;">📊 ${monthName} Monthly Performance Report</p>
    </div>

    <!-- Content -->
    <div style="padding: 32px;">
      <h2 style="font-size: 20px; font-weight: 700; color: #0f172a; margin: 0 0 8px 0;">Great effort, ${userName}!</h2>
      <p style="font-size: 14px; color: #475569; leading: 1.6; margin: 0 0 24px 0;">
        Here is a summary of your career & academic milestones accomplished throughout <strong>${monthName}</strong>:
      </p>

      <!-- Target Goal Progress Card -->
      <div style="background: linear-gradient(135deg, #4648d4 0%, #00687a 100%); border-radius: 16px; padding: 24px; color: #ffffff; margin-bottom: 24px; text-align: center;">
        <div style="font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; opacity: 0.85;">Monthly Target Goal</div>
        <div style="font-size: 36px; font-weight: 900; margin: 8px 0;">${totalSubmitted} / ${goalTarget}</div>
        <div style="font-size: 13px; font-weight: 700;">Goal Achieved: ${goalPercentage}%</div>
      </div>

      <!-- Stats Grid -->
      <table width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 28px;">
        <tr>
          <td width="33%" style="padding: 6px;">
            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 16px; text-align: center;">
              <div style="font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase;">Submitted</div>
              <div style="font-size: 22px; font-weight: 800; color: #4648d4; margin-top: 4px;">${totalSubmitted}</div>
            </div>
          </td>
          <td width="33%" style="padding: 6px;">
            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 16px; text-align: center;">
              <div style="font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase;">In Progress</div>
              <div style="font-size: 22px; font-weight: 800; color: #d97706; margin-top: 4px;">${inProgressCount}</div>
            </div>
          </td>
          <td width="33%" style="padding: 6px;">
            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 16px; text-align: center;">
              <div style="font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase;">Offers/Admit</div>
              <div style="font-size: 22px; font-weight: 800; color: #059669; margin-top: 4px;">${offersCount}</div>
            </div>
          </td>
        </tr>
      </table>

      <p style="font-size: 14px; color: #475569; margin: 0 0 28px 0; leading: 1.6;">
        Consistency is the key to unlocking extraordinary opportunities. Keep building your momentum for the new month ahead!
      </p>

      <div style="text-align: center;">
        <a href="https://mytraks.vercel.app/dashboard" target="_blank" style="display: inline-block; background-color: #4648d4; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 700; padding: 14px 32px; border-radius: 50px; box-shadow: 0 4px 14px rgba(70, 72, 212, 0.35);">
          Open MyTraks Dashboard →
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 32px; text-align: center; font-size: 12px; color: #94a3b8;">
      Sent automatically by MyTraks. Manage your email preferences in Settings.
    </div>

  </div>
</body>
</html>
  `;
}
