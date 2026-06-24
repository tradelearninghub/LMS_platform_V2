"use client";

import { useActionState, useEffect, useRef } from "react";
import { sendContactMessageAction, type ContactState } from "./actions";

const initialState: ContactState = {};

export default function ContactForm() {
  const [state, formAction, isPending] = useActionState(sendContactMessageAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success && formRef.current) {
      formRef.current.reset();
    }
  }, [state.success]);

  return (
    <form action={formAction} ref={formRef} className="space-y-5">
      {state.error && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          {state.error}
        </div>
      )}

      {state.success && (
        <div className="rounded-md bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800">
          {state.success}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="block">
          <span className="text-sm font-medium">Your Name *</span>
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
          <span className="text-sm font-medium">Your Email Address *</span>
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
      </div>

      <label className="block">
        <span className="text-sm font-medium">Subject *</span>
        <input
          name="subject"
          type="text"
          required
          className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="How can we help you?"
        />
        {state.fieldErrors?.subject && (
          <p className="mt-1 text-xs text-destructive">{state.fieldErrors.subject[0]}</p>
        )}
      </label>

      <label className="block">
        <span className="text-sm font-medium">Message *</span>
        <textarea
          name="message"
          rows={6}
          required
          className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          placeholder="Please write your detailed message here..."
        />
        {state.fieldErrors?.message && (
          <p className="mt-1 text-xs text-destructive">{state.fieldErrors.message[0]}</p>
        )}
      </label>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-md bg-primary px-4 py-3 text-primary-foreground font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
      >
        {isPending ? "Sending message…" : "Send Message"}
      </button>
    </form>
  );
}
