import Link from "next/link";
import { query } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";

export const metadata = {
  title: "All Courses",
  description: "Browse our complete catalogue of trading and stock market courses.",
};

export const dynamic = "force-dynamic";

export default async function CoursesIndexPage() {
  // Fetch courses with categories, enrollment counts, and content type counts
  const courses = await query(
    `SELECT c.*, cat.name AS category_name, 
            (SELECT COUNT(*) FROM enrollments e WHERE e.course_id = c.id) AS enrollment_count,
            (SELECT COUNT(*) FROM lessons l JOIN modules m ON l.module_id = m.id WHERE m.course_id = c.id AND (l.content_type = 'URL' OR l.content_type IS NULL OR l.content_type = '')) AS url_lesson_count,
            (SELECT COUNT(*) FROM lessons l JOIN modules m ON l.module_id = m.id WHERE m.course_id = c.id AND l.content_type = 'PDF') AS pdf_lesson_count
     FROM courses c
     LEFT JOIN categories cat ON c.category_id = cat.id
     WHERE c.status = 'PUBLISHED'
     ORDER BY c.is_featured DESC, c.sort_order ASC, c.created_at DESC`
  ).catch(() => []);

  return (
    <div className="container py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">All Courses</h1>
        <p className="mt-2 text-muted-foreground">
          Browse our complete catalogue and start learning today.
        </p>
      </div>

      {/* Course grid */}
      {courses.length === 0 ? (
        <div className="rounded-lg border border-dashed p-16 text-center text-muted-foreground">
          <p className="text-lg font-medium">No courses found</p>
          <p className="mt-1 text-sm">Check back soon for new courses.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => {
            const sellingPrice = course.selling_price_cents || course.price_cents || 0;
            const mrp = course.mrp_cents || course.price_cents || 0;
            const hasDiscount = mrp > sellingPrice;
            const discountPercent = hasDiscount ? Math.round(((mrp - sellingPrice) / mrp) * 100) : 0;
            const hasUrlLessons = (course.url_lesson_count || 0) > 0;
            const hasPdfLessons = (course.pdf_lesson_count || 0) > 0;

            return (
              <Link
                key={course.id}
                href={`/courses/${course.slug}`}
                className="group rounded-xl border bg-card overflow-hidden hover:shadow-lg transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="aspect-video bg-gradient-to-br from-primary/10 to-accent/20 relative overflow-hidden flex items-center justify-center">
                    {course.thumbnail_url ? (
                      <img
                        src={course.thumbnail_url}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="text-muted-foreground/50 text-sm font-medium p-4 text-center">
                        {course.title}
                      </div>
                    )}
                    {course.is_featured === 1 && (
                      <span className="absolute top-3 left-3 rounded-full bg-primary px-2.5 py-0.5 text-[11px] font-semibold text-primary-foreground uppercase tracking-wide">
                        Featured
                      </span>
                    )}
                    {hasDiscount && (
                      <span className="absolute top-3 right-3 rounded-md bg-emerald-600 px-2.5 py-0.5 text-[11px] font-extrabold text-white uppercase tracking-wider shadow-sm">
                        {discountPercent}% OFF
                      </span>
                    )}
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      {course.category_name && (
                        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                          {course.category_name}
                        </span>
                      )}
                      {hasUrlLessons && (
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-700 uppercase tracking-wide">
                          Video
                        </span>
                      )}
                      {hasPdfLessons && (
                        <span className="rounded bg-amber-50 border border-amber-200 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800 uppercase tracking-wide">
                          PDF
                        </span>
                      )}
                    </div>
                  <h3 className="font-semibold group-hover:text-primary transition-colors line-clamp-2">
                    {course.title}
                  </h3>
                  {course.short_description && (
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                      {course.short_description}
                    </p>
                  )}
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-baseline gap-2">
                      {sellingPrice === 0 ? (
                        <span className="text-lg font-bold">Free</span>
                      ) : (
                        <>
                          <span className="text-lg font-bold">
                            {formatCurrency(sellingPrice, course.currency)}
                          </span>
                          {hasDiscount && (
                            <span className="text-sm text-muted-foreground line-through">
                              {formatCurrency(mrp, course.currency)}
                            </span>
                          )}
                        </>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {course.manual_enrollment_count !== null && course.manual_enrollment_count !== undefined && course.manual_enrollment_count > 0
                        ? `${course.manual_enrollment_count}+ students enrolled`
                        : `${course.enrollment_count || 0} enrolled`}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

