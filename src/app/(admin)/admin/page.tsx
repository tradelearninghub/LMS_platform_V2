import { query, queryOne } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";

export default async function AdminOverview() {
  const [usersRes, coursesRes, pendingRes, approvedOrders] = await Promise.all([
    queryOne("SELECT COUNT(*) AS count FROM users"),
    queryOne("SELECT COUNT(*) AS count FROM courses"),
    queryOne("SELECT COUNT(*) AS count FROM orders WHERE status = 'PENDING'"),
    query("SELECT amount_cents FROM orders WHERE status = 'APPROVED'"),
  ]);

  const usersCount = usersRes?.count || 0;
  const coursesCount = coursesRes?.count || 0;
  const pendingOrdersCount = pendingRes?.count || 0;

  const revenueCents = approvedOrders.reduce((sum, o) => sum + o.amount_cents, 0);

  const cards = [
    { label: "Total revenue", value: formatCurrency(revenueCents) },
    { label: "Total users", value: usersCount.toString() },
    { label: "Total courses", value: coursesCount.toString() },
    { label: "Pending orders", value: pendingOrdersCount.toString() },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Overview</h1>
        <p className="text-muted-foreground text-sm">Top-line metrics across the platform.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border bg-card p-5">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{c.label}</p>
            <p className="mt-2 text-2xl font-semibold">{c.value}</p>
          </div>
        ))}
      </div>
      <div className="rounded-xl border bg-card p-5">
        <p className="text-sm text-muted-foreground">
          This is a scaffold. The full admin modules (Courses, Modules, Lessons,
          Orders, Students, Enrollments, QR settings, SMTP, Email builder, SEO,
          Homepage sections) are wired into the navigation and ready to be
          implemented one module at a time.
        </p>
      </div>
    </div>
  );
}
