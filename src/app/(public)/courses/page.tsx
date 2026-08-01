import Link from "next/link";
import { query } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";

export const metadata = {
  title: "All Courses",
  description: "Browse our complete catalogue of trading and stock market courses.",
};

export const dynamic = "force-dynamic";

export default async function CoursesIndexPage() {
  // Fetch courses with categories and enrollment counts
  const courses = await query(
    `SELECT c.*, cat.name AS category_name, 
            (SELECT COUNT(*) FROM enrollments e WHERE e.course_id = c.id) AS enrollment_count
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

            return (
              <Link
                key={course.id}
                href={`/courses/${course.slug}`}
                className="group rounded-xl border bg-card overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/30 relative">
                  {course.is_featured === 1 && (
                    <span className="absolute top-3 left-3 rounded-full bg-primary px-2.5 py-0.5 text-[11px] font-semibold text-primary-foreground uppercase tracking-wide">
                      Featured
                    </span>
                  )}
                </div>
                <div className="p-5">
                  {course.category_name && (
                    <span className="inline-block text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-2">
                      {course.category_name}
                    </span>
                  )}
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
                      {course.enrollment_count} enrolled
                    </span>
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

