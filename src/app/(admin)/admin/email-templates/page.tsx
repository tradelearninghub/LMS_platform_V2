import { query } from "@/lib/db";
import { getEmailSenders } from "@/lib/settings";
import { EmailTemplateList } from "./template-list";

export const metadata = { title: "Email Templates" };

export const dynamic = "force-dynamic";

export default async function EmailTemplatesPage() {
  const templates = await query("SELECT * FROM email_templates ORDER BY event ASC");
  const senders = await getEmailSenders();

  const mappedTemplates = templates.map((t) => ({
    id: t.id,
    event: t.event,
    name: t.name,
    subject: t.subject,
    blocksJson: t.blocks_json,
    isActive: !!t.is_active,
    senderId: t.sender_id || null,
  }));

  const mappedSenders = senders.map((s) => ({
    id: s.id,
    label: s.label,
    senderEmail: s.sender_email,
    isDefault: !!s.is_default,
  }));

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Email Templates</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Configure template content and select which sender email profile each event dispatches from.
        </p>
      </div>
      <EmailTemplateList templates={mappedTemplates} senders={mappedSenders} />
    </div>
  );
}
