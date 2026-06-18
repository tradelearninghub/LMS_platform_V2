import Link from "next/link";
import { queryOne, execute } from "@/lib/db";
import { CheckCircle, XCircle } from "lucide-react";

interface VerifyEmailProps {
  searchParams: Promise<{
    token?: string;
    email?: string;
  }>;
}

export const dynamic = "force-dynamic";


export default async function VerifyEmailPage({ searchParams }: VerifyEmailProps) {
  const params = await searchParams;
  const token = params.token;
  const email = params.email;

  if (!token || !email) {
    return (
      <div className="text-center">
        <XCircle className="mx-auto h-12 w-12 text-destructive" />
        <h1 className="mt-4 text-2xl font-semibold text-foreground">Invalid Verification Link</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The email verification link is incomplete or missing query parameters.
        </p>
        <div className="mt-6">
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
          >
            Go back to Login
          </Link>
        </div>
      </div>
    );
  }

  // Look up verification token
  const tokenRecord = await queryOne(
    "SELECT * FROM verification_tokens WHERE identifier = ? AND token = ?",
    [email, token]
  );

  const isExpired = tokenRecord ? new Date() > new Date(tokenRecord.expires) : true;

  if (!tokenRecord || isExpired) {
    return (
      <div className="text-center">
        <XCircle className="mx-auto h-12 w-12 text-destructive" />
        <h1 className="mt-4 text-2xl font-semibold text-foreground">Link Expired or Invalid</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The verification link has expired or has already been used. Please request a new verification link.
        </p>
        <div className="mt-6 space-y-4">
          <form action="/login" method="GET">
            <input type="hidden" name="email" value={email} />
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
            >
              Sign In / Resend Verification
            </button>
          </form>
          <Link href="/register" className="block text-sm text-primary hover:underline">
            Create a new account
          </Link>
        </div>
      </div>
    );
  }

  // Token is valid! Verify the user
  await execute(
    "UPDATE users SET status = 'ACTIVE', email_verified = ? WHERE email = ?",
    [new Date(), email]
  );

  // Clean up verification token
  await execute(
    "DELETE FROM verification_tokens WHERE identifier = ? AND token = ?",
    [email, token]
  );

  return (
    <div className="text-center">
      <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
      <h1 className="mt-4 text-2xl font-semibold text-foreground">Email Verified!</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Thank you for verifying your email. Your account is now fully active and ready.
      </p>
      <div className="mt-6">
        <Link
          href="/login?verified=true"
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
        >
          Sign In
        </Link>
      </div>
    </div>
  );
}
