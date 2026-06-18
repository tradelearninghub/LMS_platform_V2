import Link from "next/link";
import { query, queryOne } from "@/lib/db";
import { requireUser } from "@/lib/guards";
import { formatCurrency, formatDate } from "@/lib/utils";

export const metadata = { title: "Dashboard" };

export default async function StudentDashboard() {
  const user = await requireUser();

  // 1. Fetch enrollments
  const enrollments = await query(
    `SELECT e.*, c.title AS course_title, c.slug AS course_slug, 
            c.short_description AS course_short_description
     FROM enrollments e
     JOIN courses c ON e.course_id = c.id
     WHERE e.user_id = ? AND e.status = 'ACTIVE'
     ORDER BY e.enrolled_at DESC
     LIMIT 6`,
    [user.id]
  );

  // 2. Fetch progress counts
  const progressCounts: { courseId: string; totalLessons: number; completedLessons: number }[] = [];
  for (const e of enrollments) {
    const totalResult = await queryOne(
      `SELECT COUNT(l.id) AS total_lessons
       FROM lessons l
       JOIN modules m ON l.module_id = m.id
       WHERE m.course_id = ?`,
      [e.course_id]
    );

    const completedResult = await queryOne(
      `SELECT COUNT(lp.id) AS completed_lessons
       FROM lesson_progress lp
       JOIN lessons l ON lp.lesson_id = l.id
       JOIN modules m ON l.module_id = m.id
       WHERE lp.user_id = ? AND lp.is_completed = 1 AND m.course_id = ?`,
      [user.id, e.course_id]
    );

    progressCounts.push({
      courseId: e.course_id,
      totalLessons: totalResult?.total_lessons || 0,
      completedLessons: completedResult?.completed_lessons || 0,
    });
  }

  // 3. Fetch recent orders
  const recentOrders = await query(
    `SELECT o.*, c.title AS course_title
     FROM orders o
     JOIN courses c ON o.course_id = c.id
     WHERE o.user_id = ?
     ORDER BY o.created_at DESC
     LIMIT 5`,
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
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Welcome back, {user.name || "Student"}</h1>
        <p className="mt-1 text-muted-foreground">
          Your learning overview and recent activity.
        </p>
      </div>

      {/* Enrolled courses */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">My Courses</h2>
          <Link href="/dashboard/courses" className="text-sm text-primary hover:underline">
            View all →
          </Link>
        </div>

        {enrollments.length === 0 ? (
          <div className="rounded-lg border border-dashed p-10 text-center text-muted-foreground">
            <p className="font-medium">No courses yet</p>
            <p className="mt-1 text-sm">
              <Link href="/courses" className="text-primary hover:underline">
                Browse our catalogue
              </Link>{" "}
              to get started.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {enrollments.map((enrollment) => {
              const progress = progressCounts.find(
                (p) => p.courseId === enrollment.course_id
              );
              const pct =
                progress && progress.totalLessons > 0
                  ? Math.round(
                      (progress.completedLessons / progress.totalLessons) * 100
                    )
                  : 0;

              return (
                <Link
                  key={enrollment.id}
                  href={`/learn/${enrollment.course_slug}`}
                  className="group rounded-xl border bg-card p-5 hover:shadow-md transition-shadow"
                >
                  <h3 className="font-semibold group-hover:text-primary transition-colors line-clamp-1">
                    {enrollment.course_title}
                  </h3>
                  {enrollment.course_short_description && (
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                      {enrollment.course_short_description}
                    </p>
                  )}
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-muted-foreground">
                        {progress?.completedLessons || 0} / {progress?.totalLessons || 0} lessons
                      </span>
                      <span className="font-medium">{pct}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* Recent orders */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Recent Orders</h2>
          <Link href="/dashboard/orders" className="text-sm text-primary hover:underline">
            View all →
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <p className="text-sm text-muted-foreground">No orders yet.</p>
        ) : (
          <div className="rounded-xl border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Order</th>
                  <th className="px-4 py-3 text-left font-medium">Course</th>
                  <th className="px-4 py-3 text-left font-medium">Amount</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-left font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-mono text-xs">{order.order_number}</td>
                    <td className="px-4 py-3">{order.course_title}</td>
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
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDate(order.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
