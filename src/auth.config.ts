import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe auth config (no Prisma, no bcrypt).
 * Used by middleware. Full provider list lives in `auth.ts`.
 */
export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const role = (auth?.user as { role?: string } | undefined)?.role;
      const { pathname } = nextUrl;

      const isAdminRoute = pathname.startsWith("/admin");
      const isStudentRoute = pathname.startsWith("/dashboard") || pathname.startsWith("/learn");
      const isAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/register");

      if (isAdminRoute) return isLoggedIn && role === "ADMIN";
      if (isStudentRoute) return isLoggedIn;
      if (isAuthRoute && isLoggedIn) {
        return Response.redirect(new URL(role === "ADMIN" ? "/admin" : "/dashboard", nextUrl));
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role ?? "STUDENT";
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.id as string;
        (session.user as { role?: string }).role = token.role as string;
      }
      return session;
    },
  },
  providers: [], // populated in auth.ts
};
