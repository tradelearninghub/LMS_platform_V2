import { notFound } from "next/navigation";
import { queryOne } from "@/lib/db";
import { formatCurrency, formatDate } from "@/lib/utils";
import { OrderActions } from "../order-actions";
import Link from "next/link";
import Image from "next/image";

type Props = { params: Promise<{ id: string }> };

export const metadata = { title: "Order Details" };

export default async function OrderDetailsPage({ params }: Props) {
  const { id } = await params;
  
  const order = await queryOne(
    `SELECT o.*, u.name AS user_name, u.email AS user_email, c.title AS course_title
     FROM orders o
     JOIN users u ON o.user_id = u.id
     JOIN courses c ON o.course_id = c.id
     WHERE o.id = ?`,
    [id]
  );

  if (!order) notFound();

  const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    APPROVED: "bg-green-100 text-green-800",
    REJECTED: "bg-red-100 text-red-800",
    REFUNDED: "bg-gray-100 text-gray-800",
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin/orders" className="text-sm text-muted-foreground hover:underline mb-2 inline-block">
            &larr; Back to Orders
          </Link>
          <h1 className="text-2xl font-semibold">Order #{order.order_number}</h1>
        </div>
        {order.status === "PENDING" && (
          <OrderActions orderId={order.id} />
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Order Info */}
        <div className="rounded-xl border bg-card p-6 space-y-4">
          <h3 className="font-medium border-b pb-2">Order Information</h3>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Status</p>
              <span className={`inline-block mt-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${statusColors[order.status] || ""}`}>
                {order.status}
              </span>
            </div>
            <div>
              <p className="text-muted-foreground">Date</p>
              <p className="font-medium mt-1">{formatDate(order.created_at)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Amount</p>
              <p className="font-medium mt-1 text-lg">{formatCurrency(order.amount_cents, order.currency)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Course</p>
              <p className="font-medium mt-1">{order.course_title}</p>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="rounded-xl border bg-card p-6 space-y-4">
          <h3 className="font-medium border-b pb-2">User Information</h3>
          
          <div className="space-y-3 text-sm">
            <div>
              <p className="text-muted-foreground">Registered User</p>
              <p className="font-medium">{order.user_name} ({order.user_email})</p>
            </div>
            <div>
              <p className="text-muted-foreground">Payer Name (Form)</p>
              <p className="font-medium">{order.payer_name || "—"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Payer Mobile (Form)</p>
              <p className="font-medium">{order.payer_mobile || "—"}</p>
            </div>
          </div>
        </div>
        
        {/* Payment Details */}
        <div className="rounded-xl border bg-card p-6 space-y-4 md:col-span-2">
          <h3 className="font-medium border-b pb-2">Payment Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div className="space-y-4">
              <div>
                <p className="text-muted-foreground">Transaction ID / UTR</p>
                <p className="font-mono font-medium text-base mt-1 bg-muted p-2 rounded">{order.transaction_id || "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Student Notes</p>
                <p className="mt-1 bg-muted/50 p-3 rounded min-h-20 whitespace-pre-wrap">{order.student_notes || "No notes provided."}</p>
              </div>
              {order.status === "REJECTED" && order.rejection_reason && (
                <div>
                  <p className="text-red-600 font-medium">Rejection Reason</p>
                  <p className="mt-1 text-red-700 bg-red-50 p-3 rounded">{order.rejection_reason}</p>
                </div>
              )}
            </div>

            <div>
              <p className="text-muted-foreground mb-2">Payment Screenshot</p>
              {order.payment_screenshot_url ? (
                <div className="border rounded-lg overflow-hidden relative min-h-64 bg-muted flex items-center justify-center group">
                  <a href={order.payment_screenshot_url} target="_blank" rel="noreferrer" className="block w-full h-full">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={order.payment_screenshot_url} 
                      alt="Payment Screenshot" 
                      className="w-full h-auto max-h-96 object-contain"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <span className="text-white font-medium flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        View Full Image
                      </span>
                    </div>
                  </a>
                </div>
              ) : (
                <div className="border rounded-lg border-dashed h-40 flex items-center justify-center text-muted-foreground">
                  No screenshot uploaded.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
