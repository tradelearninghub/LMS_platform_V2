import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { queryOne } from "@/lib/db";
import { validateCoupon } from "@/lib/coupons";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { code, courseId } = body;

    if (!code || !courseId) {
      return NextResponse.json(
        { error: "Code and courseId are required" },
        { status: 400 }
      );
    }

    // Fetch the course to get its selling price
    const course = await queryOne(
      "SELECT id, selling_price_cents FROM courses WHERE id = ? AND status = 'PUBLISHED'",
      [courseId]
    );

    if (!course) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }

    const result = await validateCoupon(code, courseId, course.selling_price_cents);

    if (!result.valid) {
      return NextResponse.json(
        { valid: false, error: result.error },
        { status: 200 }
      );
    }

    return NextResponse.json({
      valid: true,
      discountCents: result.discountCents,
      finalAmountCents: result.finalAmountCents,
      couponType: result.coupon?.type,
      discountKind: result.coupon?.discount_kind,
      discountValue: result.coupon?.discount_value,
    });
  } catch (error) {
    console.error("Coupon validation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
