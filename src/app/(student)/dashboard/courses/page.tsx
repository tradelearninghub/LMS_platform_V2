import Link from "next/link";
import { query, queryOne } from "@/lib/db";
import { requireUser } from "@/lib/guards";

export const metadata = { title: "My Courses" };

export default async function MyCoursesPage() {
  const user = await requireUser();

  // 1. Fetch enrollments
  const enrollments = await query(
    `SELECT e.*, c.title AS course_title, c.slug AS course_slug, 
            c.short_description AS course_short_description
     FROM enrollments e
     JOIN courses c ON e.course_id = c.id
     WHERE e.user_id = ?
     ORDER BY e.enrolled_at DESC`,
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">My Courses</h1>
        <p className="mt-1 text-muted-foreground">
          All your enrolled courses in one place.
        </p>
      </div>

      {enrollments.length === 0 ? (
        <div className="rounded-lg border border-dashed p-16 text-center text-muted-foreground">
          <p className="text-lg font-medium">No courses yet</p>
          <p className="mt-2 text-sm">
            <Link href="/courses" className="text-primary hover:underline">
              Browse courses
            </Link>{" "}
            to find something to learn.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <div
                key={enrollment.id}
                className="rounded-xl border bg-card p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                        enrollment.status === "ACTIVE"
                          ? "bg-green-100 text-green-800"
                          : enrollment.status === "EXPIRED"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {enrollment.status}
                    </span>
                  </div>
                  <h3 className="font-semibold line-clamp-1">{enrollment.course_title}</h3>
                  {enrollment.course_short_description && (
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                      {enrollment.course_short_description}
                    </p>
                  )}
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted-foreground">
                      {progress?.completedLessons || 0} / {progress?.totalLessons || 0}{" "}
                      lessons
                    </span>
                    <span className="font-medium">{pct}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <Link
                    href={`/learn/${enrollment.course_slug}`}
                    className="mt-3 inline-block text-sm font-medium text-primary hover:underline"
                  >
                    {pct > 0 ? "Continue learning →" : "Start learning →"}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
