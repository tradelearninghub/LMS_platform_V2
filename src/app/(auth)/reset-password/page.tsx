"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useActionState, Suspense } from "react";
import { resetPasswordAction, type FormState } from "../actions";

const initialState: FormState = {};

function ResetPasswordFormContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [state, formAction, isPending] = useActionState(resetPasswordAction, initialState);

  return (
    <div className="w-full max-w-sm mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Reset Password</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Enter and confirm your new secure password.
        </p>
      </div>

      {state.error && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          {state.error}
        </div>
      )}

      {state.success && (
        <div className="rounded-md bg-green-500/10 border border-green-500/20 px-4 py-3 text-sm text-green-600">
          {state.success}
          <div className="mt-4">
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              Sign In
            </Link>
          </div>
        </div>
      )}

      {!state.success && (
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="token" value={token} />

          <label className="block">
            <span className="text-sm font-medium">New Password</span>
            <input
              name="password"
              type="password"
              required
              minLength={6}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="••••••••"
            />
            {state.fieldErrors?.password && (
              <p className="mt-1 text-xs text-destructive">{state.fieldErrors.password[0]}</p>
            )}
          </label>

          <label className="block">
            <span className="text-sm font-medium">Confirm Password</span>
            <input
              name="confirmPassword"
              type="password"
              required
              minLength={6}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="••••••••"
            />
            {state.fieldErrors?.confirmPassword && (
              <p className="mt-1 text-xs text-destructive">{state.fieldErrors.confirmPassword[0]}</p>
            )}
          </label>

          <button
            type="submit"
            disabled={isPending || !token}
            className="w-full rounded-md bg-primary px-4 py-2.5 text-primary-foreground font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {isPending ? "Resetting password…" : "Reset Password"}
          </button>

          {!token && (
            <p className="text-xs text-destructive text-center mt-2">
              Missing verification token. Check your email link.
            </p>
          )}
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="text-center py-10">Loading password reset...</div>}>
      <ResetPasswordFormContent />
    </Suspense>
  );
}
