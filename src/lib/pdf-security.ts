import crypto from "crypto";

const PDF_SECRET = process.env.PDF_SIGNING_SECRET || process.env.AUTH_SECRET || "pdf-signing-secret-change-me";

interface SignedPayload {
  lessonId: string;
  userId: string;
  exp: number;
}

/**
 * Generates a time-limited signed URL token for accessing a PDF lesson.
 * The token encodes lessonId + userId + expiry and is verified server-side.
 */
export function generateSignedPdfUrl(
  lessonId: string,
  userId: string,
  ttlSeconds: number = 3600
): string {
  const exp = Math.floor(Date.now() / 1000) + ttlSeconds;
  const payload = JSON.stringify({ lessonId, userId, exp });
  const payloadB64 = Buffer.from(payload).toString("base64url");
  const signature = crypto
    .createHmac("sha256", PDF_SECRET)
    .update(payloadB64)
    .digest("base64url");

  return `${payloadB64}.${signature}`;
}

/**
 * Verifies a signed PDF token and returns the decoded payload.
 * Returns null if the token is invalid, expired, or tampered with.
 */
export function verifySignedPdfToken(
  token: string
): SignedPayload | null {
  const parts = token.split(".");
  if (parts.length !== 2) return null;

  const [payloadB64, signature] = parts;

  // Verify HMAC
  const expectedSig = crypto
    .createHmac("sha256", PDF_SECRET)
    .update(payloadB64)
    .digest("base64url");

  if (signature !== expectedSig) return null;

  // Decode payload
  try {
    const payload: SignedPayload = JSON.parse(
      Buffer.from(payloadB64, "base64url").toString("utf-8")
    );

    // Check expiry
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;

    return payload;
  } catch {
    return null;
  }
}

/**
 * Returns the full URL path for accessing a PDF via signed token.
 */
export function getSignedPdfApiUrl(token: string): string {
  return `/api/pdf/${token}`;
}
