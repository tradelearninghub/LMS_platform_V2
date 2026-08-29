import { getSiteSettings } from "@/lib/settings";
import { SiteSettingsForm } from "./site-settings-form";

export const metadata = { title: "Site Settings" };

export const dynamic = "force-dynamic";


export default async function SiteSettingsPage() {
  const settings = await getSiteSettings();

  const mappedSettings = {
    id: settings.id,
    siteName: settings.siteName,
    tagline: settings.tagline,
    logoUrl: settings.logoUrl,
    contactEmail: settings.contactEmail,
    primaryColor: settings.primaryColor,
    accentColor: settings.accentColor,
    contactPhone: settings.contactPhone,
    address: settings.address,
    seoTitle: settings.seoTitle,
    seoDescription: settings.seoDescription,
    seoKeywords: settings.seoKeywords,
    ogImageUrl: settings.ogImageUrl,
    footerText: settings.footerText,
    termsUrl: settings.termsUrl,
    privacyUrl: settings.privacyUrl,
    refundUrl: settings.refundUrl,
    facebookUrl: settings.facebookUrl,
    twitterUrl: settings.twitterUrl,
    youtubeUrl: settings.youtubeUrl,
    instagramUrl: settings.instagramUrl,
    linkedinUrl: settings.linkedinUrl,
    whatsappNumber: settings.whatsappNumber,
    googleAnalyticsId: settings.googleAnalyticsId,
    metaPixelId: settings.metaPixelId,
    couponsEnabled: settings.coupons_enabled ? "true" : "false",
    referralsEnabled: settings.referrals_enabled ? "true" : "false",
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
