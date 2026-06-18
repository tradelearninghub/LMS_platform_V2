"use client";

import { useActionState } from "react";
import { updateProfileAction, type ProfileState } from "../../actions";

const initialState: ProfileState = {};

interface ProfileFormProps {
  user: {
    name?: string | null;
    mobile?: string | null;
    bio?: string | null;
  } | null;
}

export function ProfileForm({ user }: ProfileFormProps) {
  const [state, formAction, isPending] = useActionState(updateProfileAction, initialState);

  return (
    <div className="space-y-4">
      {state.success && (
        <div className="rounded-md bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800">
          Profile updated successfully.
        </div>
      )}
      {state.error && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          {state.error}
        </div>
      )}

      <form action={formAction} className="space-y-4">
        <label className="block">
          <span className="text-sm font-medium">Full name</span>
          <input
            name="name"
            type="text"
            required
            defaultValue={user?.name || ""}
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium">
            Mobile <span className="text-muted-foreground font-normal">(optional)</span>
          </span>
          <input
            name="mobile"
            type="tel"
            defaultValue={user?.mobile || ""}
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium">
            Bio <span className="text-muted-foreground font-normal">(optional)</span>
          </span>
          <textarea
            name="bio"
            rows={4}
            defaultValue={user?.bio || ""}
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          />
        </label>

        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-primary px-6 py-2.5 text-primary-foreground font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {isPending ? "Saving…" : "Save changes"}
        </button>
      </form>
    </div>
  );
}
