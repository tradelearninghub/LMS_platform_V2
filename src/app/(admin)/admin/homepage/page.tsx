import { query } from "@/lib/db";
import { HomepageSectionList } from "./section-list";

export const metadata = { title: "Homepage Sections" };

export default async function AdminHomepagePage() {
  const sections = await query("SELECT * FROM homepage_sections ORDER BY sort_order ASC");

  const mappedSections = sections.map((s) => ({
    id: s.id,
    key: s.key,
    title: s.title,
    subtitle: s.subtitle,
    enabled: !!s.enabled,
    data: s.data,
  }));

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Homepage Sections</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Enable/disable and edit the content of homepage sections.
        </p>
      </div>
      <HomepageSectionList sections={mappedSections} />
    </div>
  );
}
