"use client";

import { useState } from "react";
import Link from "next/link";

export function StudentMobileNav({
  userEmail,
  signOutAction,
}: {
  userEmail: string;
  signOutAction: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden flex items-center justify-between w-full">
      <Link href="/" className="font-semibold text-sm tracking-tight text-slate-900 flex items-center gap-1">
        <span>←</span>
        <span>Trade Learning Hub</span>
      </Link>

      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded-md hover:bg-accent transition-colors"
        aria-label="Toggle menu"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          {open ? (
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {open && (
        <div className="absolute top-16 left-0 right-0 bg-white border-b shadow-lg z-50 p-4 space-y-3">
          <div className="text-xs text-muted-foreground pb-2 border-b">
            Signed in as <strong>{userEmail}</strong>
          </div>
          <nav className="flex flex-col gap-1 text-sm font-medium">
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2 text-primary hover:bg-accent transition-colors flex items-center gap-2 font-semibold"
            >
              <span>←</span>
              <span>Back to Main Site</span>
            </Link>
            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2 hover:bg-accent transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/dashboard/courses"
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2 hover:bg-accent transition-colors"
            >
              My Courses
            </Link>
            <Link
              href="/dashboard/orders"
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2 hover:bg-accent transition-colors"
            >
              Orders
            </Link>
            <Link
              href="/dashboard/profile"
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2 hover:bg-accent transition-colors"
            >
              Profile
            </Link>
          </nav>

          <form action={signOutAction} className="pt-2 border-t">
            <button
              type="submit"
              onClick={() => setOpen(false)}
              className="w-full text-left rounded-md px-3 py-2 text-xs font-semibold text-destructive hover:bg-destructive/10 transition-colors"
            >
              Sign Out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
