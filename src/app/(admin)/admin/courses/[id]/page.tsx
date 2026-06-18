import { notFound } from "next/navigation";
import { query, queryOne } from "@/lib/db";
import { CourseEditForm } from "./course-edit-form";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const course = await queryOne("SELECT title FROM courses WHERE id = ?", [id]);
  return { title: course ? `Edit: ${course.title}` : "Course Not Found" };
}

interface DBLesson {
  id: string;
  title: string;
  video_url: string | null;
  duration_seconds: number;
  is_preview: number | boolean;
  description: string | null;
}

export default async function AdminCourseEditPage({ params }: Props) {
  const { id } = await params;

  // 1. Fetch course details
  const course = await queryOne("SELECT * FROM courses WHERE id = ?", [id]);
  if (!course) notFound();

  // 2. Fetch modules
  const rawModules = await query("SELECT * FROM modules WHERE course_id = ? ORDER BY sort_order ASC", [course.id]);

  // 3. Fetch lessons for modules
  const modules = [];
  for (const m of rawModules) {
    const rawLessons: DBLesson[] = await query(
      "SELECT id, title, video_url, duration_seconds, is_preview, description FROM lessons WHERE module_id = ? ORDER BY sort_order ASC",
      [m.id]
    );
    modules.push({
      id: m.id,
      title: m.title,
      lessons: rawLessons.map((l) => ({
        id: l.id,
        title: l.title,
        videoUrl: l.video_url,
        durationSeconds: l.duration_seconds,
        isPreview: !!l.is_preview,
        description: l.description,
      })),
    });
  }

  // 4. Mapped course for React Component
  const mappedCourse = {
    id: course.id,
    title: course.title,
    shortDescription: course.short_description,
    description: course.description,
    priceCents: course.price_cents,
    currency: course.currency,
    status: course.status,
    isFeatured: !!course.is_featured,
    categoryId: course.category_id,
    seoTitle: course.seo_title,
    seoDescription: course.seo_description,
    thumbnailUrl: course.thumbnail_url,
    modules,
  };

  // 5. Fetch categories for selector
  const categories = await query("SELECT id, name FROM categories ORDER BY name ASC");

  return (
    <CourseEditForm
      course={mappedCourse}
      categories={categories.map((c) => ({ id: c.id, name: c.name }))}
    />
  );
}
