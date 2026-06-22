"use server";

import { auth } from "@/auth";
import { queryOne, execute } from "@/lib/db";
import { generateOrderNumber } from "@/lib/utils";
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

  const orderNumber = generateOrderNumber();
  const orderId = crypto.randomUUID();

  await execute(
    `INSERT INTO orders (id, order_number, user_id, course_id, amount_cents, currency, status, payer_name, payer_mobile, transaction_id, payment_screenshot_url, student_notes) 
     VALUES (?, ?, ?, ?, ?, ?, 'PENDING', ?, ?, ?, ?, ?)`,
    [
      orderId,
      orderNumber,
      session.user.id,
      courseId,
      amountCents,
      currency,
      payerName,
      payerMobile,
      transactionId,
      paymentScreenshotUrl,
      studentNotes,
    ]
  );

  return { success: true, orderNumber };
}
