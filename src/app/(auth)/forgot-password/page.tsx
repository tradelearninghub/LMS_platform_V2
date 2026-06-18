"use client";

import Link from "next/link";
import { useActionState } from "react";
import { forgotPasswordAction, type FormState } from "../actions";

const initialState: FormState = {};

export default function ForgotPasswordPage() {
  const [state, formAction, isPending] = useActionState(forgotPasswordAction, initialState);

  return (
    <div className="w-full max-w-sm mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Forgot Password</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Enter your email address and we will send you a reset link.
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
        </div>
      )}

      <form action={formAction} className="space-y-4">
        <label className="block">
          <span className="text-sm font-medium">Email Address</span>
          <input
            name="email"
            type="email"
            required
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="you@example.com"
          />
        </label>

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-md bg-primary px-4 py-2.5 text-primary-foreground font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {isPending ? "Sending Link…" : "Send Reset Link"}
        </button>
      </form>

      <p className="text-sm text-muted-foreground text-center">
        Remember your password?{" "}
        <Link href="/login" className="text-primary hover:underline font-medium">
          Sign In
        </Link>
      </p>
    </div>
  );
}
