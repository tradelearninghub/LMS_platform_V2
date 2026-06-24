"use client";

import Link from "next/link";
import { useActionState, useState, useEffect } from "react";
import { registerAction, type RegisterState } from "../actions";
import { ArrowLeft, Mail, X } from "lucide-react";

const initialState: RegisterState = {};

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(registerAction, initialState);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    if (state.success) {
      setShowSuccessModal(true);
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

      <h1 className="text-2xl font-semibold">Create account</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Register to purchase and access courses.
      </p>

      {state.error && (
        <div className="mt-4 rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          {state.error}
        </div>
      )}

      {state.success && (
        <div className="mt-4 rounded-md bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800 font-medium">
          {state.success}
        </div>
      )}


      <form action={formAction} className="mt-6 space-y-4">
        <label className="block">
          <span className="text-sm font-medium">Full name</span>
          <input
            name="name"
            type="text"
            required
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="John Doe"
          />
          {state.fieldErrors?.name && (
            <p className="mt-1 text-xs text-destructive">{state.fieldErrors.name[0]}</p>
          )}
        </label>

        <label className="block">
          <span className="text-sm font-medium">Email</span>
          <input
            name="email"
            type="email"
            required
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="you@example.com"
          />
          {state.fieldErrors?.email && (
            <p className="mt-1 text-xs text-destructive">{state.fieldErrors.email[0]}</p>
          )}
        </label>

        <label className="block">
          <span className="text-sm font-medium">Mobile <span className="text-muted-foreground font-normal">(optional)</span></span>
          <input
            name="mobile"
            type="tel"
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="+91 98765 43210"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium">Password</span>
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
          <span className="text-sm font-medium">Confirm password</span>
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
          disabled={isPending}
          className="w-full rounded-md bg-primary px-4 py-2.5 text-primary-foreground font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {isPending ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="mt-4 text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="text-primary hover:underline">
          Sign in
        </Link>
      </p>

      {/* Registration Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl border bg-card p-6 shadow-lg relative space-y-4">
            <button
              onClick={() => setShowSuccessModal(false)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 text-green-800 rounded-lg">
                <Mail className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-foreground">Registration Successful!</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              We have sent a verification link to your email address. Please click the link to confirm your email and activate your account.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <Link
                href="/login"
                className="flex-1 text-center rounded-md bg-primary px-4 py-2 text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Sign In
              </Link>
              <button
                type="button"
                onClick={() => setShowSuccessModal(false)}
                className="flex-1 text-center rounded-md border border-input px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
