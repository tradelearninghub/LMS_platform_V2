"use client";

import Link from "next/link";
import { useActionState, useState, useEffect } from "react";
import { loginAction, resendVerificationAction, type LoginState } from "../actions";
import { ArrowLeft, Mail, X } from "lucide-react";

const initialState: LoginState = {};

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);
  const [resendState, resendFormAction, isResendPending] = useActionState(resendVerificationAction, {});
  
  const [email, setEmail] = useState("");
  const [showVerifyModal, setShowVerifyModal] = useState(false);

  useEffect(() => {
    if (state.pendingVerification) {
      setShowVerifyModal(true);
    }
  }, [state]);

  return (
    <div>
      <div className="mb-6">
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors font-medium">
          <ArrowLeft className="w-3.5 h-3.5" />
          Go back to Home
        </Link>
      </div>

      <h1 className="text-2xl font-semibold">Sign in</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Access your courses and dashboard.
      </p>

      {state.error && (
        <div className="mt-4 rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          <div>{state.error}</div>
          {state.pendingVerification && (
            <button
              type="button"
              onClick={() => setShowVerifyModal(true)}
              className="mt-1.5 text-xs font-semibold underline hover:text-destructive/80 block"
            >
              Verify your email now &rarr;
            </button>
          )}
        </div>
      )}

      <form action={formAction} className="mt-6 space-y-4">
        <label className="block">
          <span className="text-sm font-medium">Email</span>
          <input
            name="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="you@example.com"
          />
          {state.fieldErrors?.email && (
            <p className="mt-1 text-xs text-destructive">{state.fieldErrors.email[0]}</p>
          )}
        </label>
        <label className="block">
          <span className="text-sm font-medium">Password</span>
          <input
            name="password"
            type="password"
            required
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="••••••••"
          />
          {state.fieldErrors?.password && (
            <p className="mt-1 text-xs text-destructive">{state.fieldErrors.password[0]}</p>
          )}
        </label>
        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-md bg-primary px-4 py-2.5 text-primary-foreground font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {isPending ? "Signing in…" : "Sign in"}
        </button>
      </form>
      <p className="mt-4 text-sm text-muted-foreground">
        No account?{" "}
        <Link href="/register" className="text-primary hover:underline">
          Create one
        </Link>
      </p>

      {/* Email Verification Modal */}
      {showVerifyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl border bg-card p-6 shadow-lg relative space-y-4">
            <button
              onClick={() => setShowVerifyModal(false)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 text-yellow-800 rounded-lg">
                <Mail className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-foreground">Verify Your Email</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Please verify your email address to access your account. If you didn't receive the verification email, you can request a new link below.
            </p>

            {resendState.success && (
              <div className="rounded-md bg-green-50 border border-green-200 p-3 text-sm text-green-800 font-medium">
                {resendState.success}
              </div>
            )}
            {resendState.error && (
              <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
                {resendState.error}
              </div>
            )}

            <form action={resendFormAction} className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="you@example.com"
                />
              </div>
              <button
                type="submit"
                disabled={isResendPending}
                className="w-full rounded-md bg-primary px-4 py-2 text-primary-foreground font-medium hover:opacity-90 disabled:opacity-50 transition-opacity text-sm"
              >
                {isResendPending ? "Sending link..." : "Resend Verification Link"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
