import { redirect, notFound } from "next/navigation";
import { queryOne } from "@/lib/db";
import { requireUser } from "@/lib/guards";

type Props = { params: Promise<{ courseSlug: string }> };

export default async function LearnCourseOverview({ params }: Props) {
  const { courseSlug } = await params;
  const user = await requireUser();

  // 1. Fetch course details
  const course = await queryOne("SELECT id FROM courses WHERE slug = ?", [courseSlug]);
  if (!course) notFound();

  // 2. Check enrollment
  const enrollment = await queryOne(
    "SELECT status FROM enrollments WHERE user_id = ? AND course_id = ?",
    [user.id, course.id]
  );
  if (!enrollment || enrollment.status !== "ACTIVE") {
    redirect(`/courses/${courseSlug}`);
  }

  // 3. Find first lesson
  const firstLesson = await queryOne(
    `SELECT l.id 
     FROM lessons l
     JOIN modules m ON l.module_id = m.id
     WHERE m.course_id = ?
     ORDER BY m.sort_order ASC, l.sort_order ASC
     LIMIT 1`,
    [course.id]
  );

  if (firstLesson) {
    redirect(`/learn/${courseSlug}/${firstLesson.id}`);
  }

  return (
    <div className="container py-12 text-center">
      <h1 className="text-2xl font-semibold">No lessons available yet</h1>
      <p className="mt-2 text-muted-foreground">
        This course doesn&apos;t have any lessons yet. Check back later.
      </p>
    </div>
  );
}
