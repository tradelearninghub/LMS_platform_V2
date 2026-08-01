import { queryOne } from "./db";
import { getSiteSettings } from "./settings";

export interface CouponRow {
  id: string;
  code: string;
  type: "COUPON" | "REFERRAL";
  discount_kind: "FLAT" | "PERCENT";
  discount_value: number;
  active: boolean;
  course_id: string | null;
}

export interface CouponValidationResult {
  valid: boolean;
  error?: string;
  coupon?: CouponRow;
  discountCents?: number;
  finalAmountCents?: number;
}

/**
 * Validates a coupon/referral code against a specific course.
 * Checks: code exists, is active, global toggle is enabled, course scope matches.
 */
export async function validateCoupon(
  code: string,
  courseId: string,
  sellingPriceCents: number
): Promise<CouponValidationResult> {
  if (!code || !code.trim()) {
    return { valid: false, error: "No code provided" };
  }

  const coupon = await queryOne(
    "SELECT * FROM coupons WHERE code = ? AND active = TRUE",
    [code.trim().toUpperCase()]
  ) as CouponRow | null;

  if (!coupon) {
    return { valid: false, error: "Invalid or inactive code" };
  }

  // Check global toggles
  const siteSettings = await getSiteSettings();
  if (coupon.type === "COUPON" && !siteSettings.coupons_enabled) {
    return { valid: false, error: "Coupons are currently disabled" };
  }
  if (coupon.type === "REFERRAL" && !siteSettings.referrals_enabled) {
    return { valid: false, error: "Referral codes are currently disabled" };
  }

  // Check course scope
  if (coupon.course_id && coupon.course_id !== courseId) {
    return { valid: false, error: "This code does not apply to this course" };
  }

  // Calculate discount
  const { discountCents, finalAmountCents } = calculateDiscount(
    sellingPriceCents,
    coupon
  );

  return {
    valid: true,
    coupon,
    discountCents,
    finalAmountCents,
  };
}

/**
 * Applies the coupon discount and rounds UP to the nearest whole rupee.
 * E.g., 2599.76 → 2600 (260000 paise).
 */
export function calculateDiscount(
  sellingPriceCents: number,
  coupon: CouponRow
): { discountCents: number; finalAmountCents: number } {
  let discountCents = 0;

  if (coupon.discount_kind === "FLAT") {
    // discount_value is in rupees for FLAT, convert to paise
    discountCents = coupon.discount_value * 100;
  } else if (coupon.discount_kind === "PERCENT") {
    // discount_value is percentage points
    discountCents = Math.floor((sellingPriceCents * coupon.discount_value) / 100);
  }

  // Ensure discount doesn't exceed the price
  discountCents = Math.min(discountCents, sellingPriceCents);

  const rawFinalCents = sellingPriceCents - discountCents;

  // Round UP to nearest whole rupee (100 paise)
  const finalAmountCents = Math.ceil(rawFinalCents / 100) * 100;

  // Recalculate effective discount after rounding
  const effectiveDiscount = sellingPriceCents - finalAmountCents;

  return {
    discountCents: effectiveDiscount,
    finalAmountCents,
  };
}
