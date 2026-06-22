import { query } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { StudentStatusToggle } from "./student-status-toggle";

export const metadata = { title: "Students" };

export default async function AdminStudentsPage() {
  // Fetch students along with enrollment and order counts using raw SQL
  const students = await query(
    `SELECT u.*,
            (SELECT COUNT(*) FROM enrollments e WHERE e.user_id = u.id) AS enrollment_count,
            (SELECT COUNT(*) FROM orders o WHERE o.user_id = u.id) AS order_count
     FROM users u
     WHERE u.role = 'STUDENT'
     ORDER BY u.created_at DESC`
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Students</h1>
        <p className="text-sm text-muted-foreground mt-1">{students.length} registered students</p>
      </div>

      <div className="rounded-xl border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Name</th>
              <th className="px-4 py-3 text-left font-medium">Email</th>
              <th className="px-4 py-3 text-left font-medium">Mobile</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-left font-medium">Enrollments</th>
              <th className="px-4 py-3 text-left font-medium">Orders</th>
              <th className="px-4 py-3 text-left font-medium">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {students.map((s) => (
              <tr key={s.id} className="hover:bg-muted/30">
                <td className="px-4 py-3 font-medium">{s.name || "—"}</td>
                <td className="px-4 py-3">{s.email}</td>
                <td className="px-4 py-3 text-muted-foreground">{s.mobile || "—"}</td>
                <td className="px-4 py-3">
                  <StudentStatusToggle userId={s.id} status={s.status} />
                </td>
                <td className="px-4 py-3 text-center">{s.enrollment_count}</td>
                <td className="px-4 py-3 text-center">{s.order_count}</td>
                <td className="px-4 py-3 text-muted-foreground text-xs">{formatDate(s.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {students.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">No students yet.</div>
        )}
      </div>
    </div>
  );
}
