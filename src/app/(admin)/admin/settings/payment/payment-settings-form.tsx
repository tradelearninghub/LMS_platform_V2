"use client";

import { useActionState, useState, useRef } from "react";
import { updatePaymentSettingsAction } from "../../../actions";
import Image from "next/image";

type Settings = Record<string, unknown>;

export function PaymentSettingsForm({ settings }: { settings: Settings }) {
  const [state, formAction, isPending] = useActionState(updatePaymentSettingsAction, {} as any);
  const [qrPreview, setQrPreview] = useState<string>((settings.qrImageUrl as string) || "");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleQrUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError("");
    setUploading(true);

    try {
      const fd = new FormData();
      fd.append("file", file);

      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();

      if (!res.ok) {
        setUploadError(data.error || "Upload failed");
        return;
      }

      setQrPreview(data.url);
    } catch {
      setUploadError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <form action={formAction} className="rounded-xl border bg-card p-6 space-y-6">
      {state?.success && (
        <div className="rounded-md bg-green-50 border border-green-200 px-3 py-2 text-sm text-green-800">
          ✅ Payment settings saved!
        </div>
      )}

      <label className="flex items-center gap-2">
        <input name="enabled" type="checkbox" defaultChecked={settings.enabled as boolean} className="rounded" />
        <span className="text-sm font-medium">Enable QR payments</span>
      </label>

      {/* QR Code Image Upload */}
      <div className="space-y-3">
        <span className="text-sm font-medium block">Payment QR Code Image</span>
        
        {/* Hidden file input */}
        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
          onChange={handleQrUpload}
          className="hidden"
        />

        {/* Hidden input to pass the URL to the form action */}
        <input type="hidden" name="qrImageUrl" value={qrPreview} />

        <div className="flex items-start gap-4">
          {/* QR Preview */}
          <div className="flex-shrink-0 w-40 h-40 rounded-lg border-2 border-dashed border-input bg-muted/30 flex items-center justify-center overflow-hidden relative">
            {qrPreview ? (
              <Image
                src={qrPreview}
                alt="QR Code"
                fill
                className="object-contain p-1"
                unoptimized
              />
            ) : (
              <div className="text-center px-3">
                <svg className="w-8 h-8 mx-auto text-muted-foreground/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                </svg>
                <p className="text-xs text-muted-foreground mt-1">No QR uploaded</p>
              </div>
            )}
          </div>

          {/* Upload controls */}
          <div className="space-y-2">
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileRef.current?.click()}
              className="rounded-md bg-secondary px-4 py-2 text-sm font-medium hover:bg-secondary/80 disabled:opacity-50 transition-colors"
            >
              {uploading ? "Uploading…" : qrPreview ? "Change QR Image" : "Upload QR Image"}
            </button>
            {qrPreview && (
              <button
                type="button"
                onClick={() => setQrPreview("")}
                className="block text-xs text-destructive hover:underline"
              >
                Remove image
              </button>
            )}
            <p className="text-xs text-muted-foreground">
              PNG, JPG, WebP or GIF. Max 5MB.<br />
              Upload your UPI payment QR code image.
            </p>
            {uploadError && (
              <p className="text-xs text-destructive">{uploadError}</p>
            )}
          </div>
        </div>
      </div>

      {/* Simple fields (no bank details) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { name: "upiId", label: "UPI ID" },
          { name: "supportContact", label: "Support contact" },
        ].map((f) => (
          <label key={f.name} className="block">
            <span className="text-sm font-medium">{f.label}</span>
            <input name={f.name} defaultValue={(settings[f.name] as string) || ""} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
          </label>
        ))}
      </div>

      <label className="block">
        <span className="text-sm font-medium">Payment Instructions</span>
        <textarea name="instructions" rows={4} defaultValue={(settings.instructions as string) || ""} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none" />
      </label>

      <button type="submit" disabled={isPending} className="rounded-md bg-primary px-6 py-2 text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50">
        {isPending ? "Saving…" : "Save Settings"}
      </button>
    </form>
  );
}
