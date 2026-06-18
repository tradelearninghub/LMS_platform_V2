import Link from "next/link";
import { query } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";
import { getSiteSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const site = await getSiteSettings();
  const courses = await query(
    "SELECT * FROM courses WHERE status = 'PUBLISHED' ORDER BY is_featured DESC, created_at DESC LIMIT 6"
  ).catch(() => []);

  const totalStudents = await query("SELECT COUNT(*) AS count FROM users WHERE role = 'STUDENT'").catch(() => [{ count: 0 }]);
  const totalCourses = await query("SELECT COUNT(*) AS count FROM courses WHERE status = 'PUBLISHED'").catch(() => [{ count: 0 }]);
  const totalEnrollments = await query("SELECT COUNT(*) AS count FROM enrollments").catch(() => [{ count: 0 }]);

  return (
    <>
      {/* ═══ Hero Section ═══ */}
      <section className="relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-primary/8 blur-3xl -translate-x-1/2 translate-y-1/2" />
        </div>

        <div className="container py-24 md:py-36">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary ring-1 ring-primary/20">
              <span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse" />
              {site.site_name || "Trade Learning Hub"} — Now Live
            </span>
            <h1 className="mt-6 text-4xl md:text-6xl font-bold tracking-tight leading-[1.1]">
              Learn to trade with{" "}
              <span className="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
                structured, practitioner-led
              </span>{" "}
              courses.
            </h1>
            <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
              Stock market mastery, technical analysis, and proven strategies —
              delivered through video lessons you can pace yourself, with
              lifetime access on approval.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/courses"
                className="rounded-lg bg-primary px-8 py-3.5 text-primary-foreground font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-primary/25"
              >
                Browse Courses
              </Link>
              <Link
                href="/register"
                className="rounded-lg border-2 border-input px-8 py-3.5 font-semibold hover:bg-accent hover:border-accent transition-all"
              >
                Create Free Account
              </Link>
            </div>

            {/* Trust stats */}
            <div className="mt-12 flex flex-wrap gap-8 md:gap-12 pt-8 border-t border-border/50">
              <div>
                <p className="text-3xl font-bold text-foreground">{totalStudents[0]?.count || "0"}+</p>
                <p className="text-sm text-muted-foreground mt-1">Students enrolled</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground">{totalCourses[0]?.count || "0"}+</p>
                <p className="text-sm text-muted-foreground mt-1">Published courses</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground">{totalEnrollments[0]?.count || "0"}+</p>
                <p className="text-sm text-muted-foreground mt-1">Total enrollments</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground">∞</p>
                <p className="text-sm text-muted-foreground mt-1">Lifetime access</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Featured Courses ═══ */}
      <section className="border-t bg-muted/20">
        <div className="container py-20">
          <div className="flex items-end justify-between mb-10">
            <div>
              <span className="inline-block text-xs font-semibold uppercase tracking-wider text-primary mb-2">
                Popular Courses
              </span>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Featured courses</h2>
              <p className="text-muted-foreground mt-2">Hand-picked starting points for your trading journey.</p>
            </div>
            <Link href="/courses" className="hidden md:inline-flex text-sm font-medium text-primary hover:underline items-center gap-1">
              View all courses
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>

          {courses.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed p-16 text-center text-muted-foreground">
              <p className="text-lg font-medium">No courses published yet</p>
              <p className="mt-2 text-sm">An admin can add courses from the dashboard.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((c) => (
                <Link
                  key={c.id}
                  href={`/courses/${c.slug}`}
                  className="group rounded-2xl border bg-card overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="aspect-video bg-gradient-to-br from-primary/20 via-primary/10 to-accent/30 relative">
                    {c.is_featured === 1 && (
                      <span className="absolute top-3 left-3 rounded-full bg-primary px-2.5 py-0.5 text-[11px] font-semibold text-primary-foreground uppercase tracking-wide">
                        Featured
                      </span>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="font-semibold text-lg group-hover:text-primary transition-colors line-clamp-1">{c.title}</h3>
                    {c.short_description && (
                      <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                        {c.short_description}
                      </p>
                    )}
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-xl font-bold">
                        {c.price_cents === 0
                          ? "Free"
                          : formatCurrency(c.price_cents, c.currency)}
                      </span>
                      <span className="text-xs text-primary font-medium group-hover:underline">
                        View details →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="mt-8 text-center md:hidden">
            <Link href="/courses" className="text-sm font-medium text-primary hover:underline">
              View all courses →
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ Why Choose Us ═══ */}
      <section className="container py-24">
        <div className="text-center mb-14">
          <span className="inline-block text-xs font-semibold uppercase tracking-wider text-primary mb-2">
            Why Choose Us
          </span>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Everything you need to succeed</h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
            Our platform is built for serious learners who want structured, practitioner-led education.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: "📚",
              title: "Structured Curriculum",
              desc: "Course → Module → Lesson hierarchy keeps your learning on track with a clear progression path.",
            },
            {
              icon: "💳",
              title: "Simple QR Payments",
              desc: "Pay via UPI QR code. Upload your screenshot and admin approves — no complex payment gateways.",
            },
            {
              icon: "♾️",
              title: "Lifetime Access",
              desc: "All courses come with unlimited, lifetime access — no rentals, no resets, no subscriptions.",
            },
            {
              icon: "🎥",
              title: "Video Lessons",
              desc: "Learn at your own pace with high-quality video lessons you can rewatch anytime.",
            },
            {
              icon: "📊",
              title: "Progress Tracking",
              desc: "Track your completion progress across all enrolled courses with visual indicators.",
            },
            {
              icon: "📜",
              title: "Invoice Downloads",
              desc: "Download professional PDF receipts for every purchase directly from your dashboard.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border bg-card p-7 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group"
            >
              <span className="text-3xl block mb-4">{f.icon}</span>
              <h3 className="font-semibold text-lg">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ How It Works ═══ */}
      <section className="border-t bg-muted/20">
        <div className="container py-24">
          <div className="text-center mb-14">
            <span className="inline-block text-xs font-semibold uppercase tracking-wider text-primary mb-2">
              Getting Started
            </span>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">How it works</h2>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
              Get started in just 3 simple steps.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                step: "01",
                title: "Create Account",
                desc: "Sign up for free, verify your email, and set up your profile.",
              },
              {
                step: "02",
                title: "Choose & Pay",
                desc: "Browse courses, scan the UPI QR, and upload your payment screenshot.",
              },
              {
                step: "03",
                title: "Start Learning",
                desc: "Once approved, access all your course content with lifetime access.",
              },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary font-bold text-xl mb-5">
                  {s.step}
                </div>
                <h3 className="font-semibold text-lg">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA Banner ═══ */}
      <section className="container py-24">
        <div className="rounded-3xl bg-gradient-to-r from-primary to-blue-500 px-8 py-16 md:px-16 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImEiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PGNpcmNsZSBjeD0iMTAiIGN5PSIxMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCBmaWxsPSJ1cmwoI2EpIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIi8+PC9zdmc+')] opacity-50" />
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Ready to start your trading journey?
            </h2>
            <p className="mt-4 text-white/80 max-w-xl mx-auto text-lg">
              Join our growing community of learners. Pick a course and start today.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href="/courses"
                className="rounded-lg bg-white text-primary px-8 py-3.5 font-semibold hover:bg-white/90 transition-opacity shadow-lg"
              >
                Browse Courses
              </Link>
              <Link
                href="/register"
                className="rounded-lg border-2 border-white/30 text-white px-8 py-3.5 font-semibold hover:bg-white/10 transition-all"
              >
                Sign Up Free
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
