import { getSiteSettings } from "@/lib/settings";
import { SiteSettingsForm } from "./site-settings-form";

export const metadata = { title: "Site Settings" };

export const dynamic = "force-dynamic";


export default async function SiteSettingsPage() {
  const settings = await getSiteSettings();

  const mappedSettings = {
    id: settings.id,
    siteName: settings.site_name,
    tagline: settings.tagline,
    logoUrl: settings.logo_url,
    contactEmail: settings.contact_email,
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Site & Branding</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your site name, branding, contact info, SEO defaults, social links, and integrations.
        </p>
      </div>
      <SiteSettingsForm settings={mappedSettings} />
    </div>
  );
}
