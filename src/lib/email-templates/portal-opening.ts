interface PortalOpeningProps {
  userName: string;
  organization: string;
  title: string;
  daysRemaining: number;
  openingDate: string;
  applicationType: string;
  appUrl?: string;
}

export function renderPortalOpeningEmail({
  userName,
  organization,
  title,
  daysRemaining,
  openingDate,
  applicationType,
  appUrl,
}: PortalOpeningProps): string {
  const appTypeLabel = applicationType === 'scholarship' ? 'University/Scholarship' : 'Job/Internship';
  const urgencyLabel = daysRemaining === 1 ? 'Portal Opens Tomorrow!' : `Portal Opens in ${daysRemaining} Days`;
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
    <div style="background-color: #059669; padding: 28px 32px; text-align: center;">
      <h1 style="color: #ffffff; font-size: 24px; font-weight: 800; margin: 0; letter-spacing: -0.5px;">MyTraks</h1>
      <p style="color: rgba(255,255,255,0.9); font-size: 13px; margin: 6px 0 0 0; font-weight: 500;">🎉 Application Portal Opening Alert</p>
    </div>

    <!-- Content -->
    <div style="padding: 32px;">
      <div style="display: inline-block; background-color: #059669; color: #ffffff; font-size: 11px; font-weight: 800; text-transform: uppercase; padding: 5px 14px; border-radius: 50px; letter-spacing: 0.5px; margin-bottom: 20px;">
        🚀 ${urgencyLabel}
      </div>

      <h2 style="font-size: 20px; font-weight: 700; color: #0f172a; margin: 0 0 12px 0;">Hello ${userName},</h2>
      <p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0 0 24px 0;">
        Great news! The application portal for your target <strong>${appTypeLabel}</strong> opportunity is opening very soon.
      </p>

      <!-- Details Card -->
      <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 14px; padding: 20px; margin-bottom: 28px;">
        <div style="font-size: 11px; font-weight: 700; color: #166534; text-transform: uppercase; margin-bottom: 4px;">${organization}</div>
        <div style="font-size: 18px; font-weight: 800; color: #064e3b; margin-bottom: 12px;">${title}</div>
        
        <div style="border-top: 1px solid #bbf7d0; padding-top: 12px; margin-top: 12px; display: flex; justify-content: space-between; font-size: 13px;">
          <span style="color: #166534; font-weight: 600;">Portal Opening Date:</span>
          <span style="color: #064e3b; font-weight: 700;">🟢 ${openingDate}</span>
        </div>
      </div>

      <p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0 0 28px 0;">
        Prepare your documents (CV/Resume, Statement of Purpose, Transcripts, and Reference contacts) now so you can submit your application as soon as the portal opens!
      </p>

      <!-- CTA Button -->
      <div style="text-align: center; margin-bottom: 12px;">
        <a href="${actionLink}" target="_blank" style="display: inline-block; background-color: #059669; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 700; padding: 14px 32px; border-radius: 50px; box-shadow: 0 4px 14px rgba(5, 150, 105, 0.35);">
          View Target Opportunity on MyTraks →
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
