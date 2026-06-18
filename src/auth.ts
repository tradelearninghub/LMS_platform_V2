import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { authConfig } from "./auth.config";
import { queryOne, execute } from "./lib/db";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().optional(),
  otp: z.string().optional(),
});

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

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            role: user.role,
          };
        }

        // Case B: Password Login
        if (password && user.password_hash) {
          const ok = await bcrypt.compare(password, user.password_hash);
          if (!ok) return null;

          await execute("UPDATE users SET last_login_at = ? WHERE id = ?", [new Date(), user.id]);

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            role: user.role,
          };
        }

        return null;
      },
    }),
  ],
});
