export interface SendEmailPayload {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

function parseSender(senderString?: string) {
  const defaultSender = 'MyTraks Notifications <b5a592001@smtp-brevo.com>';
  const str = senderString || process.env.EMAIL_FROM || defaultSender;
  const match = str.match(/^(?:"?([^"]*)"?\s)?<([^>]+)>$/);
  if (match) {
    return { name: match[1]?.trim() || 'MyTraks Notifications', email: match[2]?.trim() };
  }
  return { name: 'MyTraks Notifications', email: str.trim() };
}

/**
 * Universal email dispatch helper via Brevo v3 Transactional Email API.
 * If BREVO_API_KEY is configured, sends directly via Brevo.
 * Otherwise simulates delivery in console for local testing.
 */
export async function sendEmail({ to, subject, html, from }: SendEmailPayload): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const brevoApiKey = process.env.BREVO_API_KEY;
    const sender = parseSender(from);

    if (!brevoApiKey) {
      console.log('--------------------------------------------------');
      console.log(`[EMAIL SIMULATOR] BREVO_API_KEY not configured.`);
      console.log(`[TO]: ${to}`);
      console.log(`[FROM]: ${sender.name} <${sender.email}>`);
      console.log(`[SUBJECT]: ${subject}`);
      console.log(`[PREVIEW]: ${html.replace(/<[^>]*>/g, '').substring(0, 150)}...`);
      console.log('--------------------------------------------------');
      return { success: true, id: `simulated_${Date.now()}` };
    }

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': brevoApiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender,
        to: [{ email: to }],
        subject,
        htmlContent: html,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[Brevo Error]:', data);
      return { success: false, error: data.message || 'Failed to send email via Brevo' };
    }

    return { success: true, id: data.messageId || `brevo_${Date.now()}` };
  } catch (error: any) {
    console.error('[sendEmail Error]:', error);
    return { success: false, error: error.message || 'Failed to send email' };
  }
}

