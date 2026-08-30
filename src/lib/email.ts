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

import { replaceTemplateVariables } from "./email-variables";

/**
 * Compiles visual template blocks into plain HTML with variable substitution.
 */
export function compileTemplate(
  blocksJson: string,
  variables: Record<string, any>,
  event: string = ""
): string {
  try {
    const raw = (blocksJson || "").trim();
    if (!raw) return "";

    // If it's raw HTML rather than a JSON array of blocks
    if (!raw.startsWith("[")) {
      return replaceTemplateVariables(raw, event, variables);
    }

    const blocks = JSON.parse(raw);
    let html = "";
    const siteName = variables.site_name || variables.siteName || "Trade Learning Hub";

    for (const b of blocks) {
      if (b.type === "header") {
        html += `<div style="text-align: center; padding: 20px; border-bottom: 1px solid #eaeaea;"><h2 style="margin: 0; color: #111; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">${siteName}</h2></div>`;
      } else if (b.type === "title") {
        const text = replaceTemplateVariables(b.text || "", event, variables);
        html += `<div style="padding: 20px 0;"><h1 style="margin: 0; font-size: 22px; font-weight: 700; color: #111; text-align: center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">${text}</h1></div>`;
      } else if (b.type === "subtitle") {
        const text = replaceTemplateVariables(b.text || "", event, variables);
        html += `<div style="padding: 5px 0 15px 0; text-align: center;"><p style="margin: 0; font-size: 14px; color: #666; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">${text}</p></div>`;
      } else if (b.type === "text") {
        const text = replaceTemplateVariables(b.text || "", event, variables);
        html += `<div style="padding: 10px 0; line-height: 1.6; color: #333; font-size: 15px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;"><p style="margin: 0; white-space: pre-line;">${text}</p></div>`;
      } else if (b.type === "button") {
        const url = replaceTemplateVariables(b.url || "", event, variables);
        const text = replaceTemplateVariables(b.text || "Click Here", event, variables);
        html += `<div style="padding: 20px 0; text-align: center;"><a href="${url}" style="background-color: #2B2B2B; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px; display: inline-block; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">${text}</a></div>`;
      } else if (b.type === "footer") {
        const text = replaceTemplateVariables(b.text || "", event, variables);
        html += `<div style="padding: 20px 0; border-top: 1px solid #eaeaea; font-size: 12px; color: #888; text-align: center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;"><p style="margin: 0;">${text}</p></div>`;
      }
    }

    const fullHtml = `<div style="max-width: 600px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 24px; border: 1px solid #e5e5e5; border-radius: 8px; background-color: #ffffff;">${html}</div>`;
    return replaceTemplateVariables(fullHtml, event, variables);
  } catch (e) {
    return replaceTemplateVariables(blocksJson || "", event, variables);
  }
}

/**
 * Loads a template by event key, compiles it with all runtime variable substitutions, and dispatches the email.
 */
export async function sendEventEmail(
  event: string,
  to: string,
  variables: Record<string, any> = {}
) {
  const template = await queryOne(
    "SELECT * FROM email_templates WHERE event = ? AND is_active = 1",
    [event]
  );
  if (!template) {
    return { ok: false, error: `Template '${event}' not found or inactive` };
  }

  // Retrieve site settings for global template tags
  const site = await queryOne("SELECT site_name FROM site_settings WHERE id = 'default'");
  const siteName = site?.site_name || "Trade Learning Hub";
  const appUrl = process.env.NEXTAUTH_URL || process.env.APP_URL || "http://tradelearninghub.com";

  // Auto-enrich user_name if missing and user exists in DB
  let resolvedUserName = variables.user_name || variables.userName || variables.name;
  if (!resolvedUserName && to) {
    const user = await queryOne("SELECT name FROM users WHERE email = ?", [to]);
    if (user?.name) {
      resolvedUserName = user.name;
    }
  }

  const allVars = {
    site_name: siteName,
    siteName,
    app_url: appUrl,
    appUrl,
    user_email: to,
    userEmail: to,
    email: to,
    user_name: resolvedUserName || "Student",
    userName: resolvedUserName || "Student",
    name: resolvedUserName || "Student",
    year: new Date().getFullYear().toString(),
    ...variables,
  };

  const subject = replaceTemplateVariables(template.subject, event, allVars);
  const html = compileTemplate(template.blocks_json, allVars, event);

  return sendEmail({
    to,
    subject,
    html,
    templateId: template.id,
    senderId: template.sender_id || null,
  });
}
