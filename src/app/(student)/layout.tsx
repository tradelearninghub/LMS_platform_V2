import Link from "next/link";
import { requireUser } from "@/lib/guards";
import { signOut } from "@/auth";
import { StudentMobileNav } from "./student-mobile-nav";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();

  const handleSignOut = async () => {
    "use server";
    await signOut({ redirectTo: "/" });
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#fafafa]">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r bg-card shrink-0">
        <div className="px-6 h-16 flex items-center justify-between border-b">
          <Link href="/" className="font-semibold text-base hover:text-primary transition-colors flex items-center gap-2">
            <span>Trade Learning Hub</span>
          </Link>
        </div>
        <nav className="p-4 space-y-1 text-sm font-medium">
          <Link href="/" className="block rounded-md px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors flex items-center gap-1.5 font-semibold mb-2">
            <span>←</span>
            <span>Back to Main Site</span>
          </Link>
          <div className="border-t my-2"></div>
          <Link href="/dashboard" className="block rounded-md px-3 py-2 hover:bg-accent transition-colors">Dashboard</Link>
          <Link href="/dashboard/courses" className="block rounded-md px-3 py-2 hover:bg-accent transition-colors">My Courses</Link>
          <Link href="/dashboard/orders" className="block rounded-md px-3 py-2 hover:bg-accent transition-colors">Orders</Link>
          <Link href="/dashboard/profile" className="block rounded-md px-3 py-2 hover:bg-accent transition-colors">Profile</Link>
        </nav>
        <form action={handleSignOut} className="mt-auto p-4 border-t">
          <button className="w-full text-left text-xs font-semibold text-destructive hover:bg-destructive/10 px-3 py-2 rounded-md transition-colors">
            Sign out
          </button>
        </form>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Desktop & Mobile Header */}
        <header className="h-16 border-b bg-white/80 backdrop-blur flex items-center justify-between px-6 sticky top-0 z-30">
          {/* Mobile Navigation Drawer */}
          <StudentMobileNav userEmail={user.email || ""} signOutAction={handleSignOut} />

          {/* Desktop Top Header Bar */}
          <div className="hidden md:flex items-center justify-between w-full">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3.5 py-1.5 rounded-full transition-colors"
            >
              <span>←</span>
              <span>Back to Main Site</span>
            </Link>
            <span className="text-xs text-muted-foreground">Signed in as <strong className="text-foreground">{user.email}</strong></span>
          </div>
        </header>

        <div className="p-6 flex-1">{children}</div>
      </div>
    </div>
  );
}
