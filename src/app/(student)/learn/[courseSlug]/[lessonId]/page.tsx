import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { query, queryOne } from "@/lib/db";
import { requireUser } from "@/lib/guards";
import { LessonCompleteButton } from "./lesson-complete-button";

type Props = {
  params: Promise<{ courseSlug: string; lessonId: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { lessonId } = await params;
  const lesson = await queryOne("SELECT title FROM lessons WHERE id = ?", [lessonId]);
  return { title: lesson?.title || "Lesson" };
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
  is_preview: boolean | number;
}

export default async function LessonPage({ params }: Props) {
  const { courseSlug, lessonId } = await params;
  const user = await requireUser();

  // 1. Fetch course details
  const course = await queryOne("SELECT id, title FROM courses WHERE slug = ?", [courseSlug]);
  if (!course) notFound();

  // 2. Verify enrollment
  const enrollment = await queryOne(
    "SELECT status FROM enrollments WHERE user_id = ? AND course_id = ?",
    [user.id, course.id]
  );
  if (!enrollment || enrollment.status !== "ACTIVE") {
    redirect(`/courses/${courseSlug}`);
  }

  // 3. Fetch modules
  const rawModules = await query("SELECT * FROM modules WHERE course_id = ? ORDER BY sort_order ASC", [course.id]);

  // 4. Fetch lessons for each module
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

  // 5. Fetch current lesson
  const lesson = await queryOne("SELECT * FROM lessons WHERE id = ?", [lessonId]);
  if (!lesson) notFound();

  // 6. Fetch resources for this lesson
  const resources = await query("SELECT * FROM lesson_resources WHERE lesson_id = ? ORDER BY sort_order ASC", [lessonId]);

  // 7. Fetch user's completion progress for this lesson
  const progress = await queryOne(
    "SELECT is_completed FROM lesson_progress WHERE user_id = ? AND lesson_id = ?",
    [user.id, lessonId]
  );

  // 8. Fetch all user completed lesson IDs for this course (for the sidebar checks)
  const allProgress = await query(
    `SELECT lp.lesson_id 
     FROM lesson_progress lp
     JOIN lessons l ON lp.lesson_id = l.id
     JOIN modules m ON l.module_id = m.id
     WHERE lp.user_id = ? AND lp.is_completed = 1 AND m.course_id = ?`,
    [user.id, course.id]
  );
  const completedLessonIds = new Set<string>(allProgress.map((p) => p.lesson_id));

  // Build flat list for prev/next nav
  const allLessons = modules.flatMap((m) =>
    m.lessons.map((l) => ({ ...l, moduleTitle: m.title }))
  );
  const currentIdx = allLessons.findIndex((l) => l.id === lessonId);
  const prevLesson = currentIdx > 0 ? allLessons[currentIdx - 1] : null;
  const nextLesson = currentIdx < allLessons.length - 1 ? allLessons[currentIdx + 1] : null;

  // Process video URL for Google Drive embed
  let embedUrl = lesson.video_url;
  if (embedUrl && embedUrl.includes("drive.google.com") && !embedUrl.includes("/preview")) {
    const match = embedUrl.match(/\/d\/([^/]+)/);
    if (match) {
      embedUrl = `https://drive.google.com/file/d/${match[1]}/preview`;
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar */}
      <header className="h-14 border-b bg-white/80 backdrop-blur flex items-center px-4 gap-4 sticky top-0 z-40">
        <Link
          href={`/learn/${courseSlug}`}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to course
        </Link>
        <span className="text-sm font-medium truncate">{course.title}</span>
      </header>

      <div className="flex flex-1">
        {/* Sidebar - curriculum */}
        <aside className="hidden lg:flex w-80 flex-col border-r bg-card overflow-y-auto">
          <div className="p-4 border-b">
            <h2 className="font-semibold text-sm">Curriculum</h2>
            <p className="text-xs text-muted-foreground mt-1">
              {completedLessonIds.size} / {allLessons.length} complete
            </p>
          </div>
          <nav className="flex-1 overflow-y-auto">
            {modules.map((mod) => (
              <div key={mod.id}>
                <div className="px-4 py-2 text-[11px] uppercase tracking-wider text-muted-foreground font-medium bg-muted/30">
                  {mod.title}
                </div>
                {mod.lessons.map((l) => (
                  <Link
                    key={l.id}
                    href={`/learn/${courseSlug}/${l.id}`}
                    className={`flex items-center gap-3 px-4 py-3 text-sm border-b hover:bg-accent/50 transition-colors ${
                      l.id === lessonId ? "bg-accent font-medium" : ""
                    }`}
                  >
                    <span
                      className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        completedLessonIds.has(l.id)
                          ? "bg-primary border-primary text-primary-foreground"
                          : "border-muted-foreground/30"
                      }`}
                    >
                      {completedLessonIds.has(l.id) && (
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </span>
                    <span className="flex-1 line-clamp-2">{l.title}</span>
                    <span className="text-xs text-muted-foreground flex-shrink-0">
                      {Math.floor(l.duration_seconds / 60)}m
                    </span>
                  </Link>
                ))}
              </div>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          {/* Video player */}
          {embedUrl && (
            <div className="aspect-video bg-black">
              <iframe
                src={embedUrl}
                className="w-full h-full"
                allow="autoplay; encrypted-media"
                allowFullScreen
              />
            </div>
          )}

          <div className="p-6 max-w-3xl mx-auto space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-semibold">{lesson.title}</h1>
                {lesson.description && (
                  <p className="mt-2 text-muted-foreground">{lesson.description}</p>
                )}
              </div>
              <LessonCompleteButton
                lessonId={lessonId}
                isCompleted={!!progress?.is_completed}
              />
            </div>

            {/* Lesson notes */}
            {lesson.notes && (
              <div className="rounded-xl border bg-card p-5">
                <h3 className="font-semibold mb-3">Notes</h3>
                <div className="text-sm text-muted-foreground whitespace-pre-line">
                  {lesson.notes}
                </div>
              </div>
            )}

            {/* Resources */}
            {resources.length > 0 && (
              <div className="rounded-xl border bg-card p-5">
                <h3 className="font-semibold mb-3">Resources</h3>
                <div className="space-y-2">
                  {resources.map((r) => (
                    <div key={r.id} className="flex items-center gap-3 text-sm">
                      <span className="rounded bg-muted px-2 py-0.5 text-[11px] font-medium uppercase">
                        {r.type}
                      </span>
                      {r.url ? (
                        <a
                          href={r.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {r.title}
                        </a>
                      ) : (
                        <span>{r.title}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Prev / Next navigation */}
            <div className="flex items-center justify-between pt-4 border-t">
              {prevLesson ? (
                <Link
                  href={`/learn/${courseSlug}/${prevLesson.id}`}
                  className="text-sm text-primary hover:underline"
                >
                  ← {prevLesson.title}
                </Link>
              ) : (
                <span />
              )}
              {nextLesson ? (
                <Link
                  href={`/learn/${courseSlug}/${nextLesson.id}`}
                  className="text-sm text-primary hover:underline"
                >
                  {nextLesson.title} →
                </Link>
              ) : (
                <span className="text-sm text-muted-foreground">End of course 🎉</span>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
