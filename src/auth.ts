import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import crypto from "crypto";

import { authConfig } from "./auth.config";
import { queryOne, query, execute } from "./lib/db";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().optional(),
  otp: z.string().optional(),
});

async function createStudentSession(userId: string, role: string) {
  const sessionId = crypto.randomUUID();
  const tokenStr = crypto.randomBytes(32).toString("hex");

  await execute(
    "INSERT INTO sessions (id, user_id, session_token, revoked) VALUES (?, ?, ?, FALSE)",
    [sessionId, userId, tokenStr]
  );

  if (role === "STUDENT") {
    // Enforce max 2 active sessions (revoke older sessions)
    const activeSessions = await query(
      "SELECT id FROM sessions WHERE user_id = ? AND revoked = FALSE ORDER BY created_at DESC",
      [userId]
    );
    if (activeSessions.length > 2) {
      const toRevoke = activeSessions.slice(2).map((s: any) => s.id);
      for (const sId of toRevoke) {
        await execute("UPDATE sessions SET revoked = TRUE WHERE id = ?", [sId]);
      }
    }
  }

  return sessionId;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password, otp } = parsed.data;

        // Fetch user
        const user = await queryOne("SELECT * FROM users WHERE email = ?", [email]);
        if (!user) return null;
        if (user.status !== "ACTIVE") return null;

        // Case A: OTP Login
        if (otp) {
          const otpToken = await queryOne(
            "SELECT * FROM verification_tokens WHERE identifier = ? AND token = ? AND expires > ?",
            [`otp:${email}`, otp, new Date()]
          );
          if (!otpToken) return null;

          // Delete the verified OTP token so it can't be reused
          await execute("DELETE FROM verification_tokens WHERE identifier = ?", [`otp:${email}`]);

          // Log login time
          await execute("UPDATE users SET last_login_at = ? WHERE id = ?", [new Date(), user.id]);

          const sessionId = await createStudentSession(user.id, user.role);

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            role: user.role,
            sessionId,
          };
        }

        // Case B: Password Login
        if (password && user.password_hash) {
          const ok = await bcrypt.compare(password, user.password_hash);
          if (!ok) return null;

          await execute("UPDATE users SET last_login_at = ? WHERE id = ?", [new Date(), user.id]);

          const sessionId = await createStudentSession(user.id, user.role);

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            role: user.role,
            sessionId,
          };
        }

        return null;
      },
    }),
  ],
});

