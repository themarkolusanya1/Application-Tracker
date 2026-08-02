interface DeadlineReminderProps {
  userName: string;
  organization: string;
  title: string;
  daysRemaining: number;
  deadlineDate: string;
  applicationType: string;
  appUrl?: string;
}

export function renderDeadlineReminderEmail({
  userName,
  organization,
  title,
  daysRemaining,
  deadlineDate,
  applicationType,
  appUrl,
}: DeadlineReminderProps): string {
  const appTypeLabel = applicationType === 'scholarship' ? 'University/Scholarship' : 'Job/Internship';
  const badgeColor = daysRemaining <= 2 ? '#e11d48' : daysRemaining <= 3 ? '#f59e0b' : '#4648d4';
  const urgencyLabel = daysRemaining === 1 ? 'Last Day to Apply!' : `Due in ${daysRemaining} Days`;
  const actionLink = appUrl || 'https://mytraks.vercel.app/dashboard';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${urgencyLabel} - ${title}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f7f9fb; margin: 0; padding: 30px 15px; color: #191c1e;">
  <div style="max-width: 580px; margin: 0 auto; background-color: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
    
    <!-- Header -->
    <div style="background-color: #4648d4; padding: 28px 32px; text-align: center;">
      <h1 style="color: #ffffff; font-size: 24px; font-weight: 800; margin: 0; letter-spacing: -0.5px;">MyTraks</h1>
      <p style="color: rgba(255,255,255,0.85); font-size: 13px; margin: 6px 0 0 0; font-weight: 500;">Application Deadline Alert</p>
    </div>

    <!-- Content -->
    <div style="padding: 32px;">
      <div style="display: inline-block; background-color: ${badgeColor}; color: #ffffff; font-size: 11px; font-weight: 800; text-transform: uppercase; padding: 5px 14px; border-radius: 50px; letter-spacing: 0.5px; margin-bottom: 20px;">
        ⚠️ ${urgencyLabel}
      </div>

      <h2 style="font-size: 20px; font-weight: 700; color: #0f172a; margin: 0 0 12px 0;">Hello ${userName},</h2>
      <p style="font-size: 14px; color: #475569; leading: 1.6; margin: 0 0 24px 0;">
        This is a quick reminder that the application deadline for your <strong>${appTypeLabel}</strong> opportunity is approaching soon.
      </p>

      <!-- Application Details Card -->
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 20px; margin-bottom: 28px;">
        <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; tracking: 0.5px; margin-bottom: 4px;">${organization}</div>
        <div style="font-size: 18px; font-weight: 800; color: #1e293b; margin-bottom: 12px;">${title}</div>
        
        <div style="border-top: 1px solid #e2e8f0; pt-12; padding-top: 12px; margin-top: 12px; display: flex; justify-content: space-between; font-size: 13px;">
          <span style="color: #64748b; font-weight: 600;">Deadline Date:</span>
          <span style="color: #0f172a; font-weight: 700;">📅 ${deadlineDate}</span>
        </div>
      </div>

      <p style="font-size: 14px; color: #475569; margin: 0 0 28px 0;">
        Don't miss out on this milestone! Review your documents, finalize your submission, and mark your track as <em>Submitted</em> on MyTraks.
      </p>

      <!-- CTA Button -->
      <div style="text-align: center; margin-bottom: 12px;">
        <a href="${actionLink}" target="_blank" style="display: inline-block; background-color: #4648d4; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 700; padding: 14px 32px; border-radius: 50px; box-shadow: 0 4px 14px rgba(70, 72, 212, 0.35);">
          View Application on MyTraks →
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 32px; text-align: center; font-size: 12px; color: #94a3b8;">
      Sent automatically by MyTraks Career Control Center. You can update your email preferences anytime in your Settings.
    </div>

  </div>
</body>
</html>
  `;
}
