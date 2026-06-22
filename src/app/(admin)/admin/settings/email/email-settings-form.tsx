"use client";

import { useActionState } from "react";
import { updateEmailSettingsAction, testEmailSettingsAction } from "../../../actions";

type Settings = Record<string, unknown>;

export function EmailSettingsForm({ settings }: { settings: Settings }) {
  const [state, formAction, isPending] = useActionState(updateEmailSettingsAction, {} as any);
  const [testState, testFormAction, isTesting] = useActionState(testEmailSettingsAction, {} as any);

  return (
    <form action={formAction} className="rounded-xl border bg-card p-6 space-y-4">
      {state?.success && (
        <div className="rounded-md bg-green-50 border border-green-200 px-3 py-2 text-sm text-green-800">Saved!</div>
      )}

      <label className="flex items-center gap-2">
        <input name="enabled" type="checkbox" defaultChecked={settings.enabled as boolean} className="rounded" />
        <span className="text-sm font-medium">Enable email sending</span>
      </label>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="block">
          <span className="text-sm font-medium">SMTP Host</span>
          <input name="smtpHost" defaultValue={(settings.smtpHost as string) || ""} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">SMTP Port</span>
          <input name="smtpPort" type="number" defaultValue={(settings.smtpPort as number) || 587} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Username</span>
          <input name="smtpUsername" defaultValue={(settings.smtpUsername as string) || ""} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Password</span>
          <input name="smtpPassword" type="password" defaultValue={(settings.smtpPassword as string) || ""} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
        </label>
        <label className="flex items-center gap-2">
          <input name="smtpSecure" type="checkbox" defaultChecked={settings.smtpSecure as boolean} className="rounded" />
          <span className="text-sm font-medium">Use TLS/SSL</span>
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
        <label className="block">
          <span className="text-sm font-medium">Sender email</span>
          <input name="senderEmail" type="email" defaultValue={(settings.senderEmail as string) || ""} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Sender name</span>
          <input name="senderName" defaultValue={(settings.senderName as string) || ""} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Reply-to</span>
          <input name="replyTo" type="email" defaultValue={(settings.replyTo as string) || ""} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
        </label>
      </div>

      <div className="flex flex-col gap-4 border-t pt-4">
        <button type="submit" disabled={isPending || isTesting} className="rounded-md bg-primary px-6 py-2 text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50 self-start">
          {isPending ? "Saving…" : "Save"}
        </button>
      </div>

      <div className="border-t pt-4 space-y-4">
        <h3 className="text-sm font-semibold text-foreground">Test SMTP Settings</h3>
        <p className="text-xs text-muted-foreground">
          Enter a recipient email below to send a test message using the SMTP credentials entered above.
        </p>
        <div className="flex gap-2 items-end max-w-md">
          <label className="flex-1">
            <span className="text-xs font-medium">Test Recipient Email</span>
            <input name="toEmail" type="email" placeholder="recipient@example.com" className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
          </label>
          <button
            formAction={testFormAction}
            disabled={isPending || isTesting}
            className="rounded-md border bg-secondary px-4 py-2 text-sm font-medium hover:bg-secondary/80 disabled:opacity-50 h-9"
          >
            {isTesting ? "Testing…" : "Send Test Email"}
          </button>
        </div>
        {testState?.success && (
          <p className="text-xs text-green-700 font-medium">✅ Test email sent successfully! Please check your inbox.</p>
        )}
        {testState?.error && (
          <p className="text-xs text-destructive font-medium">❌ Test failed: {testState.error}</p>
        )}
      </div>
    </form>
  );
}
