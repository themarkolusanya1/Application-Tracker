import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;
export const resend = resendApiKey ? new Resend(resendApiKey) : null;

export interface SendEmailPayload {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

/**
 * Universal email dispatch helper.
 * If RESEND_API_KEY is configured, sends via Resend.
 * Otherwise simulates delivery in console for local testing.
 */
export async function sendEmail({ to, subject, html, from }: SendEmailPayload): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const sender = from || process.env.EMAIL_FROM || 'MyTraks Notifications <onboarding@resend.dev>';

    if (!resend) {
      console.log('--------------------------------------------------');
      console.log(`[EMAIL SIMULATOR] RESEND_API_KEY not configured.`);
      console.log(`[TO]: ${to}`);
      console.log(`[FROM]: ${sender}`);
      console.log(`[SUBJECT]: ${subject}`);
      console.log(`[PREVIEW]: ${html.replace(/<[^>]*>/g, '').substring(0, 150)}...`);
      console.log('--------------------------------------------------');
      return { success: true, id: `simulated_${Date.now()}` };
    }

    const response = await resend.emails.send({
      from: sender,
      to,
      subject,
      html,
    });

    if (response.error) {
      console.error('[Resend Error]:', response.error);
      return { success: false, error: response.error.message };
    }

    return { success: true, id: response.data?.id };
  } catch (error: any) {
    console.error('[sendEmail Error]:', error);
    return { success: false, error: error.message || 'Failed to send email' };
  }
}
