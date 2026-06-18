import { getSiteSettings } from "@/lib/settings";

export const metadata = { title: "SEO Settings" };

export default async function AdminSEOPage() {
  const settings = await getSiteSettings();

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">SEO Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Global SEO defaults. These are managed from{" "}
          <a href="/admin/settings/site" className="text-primary hover:underline">Site & Branding</a>{" "}
          (SEO section). Per-course SEO is set on each course edit page.
        </p>
      </div>

      <div className="rounded-xl border bg-card p-5 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Default title</span>
          <span className="font-medium">{settings.seoTitle || "Not set"}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Default description</span>
          <span className="font-medium">{settings.seoDescription || "Not set"}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Keywords</span>
          <span className="font-medium">{settings.seoKeywords || "Not set"}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">OG Image</span>
          <span className="font-medium truncate max-w-xs">{settings.ogImageUrl || "Not set"}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">GA ID</span>
          <span className="font-medium">{settings.googleAnalyticsId || "Not set"}</span>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        The <code>robots.txt</code> and <code>sitemap.xml</code> are auto-generated from your published courses.
      </p>
    </div>
  );
}
