"use client";

import { useActionState } from "react";
import { updatePaymentSettingsAction } from "../../../actions";

type Settings = Record<string, unknown>;

export function PaymentSettingsForm({ settings }: { settings: Settings }) {
  const [state, formAction, isPending] = useActionState(updatePaymentSettingsAction, {} as any);

  return (
    <form action={formAction} className="rounded-xl border bg-card p-6 space-y-4">
      {state?.success && (
        <div className="rounded-md bg-green-50 border border-green-200 px-3 py-2 text-sm text-green-800">Saved!</div>
      )}

      <label className="flex items-center gap-2">
        <input name="enabled" type="checkbox" defaultChecked={settings.enabled as boolean} className="rounded" />
        <span className="text-sm font-medium">Enable QR payments</span>
      </label>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { name: "upiId", label: "UPI ID" },
          { name: "qrImageUrl", label: "QR Image URL" },
          { name: "accountHolderName", label: "Account holder name" },
          { name: "bankName", label: "Bank name" },
          { name: "accountNumber", label: "Account number" },
          { name: "ifscCode", label: "IFSC code" },
          { name: "supportContact", label: "Support contact" },
        ].map((f) => (
          <label key={f.name} className="block">
            <span className="text-sm font-medium">{f.label}</span>
            <input name={f.name} defaultValue={(settings[f.name] as string) || ""} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
          </label>
        ))}
      </div>

      <label className="block">
        <span className="text-sm font-medium">Instructions</span>
        <textarea name="instructions" rows={4} defaultValue={(settings.instructions as string) || ""} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none" />
      </label>

      <button type="submit" disabled={isPending} className="rounded-md bg-primary px-6 py-2 text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50">
        {isPending ? "Saving…" : "Save"}
      </button>
    </form>
  );
}
