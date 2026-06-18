import { query } from "@/lib/db";
import { formatCurrency, formatDate } from "@/lib/utils";
import { OrderActions } from "./order-actions";

export const metadata = { title: "Manage Orders" };

export default async function AdminOrdersPage() {
  // Fetch orders with student and course details using raw SQL join
  const orders = await query(
    `SELECT o.*, u.name AS user_name, u.email AS user_email, c.title AS course_title
     FROM orders o
     JOIN users u ON o.user_id = u.id
     JOIN courses c ON o.course_id = c.id
     ORDER BY o.created_at DESC`
  );

  const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    APPROVED: "bg-green-100 text-green-800",
    REJECTED: "bg-red-100 text-red-800",
    REFUNDED: "bg-gray-100 text-gray-800",
    INFO_REQUESTED: "bg-blue-100 text-blue-800",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Orders</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Review and approve student payments.
        </p>
      </div>

      <div className="rounded-xl border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Order #</th>
              <th className="px-4 py-3 text-left font-medium">Student</th>
              <th className="px-4 py-3 text-left font-medium">Course</th>
              <th className="px-4 py-3 text-left font-medium">Amount</th>
              <th className="px-4 py-3 text-left font-medium">Txn ID</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-left font-medium">Date</th>
              <th className="px-4 py-3 text-left font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-muted/30">
                <td className="px-4 py-3 font-mono text-xs">{order.order_number}</td>
                <td className="px-4 py-3">
                  <div className="font-medium">{order.user_name || "—"}</div>
                  <div className="text-xs text-muted-foreground">{order.user_email}</div>
                </td>
                <td className="px-4 py-3">{order.course_title}</td>
                <td className="px-4 py-3 font-medium">
                  {formatCurrency(order.amount_cents, order.currency)}
                </td>
                <td className="px-4 py-3 font-mono text-xs">{order.transaction_id || "—"}</td>
                <td className="px-4 py-3">
                  <span className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${statusColors[order.status] || ""}`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground text-xs">
                  {formatDate(order.created_at)}
                </td>
                <td className="px-4 py-3">
                  {order.status === "PENDING" && (
                    <OrderActions orderId={order.id} />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">No orders yet.</div>
        )}
      </div>
    </div>
  );
}
