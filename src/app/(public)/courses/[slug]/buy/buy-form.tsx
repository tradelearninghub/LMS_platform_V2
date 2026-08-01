"use client";

import { useActionState, useState } from "react";
import { createOrderAction, type OrderState } from "./actions";
import { formatCurrency } from "@/lib/utils";

const initialState: OrderState = {};

export function BuyForm({
  courseId,
  sellingPriceCents,
  mrpCents,
  currency,
  userName,
  userEmail,
  courseTitle,
}: {
  courseId: string;
  sellingPriceCents: number;
  mrpCents: number;
  currency: string;
  userName: string;
  userEmail: string;
  courseTitle: string;
}) {
  const [state, formAction, isPending] = useActionState(createOrderAction, initialState);
  const [uploading, setUploading] = useState(false);
  const [screenshotUrl, setScreenshotUrl] = useState("");

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountCents: number;
    finalAmountCents: number;
  } | null>(null);
  const [couponError, setCouponError] = useState("");

  const currentFinalAmount = appliedCoupon ? appliedCoupon.finalAmountCents : sellingPriceCents;
  const currentDiscount = appliedCoupon ? appliedCoupon.discountCents : 0;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError("");

    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode, courseId }),
      });
      const data = await res.json();

      if (data.valid) {
        setAppliedCoupon({
          code: couponCode.trim().toUpperCase(),
          discountCents: data.discountCents,
          finalAmountCents: data.finalAmountCents,
        });
      } else {
        setCouponError(data.error || "Invalid coupon code");
      }
    } catch {
      setCouponError("Failed to validate coupon");
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    setUploading(true);
    const fileData = new FormData();
    fileData.append("file", e.target.files[0]);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fileData });
      const data = await res.json();
      if (data.url) setScreenshotUrl(data.url);
      else if (data.error) alert(data.error);
    } catch {
      alert("Upload failed.");
    } finally {
      setUploading(false);
    }
  };

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
    <div className="space-y-6 mt-6">
      {/* Price Summary Breakdown */}
      <div className="rounded-xl border bg-card p-6 space-y-3">
        <h3 className="font-semibold text-base">Order Summary</h3>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Course</span>
          <span className="font-medium">{courseTitle}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Base Price</span>
          <span className="font-medium">{formatCurrency(sellingPriceCents, currency)}</span>
        </div>

        {appliedCoupon && (
          <div className="flex items-center justify-between text-sm text-green-600">
            <span>Coupon Discount ({appliedCoupon.code})</span>
            <span>-{formatCurrency(currentDiscount, currency)}</span>
          </div>
        )}

        <div className="flex items-center justify-between text-lg font-bold border-t pt-3">
          <span>To Pay</span>
          <span className="text-accent">{formatCurrency(currentFinalAmount, currency)}</span>
        </div>
      </div>

      {/* Coupon / Referral input */}
      <div className="rounded-xl border bg-card p-6 space-y-3">
        <h3 className="font-semibold text-sm">Coupon or Referral Code</h3>
        {appliedCoupon ? (
          <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-md px-3 py-2 text-sm">
            <span className="font-mono font-semibold text-green-800">
              {appliedCoupon.code} applied (-{formatCurrency(appliedCoupon.discountCents, currency)})
            </span>
            <button
              type="button"
              onClick={handleRemoveCoupon}
              className="text-xs text-destructive hover:underline font-medium ml-2"
            >
              Remove
            </button>
          </div>
        ) : (
          <div>
            <div className="flex gap-2">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="Enter coupon/referral code"
                className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <button
                type="button"
                onClick={handleApplyCoupon}
                disabled={couponLoading || !couponCode.trim()}
                className="rounded-md bg-accent px-4 py-2 text-accent-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50"
              >
                {couponLoading ? "Applying..." : "Apply"}
              </button>
            </div>
            {couponError && <p className="text-xs text-destructive mt-1.5">{couponError}</p>}
          </div>
        )}
      </div>

      {/* Checkout Form */}
      <form action={formAction} className="rounded-xl border bg-card p-6 space-y-4">
        <h2 className="font-semibold text-lg">Submit Payment Proof</h2>

        {state.error && (
          <div className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
            {state.error}
          </div>
        )}

        <input type="hidden" name="courseId" value={courseId} />
        <input type="hidden" name="amountCents" value={sellingPriceCents} />
        <input type="hidden" name="currency" value={currency} />
        {appliedCoupon && <input type="hidden" name="appliedCode" value={appliedCoupon.code} />}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-xs font-medium text-muted-foreground">Student Name</span>
            <input
              name="payerName"
              type="text"
              defaultValue={userName}
              readOnly
              className="mt-1 w-full rounded-md border border-input bg-muted/50 px-3 py-2 text-sm text-muted-foreground select-none cursor-not-allowed"
            />
          </label>

          <label className="block">
            <span className="text-xs font-medium text-muted-foreground">Student Email</span>
            <input
              type="email"
              defaultValue={userEmail}
              readOnly
              className="mt-1 w-full rounded-md border border-input bg-muted/50 px-3 py-2 text-sm text-muted-foreground select-none cursor-not-allowed"
            />
          </label>
        </div>

        {appliedCoupon && (
          <label className="block">
            <span className="text-xs font-medium text-muted-foreground">Applied Code</span>
            <input
              type="text"
              value={appliedCoupon.code}
              readOnly
              className="mt-1 w-full rounded-md border border-input bg-muted/50 px-3 py-2 text-sm font-mono text-muted-foreground cursor-not-allowed"
            />
          </label>
        )}

        <label className="block">
          <span className="text-sm font-medium">Mobile Number <span className="text-destructive">*</span></span>
          <input
            name="payerMobile"
            type="tel"
            required
            placeholder="e.g. 9876543210"
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium">Transaction ID / UTR <span className="text-destructive">*</span></span>
          <input
            name="transactionId"
            type="text"
            required
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="e.g. 12-digit UPI reference number"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium">Payment Screenshot <span className="text-destructive">*</span></span>
          <input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            disabled={uploading}
            className="mt-1 w-full text-sm file:mr-4 file:rounded-md file:border-0 file:bg-primary/10 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-primary hover:file:bg-primary/20 focus:outline-none"
          />
          {uploading && <p className="text-xs text-muted-foreground mt-1">Uploading...</p>}
          {screenshotUrl && <p className="text-xs text-green-600 mt-1">Screenshot uploaded successfully!</p>}
          <input type="hidden" name="paymentScreenshotUrl" value={screenshotUrl} required />
        </label>

        <label className="block">
          <span className="text-sm font-medium">Notes <span className="text-muted-foreground font-normal">(optional)</span></span>
          <textarea
            name="studentNotes"
            rows={2}
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          />
        </label>

        <button
          type="submit"
          disabled={isPending || uploading || !screenshotUrl}
          className="w-full rounded-md bg-accent px-4 py-3 text-accent-foreground font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {isPending ? "Submitting…" : uploading ? "Uploading image…" : !screenshotUrl ? "Upload screenshot to submit" : `Submit Order (${formatCurrency(currentFinalAmount, currency)})`}
        </button>
      </form>
    </div>
  );
}

