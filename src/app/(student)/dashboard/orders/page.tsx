import { query } from "@/lib/db";
import { requireUser } from "@/lib/guards";
import { formatCurrency, formatDate } from "@/lib/utils";

export const metadata = { title: "My Orders" };

export default async function OrdersPage() {
  const user = await requireUser();

  // Fetch orders using raw SQL join
  const orders = await query(
    `SELECT o.*, c.title AS course_title, c.slug AS course_slug
     FROM orders o
     JOIN courses c ON o.course_id = c.id
     WHERE o.user_id = ?
     ORDER BY o.created_at DESC`,
    [user.id]
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
        <h1 className="text-2xl font-semibold">My Orders</h1>
        <p className="mt-1 text-muted-foreground">Track the status of your purchases.</p>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center text-muted-foreground">
          No orders yet.
        </div>
      ) : (
        <div className="rounded-xl border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Order #</th>
                <th className="px-4 py-3 text-left font-medium">Course</th>
                <th className="px-4 py-3 text-left font-medium">Amount</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Transaction ID</th>
                <th className="px-4 py-3 text-left font-medium">Date</th>
                <th className="px-4 py-3 text-left font-medium">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-mono text-xs">{order.order_number}</td>
                  <td className="px-4 py-3 font-medium">{order.course_title}</td>
                  <td className="px-4 py-3">
                    {formatCurrency(order.amount_cents, order.currency)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                        statusColors[order.status] || "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    {order.transaction_id || "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDate(order.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    {order.status === "APPROVED" ? (
                      <a
                        href={`/api/receipts/${order.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary hover:underline font-medium"
                      >
                        Download PDF
                      </a>
                    ) : (
                      <span className="text-muted-foreground text-xs">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
