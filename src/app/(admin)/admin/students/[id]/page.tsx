import { notFound } from "next/navigation";
import { query, queryOne } from "@/lib/db";
import { formatDate, formatCurrency } from "@/lib/utils";
import { StudentStatusToggle } from "../student-status-toggle";
import { RevokeButton, ReactivateButton } from "../../enrollments/enrollment-actions";
import Link from "next/link";
import { User, BookOpen, Receipt, ArrowLeft } from "lucide-react";

type Props = { params: Promise<{ id: string }> };

export const metadata = { title: "Student Profile Details | Admin" };

export default async function StudentDetailPage({ params }: Props) {
  const { id } = await params;

  // 1. Fetch student info
  const student = await queryOne(
    "SELECT * FROM users WHERE id = ? AND role = 'STUDENT'",
    [id]
  );
  if (!student) notFound();

  // 2. Fetch student enrollments
  const enrollments = await query(
    `SELECT e.*, c.title AS course_title, c.slug AS course_slug
     FROM enrollments e
     JOIN courses c ON e.course_id = c.id
     WHERE e.user_id = ?
     ORDER BY e.enrolled_at DESC`,
    [id]
  );

  // 3. Fetch student orders
  const orders = await query(
    `SELECT o.*, c.title AS course_title
     FROM orders o
     JOIN courses c ON o.course_id = c.id
     WHERE o.user_id = ?
     ORDER BY o.created_at DESC`,
    [id]
  );

  const statusColors: Record<string, string> = {
    ACTIVE: "bg-green-100 text-green-800",
    EXPIRED: "bg-yellow-100 text-yellow-800",
    REVOKED: "bg-red-100 text-red-800",
    PENDING: "bg-yellow-100 text-yellow-800",
    APPROVED: "bg-green-100 text-green-800",
    REJECTED: "bg-red-100 text-red-800",
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Back button */}
      <div>
        <Link href="/admin/students" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Students
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Student Details</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="md:col-span-1 space-y-6">
          <div className="rounded-2xl border bg-card p-6 space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg uppercase">
                {student.name ? student.name[0] : student.email[0]}
              </div>
              <div>
                <h3 className="font-bold text-lg leading-tight">{student.name || "—"}</h3>
                <p className="text-xs text-muted-foreground truncate max-w-[160px]">{student.email}</p>
              </div>
            </div>

            <div className="border-t pt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <StudentStatusToggle userId={student.id} status={student.status} />
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mobile:</span>
                <span className="font-medium text-foreground">{student.mobile || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Joined:</span>
                <span className="font-medium text-foreground">{formatDate(student.created_at)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Login:</span>
                <span className="font-medium text-foreground">
                  {student.last_login_at ? formatDate(student.last_login_at) : "Never"}
                </span>
              </div>
            </div>

            {student.bio && (
              <div className="border-t pt-4 space-y-1 text-sm">
                <span className="text-muted-foreground font-medium">Bio:</span>
                <p className="text-foreground leading-relaxed text-xs italic">{student.bio}</p>
              </div>
            )}
          </div>
        </div>

        {/* Enrollments & Orders details */}
        <div className="md:col-span-2 space-y-6">
          {/* Enrollments */}
          <div className="rounded-2xl border bg-card p-6 space-y-4">
            <div className="flex items-center gap-2 border-b pb-3">
              <BookOpen className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold">Course Enrollments ({enrollments.length})</h2>
            </div>

            {enrollments.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No active enrollments for this user.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-muted-foreground border-b text-xs">
                      <th className="py-2 text-left font-medium">Course Title</th>
                      <th className="py-2 text-left font-medium">Status</th>
                      <th className="py-2 text-left font-medium">Enrolled Date</th>
                      <th className="py-2 text-right font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {enrollments.map((e) => (
                      <tr key={e.id} className="hover:bg-muted/10">
                        <td className="py-3 pr-2 font-medium">{e.course_title}</td>
                        <td className="py-3">
                          <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusColors[e.status] || ""}`}>
                            {e.status}
                          </span>
                        </td>
                        <td className="py-3 text-xs text-muted-foreground">{formatDate(e.enrolled_at)}</td>
                        <td className="py-3 text-right">
                          {e.status === "ACTIVE" ? (
                            <RevokeButton enrollmentId={e.id} />
                          ) : (
                            <ReactivateButton enrollmentId={e.id} />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Billing Order History */}
          <div className="rounded-2xl border bg-card p-6 space-y-4">
            <div className="flex items-center gap-2 border-b pb-3">
              <Receipt className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold">Order History ({orders.length})</h2>
            </div>

            {orders.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No billing orders found for this user.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-muted-foreground border-b text-xs">
                      <th className="py-2 text-left font-medium">Order #</th>
                      <th className="py-2 text-left font-medium">Course</th>
                      <th className="py-2 text-left font-medium">Amount</th>
                      <th className="py-2 text-left font-medium">Status</th>
                      <th className="py-2 text-right font-medium">Link</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {orders.map((o) => (
                      <tr key={o.id} className="hover:bg-muted/10">
                        <td className="py-3 font-mono text-xs">{o.order_number}</td>
                        <td className="py-3 text-foreground">{o.course_title}</td>
                        <td className="py-3 font-medium">{formatCurrency(o.amount_cents, o.currency)}</td>
                        <td className="py-3">
                          <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusColors[o.status] || ""}`}>
                            {o.status}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <Link href={`/admin/orders/${o.id}`} className="text-xs text-primary hover:underline font-medium">
                            Details
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
