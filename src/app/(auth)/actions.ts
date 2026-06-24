"use server";

import { signIn } from "@/auth";
import { queryOne, execute } from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { sendEventEmail } from "@/lib/email";
import crypto from "crypto";

// ── Schemas ──────────────────────────────────────────────────────────────────

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Enter a valid email address"),
    mobile: z.string().optional(),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const forgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});

const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Token is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const otpRequestSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});

const otpVerifySchema = z.object({
  email: z.string().email("Enter a valid email address"),
  otp: z.string().length(6, "OTP must be exactly 6 digits"),
});

// ── Types ────────────────────────────────────────────────────────────────────

export type FormState = {
  error?: string;
  success?: string;
  fieldErrors?: Record<string, string[] | undefined>;
  pendingVerification?: boolean;
};

export type LoginState = FormState;
export type RegisterState = FormState;

// ── Actions ──────────────────────────────────────────────────────────────────

export async function loginAction(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const raw = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const user = await queryOne("SELECT * FROM users WHERE email = ?", [parsed.data.email]);
  if (!user) {
    return { error: "Invalid email or password." };
  }
  if (user.status === "PENDING_VERIFICATION") {
    return { error: "Please verify your email address before signing in.", pendingVerification: true };
  }
  if (user.status !== "ACTIVE") {
    return { error: "Your account is suspended. Please contact support." };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid email or password." };
        default:
          return { error: "Something went wrong. Please try again." };
      }
    }
    throw error;
  }

  redirect(user.role === "ADMIN" ? "/admin" : "/dashboard");
}

export async function registerAction(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const raw = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    mobile: (formData.get("mobile") as string) || undefined,
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string,
  };

  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const existing = await queryOne("SELECT id FROM users WHERE email = ?", [parsed.data.email]);
  if (existing) {
    return { error: "An account with this email already exists." };
  }

  const id = crypto.randomUUID();
  const passwordHash = await bcrypt.hash(parsed.data.password, 10);

  // Insert user with status PENDING_VERIFICATION
  await execute(
    `INSERT INTO users (id, email, email_verified, name, password_hash, role, status, mobile) 
     VALUES (?, ?, NULL, ?, ?, 'STUDENT', 'PENDING_VERIFICATION', ?)`,
    [id, parsed.data.email, parsed.data.name, passwordHash, parsed.data.mobile || null]
  );

  // Generate verification token
  const token = crypto.randomUUID();
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  await execute(
    "INSERT INTO verification_tokens (identifier, token, expires) VALUES (?, ?, ?)",
    [parsed.data.email, token, expires]
  );

  // Send verification email
  const appUrl = process.env.APP_URL || "http://localhost:3000";
  const link = `${appUrl}/verify-email?token=${token}&email=${encodeURIComponent(parsed.data.email)}`;
  await sendEventEmail("REGISTRATION", parsed.data.email, { link });

  return { success: "Verification email sent. Please check your inbox." };
}

export async function resendVerificationAction(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const email = formData.get("email") as string;
  if (!email) return { error: "Email is required" };

  const user = await queryOne("SELECT status FROM users WHERE email = ?", [email]);
  if (!user) return { error: "No account found with this email." };
  if (user.status !== "PENDING_VERIFICATION") return { error: "Account is already verified or active." };

  // Delete older tokens
  await execute("DELETE FROM verification_tokens WHERE identifier = ?", [email]);

  const token = crypto.randomUUID();
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await execute(
    "INSERT INTO verification_tokens (identifier, token, expires) VALUES (?, ?, ?)",
    [email, token, expires]
  );

  const appUrl = process.env.APP_URL || "http://localhost:3000";
  const link = `${appUrl}/verify-email?token=${token}&email=${encodeURIComponent(email)}`;
  await sendEventEmail("REGISTRATION", email, { link });

  return { success: "Verification email sent. Please check your inbox." };
}

export async function forgotPasswordAction(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const email = formData.get("email") as string;
  const parsed = forgotPasswordSchema.safeParse({ email });
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors.email?.[0] };
  }

  const user = await queryOne("SELECT id FROM users WHERE email = ?", [parsed.data.email]);
  if (!user) {
    // Return success message even if email doesn't exist for security
    return { success: "If that email exists, we have sent a password reset link." };
  }

  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour
  const resetId = crypto.randomUUID();

  await execute(
    "INSERT INTO password_reset_tokens (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)",
    [resetId, user.id, token, expiresAt]
  );

  const appUrl = process.env.APP_URL || "http://localhost:3000";
  const link = `${appUrl}/reset-password?token=${token}`;
  await sendEventEmail("PASSWORD_RESET", parsed.data.email, { link });

  return { success: "If that email exists, we have sent a password reset link." };
}

export async function resetPasswordAction(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const raw = {
    token: formData.get("token") as string,
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string,
  };

  const parsed = resetPasswordSchema.safeParse(raw);
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const resetToken = await queryOne(
    "SELECT * FROM password_reset_tokens WHERE token = ? AND used_at IS NULL AND expires_at > ?",
    [parsed.data.token, new Date()]
  );
  if (!resetToken) {
    return { error: "Invalid or expired reset token." };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  await execute("UPDATE users SET password_hash = ? WHERE id = ?", [passwordHash, resetToken.user_id]);
  await execute("UPDATE password_reset_tokens SET used_at = ? WHERE id = ?", [new Date(), resetToken.id]);

  return { success: "Password reset successfully. You can now sign in." };
}

export async function sendOtpAction(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const email = formData.get("email") as string;
  const parsed = otpRequestSchema.safeParse({ email });
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors.email?.[0] };
  }

  const user = await queryOne("SELECT * FROM users WHERE email = ?", [parsed.data.email]);
  if (!user) {
    return { error: "No active account found with this email." };
  }
  if (user.status !== "ACTIVE") {
    return { error: "Account is not active." };
  }

  // Generate 6-digit OTP code
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  // Clear previous OTPs
  await execute("DELETE FROM verification_tokens WHERE identifier = ?", [`otp:${parsed.data.email}`]);

  await execute(
    "INSERT INTO verification_tokens (identifier, token, expires) VALUES (?, ?, ?)",
    [`otp:${parsed.data.email}`, otp, expires]
  );

  await sendEventEmail("ACCOUNT_VERIFICATION", parsed.data.email, { link: otp });

  return { success: "OTP sent. Check your email inbox." };
}

export async function loginWithOtpAction(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const raw = {
    email: formData.get("email") as string,
    otp: formData.get("otp") as string,
  };

  const parsed = otpVerifySchema.safeParse(raw);
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const user = await queryOne("SELECT role FROM users WHERE email = ?", [parsed.data.email]);
  if (!user) return { error: "Invalid verification." };

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      otp: parsed.data.otp,
      redirect: false,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Invalid or expired OTP code." };
    }
    throw error;
  }

  redirect(user.role === "ADMIN" ? "/admin" : "/dashboard");
}
