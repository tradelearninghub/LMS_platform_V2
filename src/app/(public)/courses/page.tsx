import Link from "next/link";
import { query } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";

export const metadata = {
  title: "All Courses",
  description: "Browse our complete catalogue of trading and stock market courses.",
};

export const dynamic = "force-dynamic";


interface CoursesIndexPageProps {
  searchParams: Promise<{ category?: string; q?: string }>;
}

export default async function CoursesIndexPage({ searchParams }: CoursesIndexPageProps) {
  const params = await searchParams;
  const categorySlug = params.category;
  const searchInput = params.q;

  // 1. Fetch categories
  const categories = await query("SELECT * FROM categories ORDER BY sort_order ASC");

  // 2. Fetch courses with categories and enrollment counts
  let queryStr = `
    SELECT c.*, cat.name AS category_name, 
           (SELECT COUNT(*) FROM enrollments e WHERE e.course_id = c.id) AS enrollment_count
    FROM courses c
    LEFT JOIN categories cat ON c.category_id = cat.id
    WHERE c.status = 'PUBLISHED'
  `;
  const dbParams: any[] = [];

  if (categorySlug) {
    queryStr += ` AND cat.slug = ?`;
    dbParams.push(categorySlug);
  }

  if (searchInput) {
    queryStr += ` AND (c.title LIKE ? OR c.short_description LIKE ?)`;
    dbParams.push(`%${searchInput}%`, `%${searchInput}%`);
  }

  queryStr += ` ORDER BY c.is_featured DESC, c.sort_order ASC, c.created_at DESC`;
  const courses = await query(queryStr, dbParams);

  return (
    <div className="container py-12">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">All Courses</h1>
          <p className="mt-2 text-muted-foreground">
            Browse our complete catalogue and start learning today.
          </p>
        </div>
        {/* Search */}
        <form className="flex gap-2" action="/courses" method="get">
          {categorySlug && <input type="hidden" name="category" value={categorySlug} />}
          <input
            type="text"
            name="q"
            defaultValue={searchInput}
            placeholder="Search courses…"
            className="rounded-md border border-input bg-background px-3 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            type="submit"
            className="rounded-md bg-primary px-4 py-2 text-primary-foreground text-sm font-medium hover:opacity-90"
          >
            Search
          </button>
        </form>
      </div>

      {/* Category tabs */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          <Link
            href="/courses"
            className={`rounded-full px-4 py-1.5 text-sm font-medium border transition-colors ${
              !categorySlug
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background text-foreground border-input hover:bg-accent"
            }`}
          >
            All
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/courses?category=${cat.slug}`}
              className={`rounded-full px-4 py-1.5 text-sm font-medium border transition-colors ${
                categorySlug === cat.slug
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-foreground border-input hover:bg-accent"
              }`}
            >
              {cat.name}
            </Link>
          ))}
        </div>
      )}

      {/* Course grid */}
      {courses.length === 0 ? (
        <div className="rounded-lg border border-dashed p-16 text-center text-muted-foreground">
          <p className="text-lg font-medium">No courses found</p>
          <p className="mt-1 text-sm">
            {searchInput ? "Try a different search term." : "Check back soon for new courses."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
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
                  <span className="text-lg font-bold">
                    {course.price_cents === 0
                      ? "Free"
                      : formatCurrency(course.price_cents, course.currency)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {course.enrollment_count} enrolled
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
