import { query } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { EnrollmentActions } from "./enrollment-actions";

export const metadata = { title: "Enrollments" };

export default async function AdminEnrollmentsPage() {
  // Fetch enrollments with student and course details using raw SQL join
  const enrollments = await query(
    `SELECT e.*, u.name AS user_name, u.email AS user_email, c.title AS course_title
     FROM enrollments e
     JOIN users u ON e.user_id = u.id
     JOIN courses c ON e.course_id = c.id
     ORDER BY e.enrolled_at DESC`
  );

  // Fetch student users
  const users = await query(
    "SELECT id, name, email FROM users WHERE role = 'STUDENT' ORDER BY name ASC"
  );

  // Fetch courses
  const courses = await query(
    "SELECT id, title FROM courses ORDER BY title ASC"
  );

  const statusColors: Record<string, string> = {
    ACTIVE: "bg-green-100 text-green-800",
    EXPIRED: "bg-yellow-100 text-yellow-800",
    REVOKED: "bg-red-100 text-red-800",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Enrollments</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage student enrollments. Use manual enrollment for gifts or comp access.
        </p>
      </div>

      {/* Manual enrollment actions panel */}
      <EnrollmentActions users={users} courses={courses} />

      <div className="rounded-xl border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Student</th>
              <th className="px-4 py-3 text-left font-medium">Course</th>
              <th className="px-4 py-3 text-left font-medium">Source</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-left font-medium">Enrolled</th>
              <th className="px-4 py-3 text-left font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {enrollments.map((e) => (
              <tr key={e.id} className="hover:bg-muted/30">
                <td className="px-4 py-3">
                  <div className="font-medium">{e.user_name || "—"}</div>
                  <div className="text-xs text-muted-foreground">{e.user_email}</div>
                </td>
                <td className="px-4 py-3">{e.course_title}</td>
                <td className="px-4 py-3 text-xs uppercase text-muted-foreground">{e.source}</td>
                <td className="px-4 py-3">
                  <span className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${statusColors[e.status] || ""}`}>
                    {e.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground text-xs">{formatDate(e.enrolled_at)}</td>
                <td className="px-4 py-3">
                  {e.status === "ACTIVE" && (
                    <EnrollmentActions.RevokeButton enrollmentId={e.id} />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {enrollments.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">No enrollments yet.</div>
        )}
      </div>
    </div>
  );
}
