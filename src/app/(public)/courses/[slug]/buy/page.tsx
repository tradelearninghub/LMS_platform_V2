import { notFound, redirect } from "next/navigation";
import { queryOne, execute } from "@/lib/db";
import { auth } from "@/auth";
import { formatCurrency } from "@/lib/utils";
import { getPaymentSettings } from "@/lib/settings";
import { BuyForm } from "./buy-form";
import Image from "next/image";
import crypto from "crypto";

type Props = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";


export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const course = await queryOne(
    "SELECT title FROM courses WHERE slug = ? AND status = 'PUBLISHED'",
    [slug]
  ).catch(() => null);
  return { title: course ? `Buy ${course.title}` : "Course Not Found" };
}

export default async function BuyCoursePage({ params }: Props) {
  const { slug } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const course = await queryOne(
    "SELECT id, title, slug, price_cents, currency FROM courses WHERE slug = ? AND status = 'PUBLISHED'",
    [slug]
  ).catch(() => null);
  if (!course) notFound();

  // Already enrolled?
  const enrollment = await queryOne(
    "SELECT id FROM enrollments WHERE user_id = ? AND course_id = ? AND status = 'ACTIVE'",
    [session.user.id, course.id]
  ).catch(() => null);
  if (enrollment) redirect(`/learn/${slug}`);

  // Pending order?
  const pendingOrder = await queryOne(
    "SELECT * FROM orders WHERE user_id = ? AND course_id = ? AND status = 'PENDING' LIMIT 1",
    [session.user.id, course.id]
  ).catch(() => null);

  const paymentSettings = await getPaymentSettings();

  // Free course: auto-enroll
  if (course.price_cents === 0) {
    const enrollId = crypto.randomUUID();
    await execute(
      "INSERT INTO enrollments (id, user_id, course_id, status, source) VALUES (?, ?, ?, 'ACTIVE', 'purchase')",
      [enrollId, session.user.id, course.id]
    );
    redirect(`/learn/${slug}`);
  }

  return (
    <div className="container py-12 max-w-2xl">
      <h1 className="text-2xl font-semibold">Complete your purchase</h1>
      <p className="mt-1 text-muted-foreground">
        Pay for <strong>{course.title}</strong> and upload proof of payment.
      </p>

      {pendingOrder && (
        <div className="mt-4 rounded-md bg-yellow-50 border border-yellow-200 px-4 py-3 text-sm text-yellow-800">
          You already have a pending order (#{pendingOrder.order_number}) for this course.
          Our team is reviewing it. You&apos;ll be notified once it&apos;s approved.
        </div>
      )}

      {/* Payment details */}
      <div className="mt-8 rounded-xl border bg-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Course</span>
          <span className="font-medium">{course.title}</span>
        </div>
        <div className="flex items-center justify-between border-t pt-4">
          <span className="text-sm text-muted-foreground">Amount</span>
          <span className="text-xl font-bold">
            {formatCurrency(course.price_cents, course.currency)}
          </span>
        </div>
      </div>

      {/* Payment instructions */}
      <div className="mt-6 rounded-xl border bg-card p-6 space-y-5">
        <h2 className="font-semibold text-lg">Payment Instructions</h2>

        {/* QR Code Image */}
        {paymentSettings.qr_image_url && (
          <div className="flex flex-col items-center gap-3 py-4 bg-muted/30 rounded-lg">
            <p className="text-sm font-medium text-muted-foreground">Scan the QR code to pay</p>
            <div className="relative w-52 h-52 bg-white rounded-lg shadow-sm border p-2">
              <Image
                src={paymentSettings.qr_image_url}
                alt="Payment QR Code"
                fill
                className="object-contain p-1"
                unoptimized
              />
            </div>
          </div>
        )}

        {paymentSettings.upi_id && (
          <div className="flex items-center justify-between text-sm border-t pt-3">
            <span className="text-muted-foreground">UPI ID</span>
            <span className="font-mono font-medium bg-muted px-2 py-0.5 rounded select-all">
              {paymentSettings.upi_id}
            </span>
          </div>
        )}

        {paymentSettings.instructions && (
          <p className="text-sm text-muted-foreground border-t pt-3 whitespace-pre-line">
            {paymentSettings.instructions}
          </p>
        )}

        {paymentSettings.support_contact && (
          <p className="text-xs text-muted-foreground border-t pt-3">
            Need help? Contact: <strong>{paymentSettings.support_contact}</strong>
          </p>
        )}
      </div>

      {/* Order form */}
      {!pendingOrder && (
        <BuyForm courseId={course.id} amountCents={course.price_cents} currency={course.currency} />
      )}
    </div>
  );
}
