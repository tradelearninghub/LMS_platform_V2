import Link from "next/link";
import { query } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const courses = await query(
    "SELECT * FROM courses WHERE status = 'PUBLISHED' ORDER BY is_featured DESC, created_at DESC LIMIT 6"
  ).catch(() => []);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="container py-24 md:py-32">
          <div className="max-w-3xl">
            <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              Trade Learning Hub V2
            </span>
            <h1 className="mt-4 text-4xl md:text-6xl font-bold tracking-tight">
              Learn to trade with structured, practitioner-led courses.
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl">
              Stock market mastery, technical analysis, and proven strategies —
              delivered through video lessons you can pace yourself, with
              lifetime access on approval.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/courses"
                className="rounded-md bg-primary px-6 py-3 text-primary-foreground font-medium hover:opacity-90"
              >
                Browse courses
              </Link>
              <Link
                href="/register"
                className="rounded-md border border-input px-6 py-3 font-medium hover:bg-accent"
              >
                Create account
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured courses */}
      <section className="border-t bg-muted/20">
        <div className="container py-16">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-semibold">Featured courses</h2>
              <p className="text-muted-foreground mt-2">Hand-picked starting points.</p>
            </div>
            <Link href="/courses" className="text-sm text-primary hover:underline">
              View all →
            </Link>
          </div>

          {courses.length === 0 ? (
            <div className="rounded-lg border border-dashed p-12 text-center text-muted-foreground">
              No courses published yet. An admin can add courses from the dashboard.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((c) => (
                <Link
                  key={c.id}
                  href={`/courses/${c.slug}`}
                  className="group rounded-xl border bg-card overflow-hidden hover:shadow-md transition"
                >
                  <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/30" />
                  <div className="p-5">
                    <h3 className="font-semibold group-hover:text-primary">{c.title}</h3>
                    {c.short_description && (
                      <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                        {c.short_description}
                      </p>
                    )}
                    <p className="mt-4 font-medium">
                      {formatCurrency(c.price_cents, c.currency)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="container py-20 grid md:grid-cols-3 gap-8">
        {[
          { t: "Structured curriculum", d: "Course → Module → Lesson hierarchy keeps your learning on track." },
          { t: "Manual QR payments", d: "Pay via UPI or bank QR. Admin approves and unlocks access." },
          { t: "Lifetime access", d: "Most courses ship with unlimited access — no rentals, no resets." },
        ].map((f) => (
          <div key={f.t} className="rounded-xl border p-6">
            <h3 className="font-semibold">{f.t}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{f.d}</p>
          </div>
        ))}
      </section>
    </>
  );
}
