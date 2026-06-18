import Link from "next/link";
import { requireUser } from "@/lib/guards";
import { signOut } from "@/auth";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  return (
    <div className="min-h-screen flex">
      <aside className="hidden md:flex w-64 flex-col border-r bg-card">
        <div className="px-6 h-16 flex items-center font-semibold border-b">My Learning</div>
        <nav className="p-4 space-y-1 text-sm">
          <Link href="/dashboard" className="block rounded-md px-3 py-2 hover:bg-accent">Dashboard</Link>
          <Link href="/dashboard/courses" className="block rounded-md px-3 py-2 hover:bg-accent">My Courses</Link>
          <Link href="/dashboard/orders" className="block rounded-md px-3 py-2 hover:bg-accent">Orders</Link>
          <Link href="/dashboard/profile" className="block rounded-md px-3 py-2 hover:bg-accent">Profile</Link>
        </nav>
        <form
          action={async () => { "use server"; await signOut({ redirectTo: "/" }); }}
          className="mt-auto p-4 border-t"
        >
          <button className="text-sm text-muted-foreground hover:text-foreground">
            Sign out
          </button>
        </form>
      </aside>
      <div className="flex-1">
        <header className="h-16 border-b bg-white/80 backdrop-blur flex items-center px-6">
          <span className="text-sm text-muted-foreground">Signed in as {user.email}</span>
        </header>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
