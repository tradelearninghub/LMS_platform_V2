import Link from "next/link";
import { query } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";
import { AdminCourseActions } from "./course-actions";
import { CourseSortInput } from "./course-sort-input";
import { CourseStatusToggle } from "./course-status-toggle";

export const metadata = { title: "Manage Courses" };

export default async function AdminCoursesPage() {
  // 1. Fetch courses with category names, modules and enrollment counts using raw SQL
  const courses = await query(
    `SELECT c.*, cat.name AS category_name,
            (SELECT COUNT(*) FROM modules m WHERE m.course_id = c.id) AS module_count,
            (SELECT COUNT(*) FROM enrollments e WHERE e.course_id = c.id) AS enrollment_count
     FROM courses c
     LEFT JOIN categories cat ON c.category_id = cat.id
     ORDER BY c.sort_order ASC, c.created_at DESC`
  );

  // 2. Fetch categories
  const categories = await query("SELECT * FROM categories ORDER BY name ASC");

  const statusColors: Record<string, string> = {
    DRAFT: "bg-yellow-100 text-yellow-800",
    PUBLISHED: "bg-green-100 text-green-800",
    ARCHIVED: "bg-gray-100 text-gray-800",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Courses</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {courses.length} courses total
          </p>
        </div>
      </div>

      {/* Create course form */}
      <details className="rounded-xl border bg-card">
        <summary className="px-5 py-4 font-medium cursor-pointer hover:bg-accent/50 rounded-xl transition-colors">
          + New Course
        </summary>
        <AdminCourseActions categories={categories} />
      </details>

      {/* Courses table */}
      <div className="rounded-xl border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Title</th>
              <th className="px-4 py-3 text-left font-medium">Category</th>
              <th className="px-4 py-3 text-left font-medium">Price</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-left font-medium">Sort Order</th>
              <th className="px-4 py-3 text-left font-medium">Modules</th>
              <th className="px-4 py-3 text-left font-medium">Students</th>
              <th className="px-4 py-3 text-left font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {courses.map((course) => (
              <tr key={course.id} className="hover:bg-muted/30">
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/courses/${course.id}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {course.title}
                  </Link>
                  {course.is_featured === 1 && (
                    <span className="ml-2 text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                      Featured
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {course.category_name || "—"}
                </td>
                <td className="px-4 py-3">
                  {course.price_cents === 0
                    ? "Free"
                    : formatCurrency(course.price_cents, course.currency)}
                </td>
                <td className="px-4 py-3">
                  <CourseStatusToggle courseId={course.id} status={course.status} />
                </td>
                <td className="px-4 py-3">
                  <CourseSortInput courseId={course.id} initialSortOrder={course.sort_order || 0} />
                </td>
                <td className="px-4 py-3 text-muted-foreground">{course.module_count}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {course.enrollment_count}
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/courses/${course.id}`}
                    className="text-xs text-primary hover:underline"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {courses.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">
            No courses yet. Create your first course above.
          </div>
        )}
      </div>
    </div>
  );
}
