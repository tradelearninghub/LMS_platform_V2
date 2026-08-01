import nodemailer, { type Transporter } from "nodemailer";
import { queryOne, execute } from "./db";
import { getDefaultEmailSender, getEmailSenderById, type EmailSender } from "./settings";

/**
 * Build a nodemailer transporter from an EmailSender profile.
 * If no senderId is provided, uses the default sender.
 */
export async function getMailer(senderId?: string | null): Promise<{ transporter: Transporter; sender: EmailSender } | null> {
  let sender: EmailSender | null = null;

  if (senderId) {
    sender = await getEmailSenderById(senderId);
  }

  if (!sender) {
    sender = await getDefaultEmailSender();
  }

  if (!sender || !sender.smtp_host || !sender.smtp_port) return null;

  const transporter = nodemailer.createTransport({
    host: sender.smtp_host,
    port: sender.smtp_port,
    secure: !!sender.smtp_secure,
    auth: sender.smtp_username
      ? { user: sender.smtp_username, pass: sender.smtp_password ?? undefined }
      : undefined,
  });

  return { transporter, sender };
}

export interface SendArgs {
  to: string;
  subject: string;
  html: string;
  templateId?: string;
  senderId?: string | null;
}

export async function sendEmail({ to, subject, html, templateId, senderId }: SendArgs) {
  const mailerResult = await getMailer(senderId);

  const id = Math.random().toString(36).substring(2, 11);
  const prefix = "[Trade Learning Hub] ";
  const finalSubject = subject.startsWith("[Trade Learning Hub]") ? subject : `${prefix}${subject}`;

  if (!mailerResult) {
    await execute(
      "INSERT INTO email_logs (id, to_email, subject, status, error_msg) VALUES (?, ?, ?, ?, ?)",
      [id, to, finalSubject, "failed", "Email not configured"]
    );
    return { ok: false, error: "Email not configured" };
  }

  const { transporter, sender } = mailerResult;
  const from = sender.sender_name
    ? `"${sender.sender_name}" <${sender.sender_email}>`
    : (sender.sender_email ?? "no-reply@example.com");

  try {
    await transporter.sendMail({ from, to, subject: finalSubject, html });
    await execute(
      "INSERT INTO email_logs (id, to_email, subject, status, sent_at) VALUES (?, ?, ?, ?, ?)",
      [id, to, finalSubject, "sent", new Date()]
    );
    return { ok: true };
  } catch (err) {
    await execute(
      "INSERT INTO email_logs (id, to_email, subject, status, error_msg) VALUES (?, ?, ?, ?, ?)",
      [id, to, finalSubject, "failed", err instanceof Error ? err.message : String(err)]
    );
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

/**
 * Compiles visual template blocks into plain HTML.
 */
export function compileTemplate(blocksJson: string, variables: Record<string, string>): string {
  try {
    const blocks = JSON.parse(blocksJson);
    let html = "";
    for (const b of blocks) {
      if (b.type === "header") {
        html += `<div style="text-align: center; padding: 20px; border-bottom: 1px solid #eaeaea;"><h2 style="margin: 0; color: #111;">${variables.siteName || "Trade Learning Hub"}</h2></div>`;
      } else if (b.type === "title") {
        let text = b.text || "";
        for (const [k, v] of Object.entries(variables)) {
          text = text.replace(new RegExp(`{{${k}}}`, "g"), v);
        }
        html += `<div style="padding: 20px 0;"><h1 style="margin: 0; font-size: 24px; color: #111; text-align: center;">${text}</h1></div>`;
      } else if (b.type === "text") {
        let text = b.text || "";
        for (const [k, v] of Object.entries(variables)) {
          text = text.replace(new RegExp(`{{${k}}}`, "g"), v);
        }
        html += `<div style="padding: 10px 0; line-height: 1.6; color: #444;"><p style="margin: 0;">${text}</p></div>`;
      } else if (b.type === "button") {
        let url = b.url || "";
        for (const [k, v] of Object.entries(variables)) {
          url = url.replace(new RegExp(`{{${k}}}`, "g"), v);
        }
        html += `<div style="padding: 20px 0; text-align: center;"><a href="${url}" style="background-color: #2B2B2B; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; display: inline-block;">${b.text || "Click Here"}</a></div>`;
      } else if (b.type === "footer") {
        let text = b.text || "";
        for (const [k, v] of Object.entries(variables)) {
          text = text.replace(new RegExp(`{{${k}}}`, "g"), v);
        }
        html += `<div style="padding: 20px 0; border-top: 1px solid #eaeaea; font-size: 12px; color: #888; text-align: center;"><p style="margin: 0;">${text}</p></div>`;
      }
    }
    return `<div style="max-width: 600px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">${html}</div>`;
  } catch (e) {
    return `<div>${blocksJson}</div>`;
  }
}

/**
 * Loads a template by event key, compiles it, and dispatches the email.
 * Now resolves the sender from the template's sender_id (V3 multi-sender support).
 */
export async function sendEventEmail(event: string, to: string, variables: Record<string, string>) {
  const template = await queryOne("SELECT * FROM email_templates WHERE event = ? AND is_active = 1", [event]);
  if (!template) {
    return { ok: false, error: "Template not found or inactive" };
  }

  const site = await queryOne("SELECT site_name FROM site_settings WHERE id = 'default'");
  const siteName = site?.site_name || "Trade Learning Hub";

  const allVars = {
    siteName,
    ...variables,
  };

  let subject = template.subject;
  for (const [k, v] of Object.entries(allVars)) {
    subject = subject.replace(new RegExp(`{{${k}}}`, "g"), v);
  }

  const html = compileTemplate(template.blocks_json, allVars);

  return sendEmail({
    to,
    subject,
    html,
    templateId: template.id,
    senderId: template.sender_id || null, // V3: per-template sender
  });
}
