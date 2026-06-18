import Link from "next/link";
import { requireAdmin } from "@/lib/guards";
import { signOut } from "@/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div className="min-h-screen flex">
      <aside className="hidden md:flex w-64 flex-col border-r bg-card">
        <div className="px-6 h-16 flex items-center font-semibold border-b">Admin</div>
        <nav className="p-4 space-y-1 text-sm">
          <Link href="/admin" className="block rounded-md px-3 py-2 hover:bg-accent">Overview</Link>
          <Link href="/admin/courses" className="block rounded-md px-3 py-2 hover:bg-accent">Courses</Link>
          <Link href="/admin/orders" className="block rounded-md px-3 py-2 hover:bg-accent">Orders</Link>
          <Link href="/admin/students" className="block rounded-md px-3 py-2 hover:bg-accent">Students</Link>
          <Link href="/admin/enrollments" className="block rounded-md px-3 py-2 hover:bg-accent">Enrollments</Link>
          <div className="mt-4 mb-2 px-3 text-[11px] uppercase tracking-wide text-muted-foreground">Settings</div>
          <Link href="/admin/settings/site" className="block rounded-md px-3 py-2 hover:bg-accent">Site & Branding</Link>
          <Link href="/admin/settings/payment" className="block rounded-md px-3 py-2 hover:bg-accent">QR Payment</Link>
          <Link href="/admin/settings/email" className="block rounded-md px-3 py-2 hover:bg-accent">Email (SMTP)</Link>
          <Link href="/admin/email-templates" className="block rounded-md px-3 py-2 hover:bg-accent">Email Templates</Link>
          <Link href="/admin/seo" className="block rounded-md px-3 py-2 hover:bg-accent">SEO</Link>
          <Link href="/admin/homepage" className="block rounded-md px-3 py-2 hover:bg-accent">Homepage Sections</Link>
        </nav>
        <form
          action={async () => { "use server"; await signOut({ redirectTo: "/" }); }}
          className="mt-auto p-4 border-t"
        >
          <button className="text-sm text-muted-foreground hover:text-foreground">Sign out</button>
        </form>
      </aside>
      <div className="flex-1">
        <header className="h-16 border-b bg-white/80 backdrop-blur flex items-center px-6">
          <span className="text-sm text-muted-foreground">Admin console</span>
        </header>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
