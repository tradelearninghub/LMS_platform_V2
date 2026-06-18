"use client";

import Link from "next/link";
import { useActionState } from "react";
import { registerAction, type RegisterState } from "../actions";

const initialState: RegisterState = {};

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(registerAction, initialState);

  return (
    <div>
      <h1 className="text-2xl font-semibold">Create account</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Register to purchase and access courses.
      </p>

      {state.error && (
        <div className="mt-4 rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          {state.error}
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
    </div>
  );
}
