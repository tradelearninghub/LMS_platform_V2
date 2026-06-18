"use client";

import Link from "next/link";
import { useState, useActionState, useEffect } from "react";
import { sendOtpAction, loginWithOtpAction, type FormState } from "../actions";

export default function LoginOtpPage() {
  const [email, setEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const [sendState, sendAction, isSending] = useActionState(sendOtpAction, {});
  const [loginState, loginAction, isLoggingIn] = useActionState(loginWithOtpAction, {});

  useEffect(() => {
    if (sendState.success) {
      setOtpSent(true);
    }
  }, [sendState]);

  return (
    <div className="w-full max-w-sm mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Sign In with OTP</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {otpSent
            ? `We sent a 6-digit login code to ${email}`
            : "Enter your email address to receive a secure login OTP code."}
        </p>
      </div>

      {/* Errors */}
      {sendState.error && !otpSent && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          {sendState.error}
        </div>
      )}

      {loginState.error && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          {loginState.error}
        </div>
      )}

      {/* State 1: Request OTP */}
      {!otpSent ? (
        <form action={sendAction} className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium">Email Address</span>
            <input
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="you@example.com"
            />
          </label>

          <button
            type="submit"
            disabled={isSending}
            className="w-full rounded-md bg-primary px-4 py-2.5 text-primary-foreground font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {isSending ? "Sending OTP…" : "Get Login Code"}
          </button>
        </form>
      ) : (
        /* State 2: Verify OTP */
        <form action={loginAction} className="space-y-4">
          <input type="hidden" name="email" value={email} />

          <label className="block">
            <span className="text-sm font-medium">Enter 6-Digit OTP</span>
            <input
              name="otp"
              type="text"
              required
              maxLength={6}
              pattern="\d{6}"
              className="mt-1 w-full text-center tracking-widest text-lg font-semibold rounded-md border border-input bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="000000"
            />
          </label>

          <button
            type="submit"
            disabled={isLoggingIn}
            className="w-full rounded-md bg-primary px-4 py-2.5 text-primary-foreground font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {isLoggingIn ? "Logging in…" : "Verify & Sign In"}
          </button>

          <button
            type="button"
            onClick={() => setOtpSent(false)}
            className="w-full text-sm text-primary hover:underline text-center block mt-2"
          >
            Change Email
          </button>
        </form>
      )}

      <p className="text-sm text-muted-foreground text-center">
        Prefer standard password login?{" "}
        <Link href="/login" className="text-primary hover:underline font-medium">
          Sign In with Password
        </Link>
      </p>
    </div>
  );
}
