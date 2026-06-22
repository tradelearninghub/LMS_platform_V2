import Link from "next/link";
import { query } from "@/lib/db";
import { getSiteSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

const DEFAULT_COURSES = [
  {
    id: "forex-basis",
    title: "Forex Basis",
    slug: "forex-basis",
    price: "₹1999",
    discount: "80% OFF",
    image: "/images/forex-basis.png",
    description: "Learn the fundamentals of Forex trading, chart analysis, and risk management with...",
    curriculum: [
      "Introduction to Forex Market",
      "Currency Pairs & Market Structure",
      "TradingView & MT4/MT5 Setup"
    ]
  },
  {
    id: "forex-advance",
    title: "Forex Advance",
    slug: "forex-advance",
    price: "₹2199",
    discount: "80% OFF",
    image: "/images/forex-advance.png",
    description: "Master advanced Forex trading strategies, smart money concepts, risk management...",
    curriculum: [
      "Advanced Market Structure",
      "Smart Money Concepts (SMC)",
      "Liquidity & Order Blocks"
    ]
  },
  {
    id: "stock-market-basics-for-beginners",
    title: "Stock Market Basics for Beginners",
    slug: "stock-market-basics-for-beginners",
    price: "₹1999",
    discount: "80% OFF",
    image: "/images/stock-basics.png",
    description: "Learn the fundamentals of the stock market, trading basics, chart analysis, a...",
    curriculum: [
      "Introduction to stock market",
      "How Stock Market Works",
      "Demat & Trading Account"
    ]
  }
];

export default async function HomePage() {
  const site = await getSiteSettings();
  
  // Query all published courses from database to resolve links dynamically if they exist
  const dbCourses = await query(
    "SELECT * FROM courses WHERE status = 'PUBLISHED'"
  ).catch(() => []);

  const findCourseUrl = (slug: string) => {
    const dbCourse = dbCourses.find((c: any) => c.slug === slug);
    return dbCourse ? `/courses/${dbCourse.slug}` : `/courses/${slug}`;
  };

  return (
    <div className="bg-white">
      {/* ═══ Hero Section ═══ */}
      <section className="py-20 md:py-28 bg-white overflow-hidden">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left text column */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-[#3b82f6]">
                Premium Trading Education
              </span>
              <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-[#0f172a] leading-[1.1]">
                Trade with <br />
                <span className="text-[#94a3b8]">precision.</span>
              </h1>
              <p className="text-slate-500 text-sm md:text-base leading-relaxed max-w-xl">
                Carefully crafted courses designed for market mastery. Learn professional trading strategies, risk management, and technical analysis.
              </p>
              <div className="pt-4 flex flex-wrap gap-4">
                <Link
                  href="/courses"
                  className="rounded-full bg-[#0f172a] hover:bg-slate-800 px-8 py-3 text-xs font-semibold text-white transition-colors shadow-sm"
                >
                  Explore Courses
                </Link>
                <Link
                  href="/login"
                  className="rounded-full bg-[#f8fafc] border border-slate-200 hover:bg-slate-50 px-8 py-3 text-xs font-semibold text-slate-700 transition-all"
                >
                  Sign In
                </Link>
              </div>
            </div>

            {/* Right graphic column */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <div className="w-full max-w-[440px] aspect-[1.1] rounded-[2rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-50 bg-[#07090e]">
                <img
                  src="/images/hero-chart.png"
                  alt="Stock Market Trading Terminal Chart"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Stats Banner ═══ */}
      <section className="py-12 bg-white border-t border-b border-slate-100">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-3 gap-4 max-w-3xl mx-auto text-center">
            <div className="space-y-1">
              <p className="text-3xl md:text-4xl font-extrabold text-[#0f172a]">10k+</p>
              <p className="text-[10px] md:text-xs font-semibold text-slate-400 uppercase tracking-widest">Active Traders</p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl md:text-4xl font-extrabold text-[#0f172a]">50+</p>
              <p className="text-[10px] md:text-xs font-semibold text-slate-400 uppercase tracking-widest">Premium Strategies</p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl md:text-4xl font-extrabold text-[#0f172a]">24/7</p>
              <p className="text-[10px] md:text-xs font-semibold text-slate-400 uppercase tracking-widest">Community Access</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Latest Courses Section ═══ */}
      <section className="py-20 md:py-24 bg-[#fafafa]">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center max-w-xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#0f172a] tracking-tight">Latest Courses</h2>
            <p className="text-slate-500 text-xs md:text-sm leading-relaxed">
              Enhance your skills with our most recently updated curriculum. <br />
              Start your journey today.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {DEFAULT_COURSES.map((course) => (
              <div key={course.id} className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] overflow-hidden flex flex-col hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all duration-300">
                {/* Course cover and discount badges */}
                <div className="relative aspect-[1.3] bg-slate-50 overflow-hidden">
                  <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                  <div className="absolute top-4 right-4 flex items-center gap-2">
                    <span className="bg-[#10b981] text-white text-[9px] font-extrabold px-2.5 py-1 rounded-md uppercase tracking-wider shadow-sm">
                      {course.discount}
                    </span>
                    <span className="bg-[#3b82f6] text-white text-[9px] font-extrabold px-2.5 py-1 rounded-md shadow-sm">
                      {course.price}
                    </span>
                  </div>
                </div>

                {/* Course core details */}
                <div className="p-7 flex-1 flex flex-col">
                  <h3 className="text-lg font-bold text-[#0f172a] mb-2 leading-snug">{course.title}</h3>
                  <p className="text-[11px] text-slate-400 mb-6 leading-relaxed line-clamp-2">
                    {course.description}
                  </p>

                  <div className="mb-8">
                    <h4 className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-4">
                      Curriculum Includes:
                    </h4>
                    <ul className="space-y-2.5">
                      {course.curriculum.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-600">
                          <span className="text-[#3b82f6] font-semibold mt-0.5">✓</span>
                          <span className="leading-tight">{item}</span>
                        </li>
                      ))}
                      <li className="text-[11px] text-slate-400 italic pt-1 pl-1">
                        ...and more modules
                      </li>
                    </ul>
                  </div>

                  <div className="mt-auto">
                    <Link
                      href={findCourseUrl(course.slug)}
                      className="w-full inline-flex items-center justify-center bg-[#e0e7ff] hover:bg-[#c7d2fe] text-[#4f46e5] font-bold text-xs py-3 rounded-xl transition-all duration-200"
                    >
                      Join Now
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Why Choose Us Section ═══ */}
      <section className="py-20 md:py-24 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center max-w-xl mx-auto mb-16 space-y-3">
            <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-[#3b82f6]">
              Our Advantage
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#0f172a] tracking-tight">Why Choose Us</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Mentorship */}
            <div className="space-y-5 group">
              <div className="aspect-[1.3] rounded-3xl overflow-hidden bg-slate-50 border border-slate-100 shadow-sm">
                <img
                  src="/images/why-mentorship.png"
                  alt="Expert Mentorship Office Brainstorming Session"
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-[#0f172a]">Expert Mentorship</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Learn from seasoned traders with over 10 years of experience in global markets. Our mentors provide...
                </p>
                <a
                  href="#"
                  className="inline-flex items-center gap-1.5 text-[9px] font-bold text-[#3b82f6] hover:text-blue-700 uppercase tracking-wider"
                >
                  Read More <span className="text-xs font-medium">˅</span>
                </a>
              </div>
            </div>

            {/* Live Trading Sessions */}
            <div className="space-y-5 group">
              <div className="aspect-[1.3] rounded-3xl overflow-hidden bg-slate-50 border border-slate-100 shadow-sm">
                <img
                  src="/images/why-live-sessions.png"
                  alt="Live Trading Candlestick Terminal Screen"
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-[#0f172a]">Live Trading Sessions</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Experience real-time market analysis and trade execution. Watch how professionals handle live...
                </p>
                <a
                  href="#"
                  className="inline-flex items-center gap-1.5 text-[9px] font-bold text-[#3b82f6] hover:text-blue-700 uppercase tracking-wider"
                >
                  Read More <span className="text-xs font-medium">˅</span>
                </a>
              </div>
            </div>

            {/* Active Community */}
            <div className="space-y-5 group">
              <div className="aspect-[1.3] rounded-3xl overflow-hidden bg-slate-50 border border-slate-100 shadow-sm">
                <img
                  src="/images/why-community.png"
                  alt="Active Trading Community Café Workspace"
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-[#0f172a]">Active Community</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Join a thriving community of like-minded traders. Share ideas, discuss strategies, and grow together...
                </p>
                <a
                  href="#"
                  className="inline-flex items-center gap-1.5 text-[9px] font-bold text-[#3b82f6] hover:text-blue-700 uppercase tracking-wider"
                >
                  Read More <span className="text-xs font-medium">˅</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
