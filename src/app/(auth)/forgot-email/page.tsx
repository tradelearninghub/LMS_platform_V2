"use client";

import Link from "next/link";
import { useActionState } from "react";
import { lookupEmailAction, type ForgotEmailState } from "../actions";
import { ArrowLeft, ShieldCheck, Mail, User, Phone } from "lucide-react";

const initialState: ForgotEmailState = {};

export default function ForgotEmailPage() {
  const [state, formAction, isPending] = useActionState(lookupEmailAction, initialState);

  return (
    <div className="w-full max-w-sm mx-auto space-y-6">
      <div>
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors font-medium mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Sign in
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Find Your Email</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Enter your registered full name and mobile number to look up your account email.
        </p>
      </div>

      {state.error && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          {state.error}
        </div>
      )}

      {state.success && state.maskedEmail ? (
        <div className="rounded-xl border bg-card p-5 space-y-4 shadow-sm">
          <div className="flex items-center gap-2.5 text-emerald-600 font-semibold text-sm">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <span>Account Found</span>
          </div>

          <div className="bg-muted/50 rounded-lg p-3.5 border text-center space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
              Masked Email Address
            </p>
            <p className="font-mono text-base font-bold text-foreground tracking-wide select-all">
              {state.maskedEmail}
            </p>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed">
            For security and privacy, only a masked version of your email is shown. Please use this email address on the login page.
          </p>

          <div className="pt-2">
            <Link
              href="/login"
              className="w-full inline-flex items-center justify-center rounded-md bg-primary px-4 py-2.5 text-primary-foreground font-medium hover:opacity-90 transition-opacity text-sm"
            >
              Back to Sign In
            </Link>
          </div>
        </div>
      ) : (
        <form action={formAction} className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-muted-foreground" />
              Registered Full Name
            </span>
            <input
              name="name"
              type="text"
              required
              placeholder="e.g. John Doe"
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-muted-foreground" />
              Registered Mobile Number
            </span>
            <input
              name="mobile"
              type="tel"
              required
              placeholder="e.g. 9876543210"
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </label>

          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-md bg-primary px-4 py-2.5 text-primary-foreground font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {isPending ? "Searching account…" : "Look Up Email"}
          </button>
        </form>
      )}

      <div className="text-xs text-muted-foreground text-center space-y-2 pt-2">
        <p>
          Remembered your email?{" "}
          <Link href="/login" className="text-primary hover:underline font-medium">
            Sign In
          </Link>
        </p>
        <p>
          Need to reset password?{" "}
          <Link href="/forgot-password" className="text-primary hover:underline font-medium">
            Forgot Password
          </Link>
        </p>
      </div>
    </div>
  );
}
