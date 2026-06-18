import { getEmailSettings } from "@/lib/settings";
import { EmailSettingsForm } from "./email-settings-form";

export const metadata = { title: "Email Settings" };

export const dynamic = "force-dynamic";


export default async function EmailSettingsPage() {
  const settings = await getEmailSettings();

  const mappedSettings = {
    id: settings.id,
    enabled: !!settings.enabled,
    smtpHost: settings.smtp_host,
    smtpPort: settings.smtp_port,
    smtpUsername: settings.smtp_username,
    smtpPassword: settings.smtp_password,
    smtpSecure: !!settings.smtp_secure,
    senderEmail: settings.sender_email,
    senderName: settings.sender_name,
    replyTo: settings.reply_to,
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Email (SMTP)</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Configure SMTP to send transactional emails. Changes take effect immediately.
        </p>
      </div>
      <EmailSettingsForm settings={mappedSettings} />
    </div>
  );
}
