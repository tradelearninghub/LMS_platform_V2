"use client";

import { useActionState } from "react";
import { createOrderAction, type OrderState } from "./actions";

const initialState: OrderState = {};

export function BuyForm({
  courseId,
  amountCents,
  currency,
}: {
  courseId: string;
  amountCents: number;
  currency: string;
}) {
  const [state, formAction, isPending] = useActionState(createOrderAction, initialState);

  if (state.success) {
    return (
      <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-6 text-center">
        <svg className="w-12 h-12 text-green-600 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="text-lg font-semibold text-green-800">Order submitted!</h3>
        <p className="mt-1 text-sm text-green-700">
          Order #{state.orderNumber} is under review. You&apos;ll get access once an admin approves it.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="mt-6 rounded-xl border bg-card p-6 space-y-4">
      <h2 className="font-semibold">Submit payment proof</h2>

      {state.error && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          {state.error}
        </div>
      )}

      <input type="hidden" name="courseId" value={courseId} />
      <input type="hidden" name="amountCents" value={amountCents} />
      <input type="hidden" name="currency" value={currency} />

      <label className="block">
        <span className="text-sm font-medium">Your name</span>
        <input
          name="payerName"
          type="text"
          required
          className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium">Mobile number</span>
        <input
          name="payerMobile"
          type="tel"
          required
          className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium">Transaction ID / UTR</span>
        <input
          name="transactionId"
          type="text"
          required
          className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="e.g. UPI ref number"
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium">
          Payment screenshot URL{" "}
          <span className="text-muted-foreground font-normal">(Google Drive / Imgur link)</span>
        </span>
        <input
          name="paymentScreenshotUrl"
          type="url"
          className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="https://..."
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium">Notes <span className="text-muted-foreground font-normal">(optional)</span></span>
        <textarea
          name="studentNotes"
          rows={3}
          className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
        />
      </label>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-md bg-primary px-4 py-3 text-primary-foreground font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
      >
        {isPending ? "Submitting…" : "Submit Order"}
      </button>
    </form>
  );
}
