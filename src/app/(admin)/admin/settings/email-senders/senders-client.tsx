"use client";

import { useActionState, useState, useTransition } from "react";
import {
  createEmailSenderAction,
  updateEmailSenderAction,
  deleteEmailSenderAction,
  testEmailSenderAction,
} from "@/app/(admin)/actions";
import type { EmailSender } from "@/lib/settings";

export function EmailSendersClient({ initialSenders }: { initialSenders: EmailSender[] }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSender, setEditingSender] = useState<EmailSender | null>(null);
  const [testingSender, setTestingSender] = useState<EmailSender | null>(null);

  const [createState, createAction, isCreating] = useActionState(createEmailSenderAction, { error: "", success: false });
  const [updateState, updateAction, isUpdating] = useActionState(updateEmailSenderAction, { error: "", success: false });
  const [testState, testAction, isTesting] = useActionState(testEmailSenderAction, { error: "", success: false });

  const [isPending, startTransition] = useTransition();

  const handleDelete = (id: string) => {
    if (confirm("Delete this email sender profile?")) {
      startTransition(async () => {
        await deleteEmailSenderAction(id);
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Email Senders</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage multiple SMTP email sender profiles for transactional emails.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="rounded-md bg-primary px-4 py-2 text-primary-foreground text-sm font-medium hover:opacity-90"
        >
          + Add Sender Profile
        </button>
      </div>

      {/* Senders Table */}
      <div className="rounded-xl border bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Label</th>
              <th className="px-4 py-3 text-left font-medium">Sender Email</th>
              <th className="px-4 py-3 text-left font-medium">SMTP Host</th>
              <th className="px-4 py-3 text-left font-medium">Default</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {initialSenders.map((sender) => (
              <tr key={sender.id} className="hover:bg-muted/30">
                <td className="px-4 py-3 font-medium">{sender.label}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {sender.sender_name} &lt;{sender.sender_email}&gt;
                </td>
                <td className="px-4 py-3 font-mono text-xs">{sender.smtp_host}:{sender.smtp_port}</td>
                <td className="px-4 py-3">
                  {sender.is_default ? (
                    <span className="rounded bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 uppercase">
                      Default
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    sender.active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                  }`}>
                    {sender.active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right space-x-2">
                  <button
                    onClick={() => setTestingSender(sender)}
                    className="text-xs text-blue-600 hover:underline font-medium"
                  >
                    Test Email
                  </button>
                  <button
                    onClick={() => setEditingSender(sender)}
                    className="text-xs text-primary hover:underline font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(sender.id)}
                    disabled={isPending}
                    className="text-xs text-destructive hover:underline font-medium"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {initialSenders.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">No email sender profiles configured.</div>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-card rounded-xl border max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Add Sender Profile</h2>
              <button onClick={() => setShowAddModal(false)} className="text-muted-foreground hover:text-foreground">✕</button>
            </div>

            {createState.error && (
              <div className="text-xs text-destructive bg-destructive/10 p-2.5 rounded">{createState.error}</div>
            )}

            <form action={createAction} className="space-y-4">
              <label className="block">
                <span className="text-xs font-medium">Internal Profile Label</span>
                <input name="label" type="text" required placeholder="e.g. Support Email or Receipts Sender" className="mt-1 w-full rounded-md border px-3 py-2 text-sm" />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-xs font-medium">Sender Name</span>
                  <input name="senderName" type="text" required placeholder="Trade Learning Hub" className="mt-1 w-full rounded-md border px-3 py-2 text-sm" />
                </label>
                <label className="block">
                  <span className="text-xs font-medium">Sender Email</span>
                  <input name="senderEmail" type="email" required placeholder="support@tradelearninghub.in" className="mt-1 w-full rounded-md border px-3 py-2 text-sm" />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-xs font-medium">SMTP Host</span>
                  <input name="smtpHost" type="text" required placeholder="smtp.gmail.com" className="mt-1 w-full rounded-md border px-3 py-2 text-sm font-mono" />
                </label>
                <label className="block">
                  <span className="text-xs font-medium">SMTP Port</span>
                  <input name="smtpPort" type="number" defaultValue={587} required className="mt-1 w-full rounded-md border px-3 py-2 text-sm font-mono" />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-xs font-medium">SMTP Username</span>
                  <input name="smtpUsername" type="text" className="mt-1 w-full rounded-md border px-3 py-2 text-sm font-mono" />
                </label>
                <label className="block">
                  <span className="text-xs font-medium">SMTP Password</span>
                  <input name="smtpPassword" type="password" className="mt-1 w-full rounded-md border px-3 py-2 text-sm font-mono" />
                </label>
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2">
                  <input name="smtpSecure" type="checkbox" defaultChecked className="rounded" />
                  <span className="text-sm font-medium">Use TLS/SSL</span>
                </label>

                <label className="flex items-center gap-2">
                  <input name="isDefault" type="checkbox" className="rounded" />
                  <span className="text-sm font-medium">Set as Default Sender</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 text-sm rounded-md border">Cancel</button>
                <button type="submit" disabled={isCreating} className="px-4 py-2 text-sm rounded-md bg-primary text-primary-foreground font-medium">
                  {isCreating ? "Saving..." : "Save Profile"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingSender && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-card rounded-xl border max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Edit Sender ({editingSender.label})</h2>
              <button onClick={() => setEditingSender(null)} className="text-muted-foreground hover:text-foreground">✕</button>
            </div>

            {updateState.error && (
              <div className="text-xs text-destructive bg-destructive/10 p-2.5 rounded">{updateState.error}</div>
            )}

            <form action={updateAction} className="space-y-4">
              <input type="hidden" name="id" value={editingSender.id} />

              <label className="block">
                <span className="text-xs font-medium">Internal Profile Label</span>
                <input name="label" type="text" defaultValue={editingSender.label} required className="mt-1 w-full rounded-md border px-3 py-2 text-sm" />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-xs font-medium">Sender Name</span>
                  <input name="senderName" type="text" defaultValue={editingSender.sender_name} required className="mt-1 w-full rounded-md border px-3 py-2 text-sm" />
                </label>
                <label className="block">
                  <span className="text-xs font-medium">Sender Email</span>
                  <input name="senderEmail" type="email" defaultValue={editingSender.sender_email} required className="mt-1 w-full rounded-md border px-3 py-2 text-sm" />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-xs font-medium">SMTP Host</span>
                  <input name="smtpHost" type="text" defaultValue={editingSender.smtp_host} required className="mt-1 w-full rounded-md border px-3 py-2 text-sm font-mono" />
                </label>
                <label className="block">
                  <span className="text-xs font-medium">SMTP Port</span>
                  <input name="smtpPort" type="number" defaultValue={editingSender.smtp_port} required className="mt-1 w-full rounded-md border px-3 py-2 text-sm font-mono" />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-xs font-medium">SMTP Username</span>
                  <input name="smtpUsername" type="text" defaultValue={editingSender.smtp_username} className="mt-1 w-full rounded-md border px-3 py-2 text-sm font-mono" />
                </label>
                <label className="block">
                  <span className="text-xs font-medium">SMTP Password</span>
                  <input name="smtpPassword" type="password" defaultValue={editingSender.smtp_password} className="mt-1 w-full rounded-md border px-3 py-2 text-sm font-mono" />
                </label>
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2">
                  <input name="smtpSecure" type="checkbox" defaultChecked={!!editingSender.smtp_secure} className="rounded" />
                  <span className="text-sm font-medium">Use TLS/SSL</span>
                </label>

                <label className="flex items-center gap-2">
                  <input name="isDefault" type="checkbox" defaultChecked={!!editingSender.is_default} className="rounded" />
                  <span className="text-sm font-medium">Default Sender</span>
                </label>

                <label className="flex items-center gap-2">
                  <input name="active" type="checkbox" defaultChecked={!!editingSender.active} className="rounded" />
                  <span className="text-sm font-medium">Active</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button type="button" onClick={() => setEditingSender(null)} className="px-4 py-2 text-sm rounded-md border">Cancel</button>
                <button type="submit" disabled={isUpdating} className="px-4 py-2 text-sm rounded-md bg-primary text-primary-foreground font-medium">
                  {isUpdating ? "Saving..." : "Update Profile"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Test Email Modal */}
      {testingSender && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-card rounded-xl border max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Send Test Email ({testingSender.label})</h2>
              <button onClick={() => setTestingSender(null)} className="text-muted-foreground hover:text-foreground">✕</button>
            </div>

            {testState.success && (
              <div className="text-xs text-green-700 bg-green-50 border border-green-200 p-3 rounded">
                Test email sent successfully! Check your inbox.
              </div>
            )}
            {testState.error && (
              <div className="text-xs text-destructive bg-destructive/10 p-2.5 rounded">{testState.error}</div>
            )}

            <form action={testAction} className="space-y-4">
              <input type="hidden" name="smtpHost" value={testingSender.smtp_host} />
              <input type="hidden" name="smtpPort" value={testingSender.smtp_port} />
              <input type="hidden" name="smtpUsername" value={testingSender.smtp_username} />
              <input type="hidden" name="smtpPassword" value={testingSender.smtp_password} />
              <input type="hidden" name="smtpSecure" value={testingSender.smtp_secure ? "on" : "off"} />
              <input type="hidden" name="senderEmail" value={testingSender.sender_email} />
              <input type="hidden" name="senderName" value={testingSender.sender_name} />

              <label className="block">
                <span className="text-xs font-medium">Recipient Email Address</span>
                <input name="toEmail" type="email" required placeholder="your.email@example.com" className="mt-1 w-full rounded-md border px-3 py-2 text-sm" />
              </label>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setTestingSender(null)} className="px-4 py-2 text-sm rounded-md border">Close</button>
                <button type="submit" disabled={isTesting} className="px-4 py-2 text-sm rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700">
                  {isTesting ? "Sending..." : "Send Test"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
