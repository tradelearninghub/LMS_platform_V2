"use server";

import { auth } from "@/auth";
import { queryOne, execute } from "@/lib/db";
import { generateOrderNumber } from "@/lib/utils";
import { validateCoupon } from "@/lib/coupons";
import { sendEventEmail } from "@/lib/email";
import crypto from "crypto";

export type OrderState = {
  error?: string;
  success?: boolean;
  orderNumber?: string;
};

export async function createOrderAction(
  _prev: OrderState,
  formData: FormData
): Promise<OrderState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Please sign in to place an order." };

  const courseId = formData.get("courseId") as string;
  const amountCents = parseInt(formData.get("amountCents") as string, 10);
  const currency = formData.get("currency") as string;
  const payerName = formData.get("payerName") as string;
  const payerMobile = formData.get("payerMobile") as string;
  const transactionId = formData.get("transactionId") as string;
  const paymentScreenshotUrl = (formData.get("paymentScreenshotUrl") as string) || null;
  const studentNotes = (formData.get("studentNotes") as string) || null;
  const appliedCode = (formData.get("appliedCode") as string)?.trim().toUpperCase() || null;

  if (!courseId || !payerName || !payerMobile || !transactionId || !paymentScreenshotUrl) {
    return { error: "Please fill in all required fields, including the payment screenshot." };
  }

  // Verify course exists
  const course = await queryOne("SELECT * FROM courses WHERE id = ?", [courseId]);
  if (!course) return { error: "Course not found." };

  // Check for existing pending order
  const existing = await queryOne(
    "SELECT * FROM orders WHERE user_id = ? AND course_id = ? AND status = 'PENDING' LIMIT 1",
    [session.user.id, courseId]
  );
  if (existing) return { error: "You already have a pending order for this course." };

  // Check if already enrolled
  const enrolled = await queryOne(
    "SELECT * FROM enrollments WHERE user_id = ? AND course_id = ?",
    [session.user.id, courseId]
  );
  if (enrolled && enrolled.status === "ACTIVE") return { error: "You are already enrolled in this course." };

  const sellingPrice = course.selling_price_cents || course.price_cents || amountCents;
  let finalAmountCents = sellingPrice;
  let discountCents = 0;

  if (appliedCode) {
    const couponValidation = await validateCoupon(appliedCode, courseId, sellingPrice);
    if (couponValidation.valid && couponValidation.finalAmountCents !== undefined) {
      finalAmountCents = couponValidation.finalAmountCents;
      discountCents = couponValidation.discountCents || 0;
    }
  }

  const orderNumber = generateOrderNumber();
  const orderId = crypto.randomUUID();

  await execute(
    `INSERT INTO orders (id, order_number, user_id, course_id, amount_cents, applied_code, discount_cents, final_amount_cents, currency, status, payer_name, payer_mobile, transaction_id, payment_screenshot_url, student_notes) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', ?, ?, ?, ?, ?)`,
    [
      orderId,
      orderNumber,
      session.user.id,
      courseId,
      sellingPrice,
      appliedCode,
      discountCents,
      finalAmountCents,
      currency,
      payerName,
      payerMobile,
      transactionId,
      paymentScreenshotUrl,
      studentNotes,
    ]
  );

  // Send PAYMENT_RECEIVED notification to student
  try {
    const user = await queryOne("SELECT name, email FROM users WHERE id = ?", [session.user.id]);
    if (user?.email) {
      const formattedAmount = (finalAmountCents / 100).toLocaleString("en-IN", {
        style: "currency",
        currency: currency || "INR",
      });
      const orderDate = new Date().toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });

      await sendEventEmail("PAYMENT_RECEIVED", user.email, {
        user_name: payerName || user.name || "Student",
        user_email: user.email,
        course_name: course.title,
        course_title: course.title,
        amount: formattedAmount,
        order_number: orderNumber,
        transaction_id: transactionId,
        order_date: orderDate,
      });
    }
  } catch (e) {
    console.error("[BuyAction] Failed to send PAYMENT_RECEIVED email:", e);
  }

  return { success: true, orderNumber };
}
