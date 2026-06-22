"use client";

import { useState } from "react";
import Link from "next/link";

export function MobileNav({
  isLoggedIn,
  isAdmin,
  userName,
}: {
  isLoggedIn: boolean;
  isAdmin: boolean;
  userName?: string | null;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
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
        <div className="absolute top-16 left-0 right-0 bg-white border-b shadow-lg z-50">
          <nav className="container py-4 flex flex-col gap-2 text-sm">
            <Link
              href="/courses"
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2 hover:bg-accent transition-colors"
            >
              Courses
            </Link>
            <Link
              href="/research"
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2 hover:bg-accent transition-colors"
            >
              Research
            </Link>
            {isLoggedIn ? (
              <>
                <Link
                  href={isAdmin ? "/admin" : "/dashboard"}
                  onClick={() => setOpen(false)}
                  className="rounded-md px-3 py-2 hover:bg-accent transition-colors"
                >
                  {isAdmin ? "Admin" : "Dashboard"}
                </Link>
                <div className="border-t mt-2 pt-2">
                  <span className="px-3 py-2 text-muted-foreground text-xs">
                    Signed in as {userName || "User"}
                  </span>
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="rounded-md px-3 py-2 hover:bg-accent transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  onClick={() => setOpen(false)}
                  className="rounded-md bg-primary px-3 py-2 text-primary-foreground text-center"
                >
                  Get started
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </div>
  );
}
