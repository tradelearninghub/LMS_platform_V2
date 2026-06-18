import { query } from "@/lib/db";
import { EmailTemplateList } from "./template-list";

export const metadata = { title: "Email Templates" };

export const dynamic = "force-dynamic";


export default async function EmailTemplatesPage() {
  const templates = await query("SELECT * FROM email_templates ORDER BY event ASC");

  const mappedTemplates = templates.map((t) => ({
    id: t.id,
    event: t.event,
    name: t.name,
    subject: t.subject,
    blocksJson: t.blocks_json,
    isActive: !!t.is_active,
  }));

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Email Templates</h1>
        <p className="text-sm text-muted-foreground mt-1">
          One template per system event. Edit the subject and content blocks.
        </p>
      </div>
      <EmailTemplateList templates={mappedTemplates} />
    </div>
  );
}
