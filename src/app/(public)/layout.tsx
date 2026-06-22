import Link from "next/link";
import { getSiteSettings } from "@/lib/settings";
import { auth } from "@/auth";
import { MobileNav } from "./mobile-nav";
import { Twitter, Instagram, Youtube, Send } from "lucide-react";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const site = await getSiteSettings();
  const session = await auth();
  const isLoggedIn = !!session?.user;
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* HEADER */}
      <header className="border-b border-slate-100 bg-white/80 backdrop-blur sticky top-0 z-40">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="font-semibold text-lg tracking-tight text-slate-900">
            {site.site_name || site.siteName || "Trade Learning Hub"}
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <Link href="/courses" className="hover:text-slate-900 transition-colors">
              Courses
            </Link>
            <Link href="#" className="hover:text-slate-900 transition-colors">
              Research
            </Link>
            {isLoggedIn ? (
              <>
                <Link
                  href={isAdmin ? "/admin" : "/dashboard"}
                  className="hover:text-slate-900 transition-colors"
                >
                  {isAdmin ? "Admin" : "Dashboard"}
                </Link>
                <Link
                  href={isAdmin ? "/admin" : "/dashboard"}
                  className="border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 px-5 py-1.5 rounded-full text-xs font-semibold shadow-sm transition-all"
                >
                  {session.user?.name || "My Account"}
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 px-5 py-1.5 rounded-full text-xs font-semibold shadow-sm transition-all"
                >
                  Sign In
                </Link>
              </>
            )}
          </nav>

          {/* Mobile nav */}
          <MobileNav isLoggedIn={isLoggedIn} isAdmin={isAdmin} userName={session?.user?.name} />
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1">{children}</main>

      {/* FOOTER */}
      <footer className="border-t border-slate-100 bg-[#fafafa] text-slate-600">
        <div className="container py-16">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-12 border-b border-slate-100">
            <div className="md:col-span-6 space-y-4">
              <Link href="/" className="font-semibold text-lg tracking-tight text-slate-900">
                {site.site_name || site.siteName || "Trade Learning Hub"}
              </Link>
              <p className="text-sm text-slate-500 max-w-sm leading-relaxed">
                Trade Learning Hub is an online platform dedicated to providing high-quality trading and skill-based courses to help learners grow and succeed in financial markets.
              </p>
            </div>
            <div className="md:col-span-3 space-y-4">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest">Platform</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li><Link href="/courses" className="hover:text-slate-900 transition-colors">Courses</Link></li>
                <li><Link href="#" className="hover:text-slate-900 transition-colors">Research</Link></li>
                <li><Link href="#" className="hover:text-slate-900 transition-colors">Get in Touch</Link></li>
                <li><Link href={isLoggedIn ? (isAdmin ? "/admin" : "/dashboard") : "/login"} className="hover:text-slate-900 transition-colors">Sign In</Link></li>
              </ul>
            </div>
            <div className="md:col-span-3 space-y-4">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest">Legal</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li><Link href={site.termsUrl || "#"} className="hover:text-slate-900 transition-colors">Terms of Service</Link></li>
                <li><Link href={site.privacyUrl || "#"} className="hover:text-slate-900 transition-colors">Privacy Policy</Link></li>
                <li><Link href={site.refundUrl || "#"} className="hover:text-slate-900 transition-colors">Refund Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-400">
            <p>&copy; {new Date().getFullYear()} {site.site_name || site.siteName || "Trade Learning Hub"}. All rights reserved.</p>
            <div className="flex gap-4">
              <a href="#" className="text-slate-400 hover:text-slate-600 transition-colors" aria-label="Twitter">
                <Twitter className="w-4.5 h-4.5" />
              </a>
              <a href="#" className="text-slate-400 hover:text-slate-600 transition-colors" aria-label="Instagram">
                <Instagram className="w-4.5 h-4.5" />
              </a>
              <a href="#" className="text-slate-400 hover:text-slate-600 transition-colors" aria-label="YouTube">
                <Youtube className="w-4.5 h-4.5" />
              </a>
              <a href="#" className="text-slate-400 hover:text-slate-600 transition-colors" aria-label="Telegram">
                <Send className="w-4.5 h-4.5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
