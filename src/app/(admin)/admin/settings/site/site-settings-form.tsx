"use client";

import { useActionState } from "react";
import { updateSiteSettingsAction } from "../../../actions";

type Settings = Record<string, string | null>;

function Field({ name, label, value, type = "text" }: { name: string; label: string; value?: string | null; type?: string }) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      <input
        name={name}
        type={type}
        defaultValue={value || ""}
        className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
      />
    </label>
  );
}

export function SiteSettingsForm({ settings }: { settings: Settings }) {
  const [state, formAction, isPending] = useActionState(updateSiteSettingsAction, {} as any);

  return (
    <form action={formAction} className="space-y-6">
      {state?.success && (
        <div className="rounded-md bg-green-50 border border-green-200 px-3 py-2 text-sm text-green-800">
          Settings saved!
        </div>
      )}

      <fieldset className="rounded-xl border bg-card p-5 space-y-4">
        <legend className="px-2 font-semibold text-sm">Branding</legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field name="siteName" label="Site name" value={settings.siteName} />
          <Field name="tagline" label="Tagline" value={settings.tagline} />
          <Field name="logoUrl" label="Logo URL" value={settings.logoUrl} />
          <Field name="faviconUrl" label="Favicon URL" value={settings.faviconUrl} />
          <Field name="primaryColor" label="Primary color" value={settings.primaryColor} type="color" />
          <Field name="accentColor" label="Accent color" value={settings.accentColor} type="color" />
        </div>
      </fieldset>

      <fieldset className="rounded-xl border bg-card p-5 space-y-4">
        <legend className="px-2 font-semibold text-sm">Contact</legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field name="contactEmail" label="Contact email" value={settings.contactEmail} type="email" />
          <Field name="contactPhone" label="Contact phone" value={settings.contactPhone} type="tel" />
          <Field name="address" label="Address" value={settings.address} />
        </div>
      </fieldset>

      <fieldset className="rounded-xl border bg-card p-5 space-y-4">
        <legend className="px-2 font-semibold text-sm">SEO Defaults</legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field name="seoTitle" label="Default title" value={settings.seoTitle} />
          <Field name="seoDescription" label="Default description" value={settings.seoDescription} />
          <Field name="seoKeywords" label="Keywords" value={settings.seoKeywords} />
          <Field name="ogImageUrl" label="OG image URL" value={settings.ogImageUrl} />
        </div>
      </fieldset>

      <fieldset className="rounded-xl border bg-card p-5 space-y-4">
        <legend className="px-2 font-semibold text-sm">Footer & Legal</legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field name="footerText" label="Footer text" value={settings.footerText} />
          <Field name="termsUrl" label="Terms URL" value={settings.termsUrl} />
          <Field name="privacyUrl" label="Privacy URL" value={settings.privacyUrl} />
          <Field name="refundUrl" label="Refund URL" value={settings.refundUrl} />
        </div>
      </fieldset>

      <fieldset className="rounded-xl border bg-card p-5 space-y-4">
        <legend className="px-2 font-semibold text-sm">Social Links</legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field name="facebookUrl" label="Facebook" value={settings.facebookUrl} />
          <Field name="twitterUrl" label="Twitter / X" value={settings.twitterUrl} />
          <Field name="youtubeUrl" label="YouTube" value={settings.youtubeUrl} />
          <Field name="instagramUrl" label="Instagram" value={settings.instagramUrl} />
          <Field name="linkedinUrl" label="LinkedIn" value={settings.linkedinUrl} />
          <Field name="whatsappNumber" label="WhatsApp number" value={settings.whatsappNumber} />
        </div>
      </fieldset>

      <fieldset className="rounded-xl border bg-card p-5 space-y-4">
        <legend className="px-2 font-semibold text-sm">Integrations</legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field name="googleAnalyticsId" label="Google Analytics ID" value={settings.googleAnalyticsId} />
          <Field name="metaPixelId" label="Meta Pixel ID" value={settings.metaPixelId} />
        </div>
      </fieldset>

      <button type="submit" disabled={isPending} className="rounded-md bg-primary px-6 py-2.5 text-primary-foreground font-medium hover:opacity-90 disabled:opacity-50">
        {isPending ? "Saving…" : "Save Settings"}
      </button>
    </form>
  );
}
