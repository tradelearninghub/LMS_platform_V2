import Link from "next/link";
import { notFound } from "next/navigation";
import { query, queryOne } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";
import { auth } from "@/auth";
import type { Metadata } from "next";

type Props = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";


export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const course = await queryOne(
    "SELECT title, short_description, seo_title, seo_description FROM courses WHERE slug = ? AND status = 'PUBLISHED'",
    [slug]
  );
  if (!course) return { title: "Course Not Found" };
  return {
    title: course.seo_title || course.title,
    description: course.seo_description || course.short_description || undefined,
  };
}

interface DBModule {
  id: string;
  title: string;
  sort_order: number;
  lessons: DBLesson[];
}

interface DBLesson {
  id: string;
  title: string;
  duration_seconds: number;
  is_preview: number | boolean;
}

export default async function CourseDetailPage({ params }: Props) {
  const { slug } = await params;

  // 1. Fetch course details
  const course = await queryOne(
    `SELECT c.*, cat.name AS category_name, cat.slug AS category_slug,
            (SELECT COUNT(*) FROM enrollments e WHERE e.course_id = c.id) AS enrollment_count
     FROM courses c
     LEFT JOIN categories cat ON c.category_id = cat.id
     WHERE c.slug = ? AND c.status = 'PUBLISHED'`,
    [slug]
  );

  if (!course) notFound();

  // 2. Fetch modules
  const rawModules = await query("SELECT * FROM modules WHERE course_id = ? ORDER BY sort_order ASC", [course.id]);
  
  // 3. Fetch lessons for each module
  const modules: DBModule[] = [];
  for (const m of rawModules) {
    const lessons = await query(
      "SELECT id, title, duration_seconds, is_preview FROM lessons WHERE module_id = ? ORDER BY sort_order ASC",
      [m.id]
    );
    modules.push({
      id: m.id,
      title: m.title,
      sort_order: m.sort_order,
      lessons: lessons.map(l => ({
        id: l.id,
        title: l.title,
        duration_seconds: l.duration_seconds,
        is_preview: !!l.is_preview
      }))
    });
  }

  // 4. Check enrollment status
  const session = await auth();
  let isEnrolled = false;
  if (session?.user?.id) {
    const enrollment = await queryOne(
      "SELECT id FROM enrollments WHERE user_id = ? AND course_id = ? AND status = 'ACTIVE'",
      [session.user.id, course.id]
    );
    isEnrolled = !!enrollment;
  }

  const totalLessons = modules.reduce((sum, m) => sum + m.lessons.length, 0);
  const totalDuration = modules.reduce(
    (sum, m) => sum + m.lessons.reduce((s, l) => s + l.duration_seconds, 0),
    0
  );
  const durationHours = Math.floor(totalDuration / 3600);
  const durationMinutes = Math.ceil((totalDuration % 3600) / 60);

  return (
    <div className="container py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/courses" className="hover:text-foreground">
              Courses
            </Link>
            <span>/</span>
            {course.category_name && (
              <>
                <Link
                  href={`/courses?category=${course.category_slug}`}
                  className="hover:text-foreground"
                >
                  {course.category_name}
                </Link>
                <span>/</span>
              </>
            )}
            <span className="text-foreground truncate">{course.title}</span>
          </nav>

          <div>
            {course.category_name && (
              <span className="inline-block text-[11px] font-medium uppercase tracking-wider text-primary mb-3">
                {course.category_name}
              </span>
            )}
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{course.title}</h1>
            {course.short_description && (
              <p className="mt-4 text-lg text-muted-foreground">{course.short_description}</p>
            )}
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-6 text-sm">
            <div className="flex items-center gap-2">
              <span className="font-semibold">{modules.length}</span>
              <span className="text-muted-foreground">Modules</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">{totalLessons}</span>
              <span className="text-muted-foreground">Lessons</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">
                {durationHours > 0 ? `${durationHours}h ` : ""}
                {durationMinutes}m
              </span>
              <span className="text-muted-foreground">Total</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">{course.enrollment_count}</span>
              <span className="text-muted-foreground">Students</span>
            </div>
          </div>

          {/* Description */}
          {course.description && (
            <div className="prose prose-sm max-w-none">
              <h2 className="text-xl font-semibold mb-3">About this course</h2>
              <p className="text-muted-foreground whitespace-pre-line">{course.description}</p>
            </div>
          )}

          {/* Curriculum */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Curriculum</h2>
            <div className="space-y-3">
              {modules.map((mod, idx) => (
                <details
                  key={mod.id}
                  className="group rounded-lg border bg-card"
                  open={idx === 0}
                >
                  <summary className="flex items-center justify-between cursor-pointer px-5 py-4 font-medium hover:bg-accent/50 rounded-lg transition-colors">
                    <span>
                      {mod.title}
                      <span className="ml-2 text-sm font-normal text-muted-foreground">
                        ({mod.lessons.length} lessons)
                      </span>
                    </span>
                    <svg
                      className="w-4 h-4 text-muted-foreground transition-transform group-open:rotate-180"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="border-t">
                    {mod.lessons.map((lesson) => (
                      <div
                        key={lesson.id}
                        className="flex items-center justify-between px-5 py-3 text-sm border-b last:border-b-0"
                      >
                        <div className="flex items-center gap-3">
                          <svg
                            className="w-4 h-4 text-muted-foreground flex-shrink-0"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <span>{lesson.title}</span>
                          {lesson.is_preview && (
                            <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-medium uppercase text-accent-foreground">
                              Preview
                            </span>
                          )}
                        </div>
                        <span className="text-muted-foreground text-xs">
                          {Math.floor(lesson.duration_seconds / 60)}m
                        </span>
                      </div>
                    ))}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar / CTA card */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 rounded-xl border bg-card p-6 space-y-5">
            <div className="aspect-video rounded-lg bg-gradient-to-br from-primary/20 to-accent/30" />
            <div className="text-center">
              <p className="text-3xl font-bold">
                {course.price_cents === 0
                  ? "Free"
                  : formatCurrency(course.price_cents, course.currency)}
              </p>
              {course.price_cents > 0 && (
                <p className="mt-1 text-sm text-muted-foreground">One-time payment • Lifetime access</p>
              )}
            </div>

            {isEnrolled ? (
              <Link
                href={`/learn/${course.slug}`}
                className="block w-full text-center rounded-md bg-primary px-4 py-3 text-primary-foreground font-medium hover:opacity-90 transition-opacity"
              >
                Continue Learning →
              </Link>
            ) : session?.user ? (
              <Link
                href={`/courses/${course.slug}/buy`}
                className="block w-full text-center rounded-md bg-primary px-4 py-3 text-primary-foreground font-medium hover:opacity-90 transition-opacity"
              >
                {course.price_cents === 0 ? "Enroll for Free" : "Buy Now"}
              </Link>
            ) : (
              <Link
                href={`/login`}
                className="block w-full text-center rounded-md bg-primary px-4 py-3 text-primary-foreground font-medium hover:opacity-90 transition-opacity"
              >
                Sign in to Enroll
              </Link>
            )}

            <ul className="text-sm text-muted-foreground space-y-2 pt-2 border-t">
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Lifetime access
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {totalLessons} video lessons
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Structured curriculum
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Certificate-ready
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
