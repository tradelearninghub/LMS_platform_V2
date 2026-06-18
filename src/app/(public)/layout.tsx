import Link from "next/link";
import { getSiteSettings } from "@/lib/settings";
import { auth } from "@/auth";
import { MobileNav } from "./mobile-nav";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const site = await getSiteSettings();
  const session = await auth();
  const isLoggedIn = !!session?.user;
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-white/80 backdrop-blur sticky top-0 z-40">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="font-bold text-lg tracking-tight">
            {site.siteName}
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <Link href="/courses" className="hover:text-primary transition-colors">
              Courses
            </Link>
            {isLoggedIn ? (
              <>
                <Link
                  href={isAdmin ? "/admin" : "/dashboard"}
                  className="hover:text-primary transition-colors"
                >
                  {isAdmin ? "Admin" : "Dashboard"}
                </Link>
                <Link
                  href={isAdmin ? "/admin" : "/dashboard"}
                  className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:opacity-90 transition-opacity"
                >
                  {session.user?.name || "My Account"}
                </Link>
              </>
            ) : (
              <>
                <Link href="/login" className="hover:text-primary transition-colors">
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:opacity-90 transition-opacity"
                >
                  Get started
                </Link>
              </>
            )}
          </nav>

          {/* Mobile nav */}
          <MobileNav isLoggedIn={isLoggedIn} isAdmin={isAdmin} userName={session?.user?.name} />
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t bg-muted/30">
        <div className="container py-8 text-sm text-muted-foreground flex flex-col md:flex-row justify-between gap-4">
          <p>&copy; {new Date().getFullYear()} {site.siteName}. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/courses" className="hover:text-foreground transition-colors">Courses</Link>
            {site.termsUrl && <Link href={site.termsUrl} className="hover:text-foreground transition-colors">Terms</Link>}
            {site.privacyUrl && <Link href={site.privacyUrl} className="hover:text-foreground transition-colors">Privacy</Link>}
            {site.refundUrl && <Link href={site.refundUrl} className="hover:text-foreground transition-colors">Refund</Link>}
          </div>
        </div>
      </footer>
    </div>
  );
}
