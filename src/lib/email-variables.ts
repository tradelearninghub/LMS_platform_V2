/**
 * Centralized Email Template Variable Registry & Substitution Engine
 * Trade Learning Hub LMS
 */

export interface VariableMeta {
  tag: string;
  description: string;
  example: string;
  aliases: string[];
}

export interface TemplateTypeMeta {
  event: string;
  name: string;
  description: string;
  variables: VariableMeta[];
}

export const TEMPLATE_VARIABLES_REGISTRY: Record<string, TemplateTypeMeta> = {
  WELCOME: {
    event: "WELCOME",
    name: "Welcome Email",
    description: "Sent after a new student successfully verifies their email and joins the platform.",
    variables: [
      { tag: "{{user_name}}", description: "Student's registered full name", example: "John Doe", aliases: ["userName", "name", "student_name", "recipient_name"] },
      { tag: "{{user_email}}", description: "Student's email address", example: "john@example.com", aliases: ["userEmail", "email", "recipient_email"] },
      { tag: "{{site_name}}", description: "Platform site name", example: "Trade Learning Hub", aliases: ["siteName"] },
      { tag: "{{login_url}}", description: "Direct login portal URL", example: "http://tradelearninghub.com/login", aliases: ["loginUrl", "link"] },
    ],
  },
  REGISTRATION: {
    event: "REGISTRATION",
    name: "Registration & Email Verification",
    description: "Sent immediately upon signup containing the email confirmation link.",
    variables: [
      { tag: "{{user_name}}", description: "Student's registered full name", example: "John Doe", aliases: ["userName", "name", "student_name"] },
      { tag: "{{user_email}}", description: "Student's email address", example: "john@example.com", aliases: ["userEmail", "email"] },
      { tag: "{{verification_link}}", description: "One-click email verification link", example: "http://tradelearninghub.com/verify-email?token=...", aliases: ["link", "verify_link", "verificationLink", "verifyLink"] },
      { tag: "{{site_name}}", description: "Platform site name", example: "Trade Learning Hub", aliases: ["siteName"] },
    ],
  },
  PAYMENT_RECEIVED: {
    event: "PAYMENT_RECEIVED",
    name: "Payment Received (Pending Review)",
    description: "Sent to student right after they submit offline payment screenshot & UTR for a course.",
    variables: [
      { tag: "{{user_name}}", description: "Payer's or student's name", example: "John Doe", aliases: ["userName", "name", "payer_name", "payerName"] },
      { tag: "{{user_email}}", description: "Student's email address", example: "john@example.com", aliases: ["userEmail", "email"] },
      { tag: "{{course_name}}", description: "Purchased course title", example: "Forex Basis", aliases: ["courseName", "courseTitle", "course_title", "course"] },
      { tag: "{{amount}}", description: "Total order amount formatted with currency symbol", example: "₹1,999.00", aliases: ["order_amount", "amount_in_rupees", "final_amount", "price"] },
      { tag: "{{order_number}}", description: "Unique order reference number", example: "ORD-20260831-AB12", aliases: ["orderNumber", "order_id", "orderId"] },
      { tag: "{{transaction_id}}", description: "Submitted bank UTR or UPI reference string", example: "UTR987654321012", aliases: ["transactionId", "utr", "ref_id"] },
      { tag: "{{order_date}}", description: "Date order was submitted", example: "31 Aug 2026", aliases: ["orderDate", "date"] },
      { tag: "{{site_name}}", description: "Platform site name", example: "Trade Learning Hub", aliases: ["siteName"] },
    ],
  },
  PAYMENT_APPROVED: {
    event: "PAYMENT_APPROVED",
    name: "Payment Approved & Access Granted",
    description: "Sent when admin approves payment and course access is unlocked.",
    variables: [
      { tag: "{{user_name}}", description: "Payer's or student's name", example: "John Doe", aliases: ["userName", "name", "payer_name", "payerName"] },
      { tag: "{{user_email}}", description: "Student's email address", example: "john@example.com", aliases: ["userEmail", "email"] },
      { tag: "{{course_name}}", description: "Unlocked course title", example: "Forex Basis", aliases: ["courseName", "courseTitle", "course_title", "course"] },
      { tag: "{{amount}}", description: "Order amount formatted in Rupees", example: "₹1,999.00", aliases: ["order_amount", "amount_in_rupees", "final_amount", "price"] },
      { tag: "{{order_number}}", description: "Unique order reference number", example: "ORD-20260831-AB12", aliases: ["orderNumber", "order_id", "orderId"] },
      { tag: "{{transaction_id}}", description: "Verified bank UTR / UPI transaction ID", example: "UTR987654321012", aliases: ["transactionId", "utr", "ref_id"] },
      { tag: "{{order_date}}", description: "Date of order / approval", example: "31 Aug 2026", aliases: ["orderDate", "date"] },
      { tag: "{{course_url}}", description: "Direct link to course LMS learning player", example: "http://tradelearninghub.com/learn/forex-basis", aliases: ["courseUrl", "learn_url", "learnUrl", "link"] },
      { tag: "{{site_name}}", description: "Platform site name", example: "Trade Learning Hub", aliases: ["siteName"] },
    ],
  },
  PAYMENT_REJECTED: {
    event: "PAYMENT_REJECTED",
    name: "Payment Rejected",
    description: "Sent when admin rejects a submitted payment with a specified reason.",
    variables: [
      { tag: "{{user_name}}", description: "Payer's or student's name", example: "John Doe", aliases: ["userName", "name", "payer_name", "payerName"] },
      { tag: "{{user_email}}", description: "Student's email address", example: "john@example.com", aliases: ["userEmail", "email"] },
      { tag: "{{course_name}}", description: "Course title", example: "Forex Basis", aliases: ["courseName", "courseTitle", "course_title", "course"] },
      { tag: "{{amount}}", description: "Order amount", example: "₹1,999.00", aliases: ["order_amount", "amount_in_rupees", "final_amount", "price"] },
      { tag: "{{order_number}}", description: "Order number", example: "ORD-20260831-AB12", aliases: ["orderNumber", "order_id", "orderId"] },
      { tag: "{{transaction_id}}", description: "Submitted UTR string", example: "UTR987654321012", aliases: ["transactionId", "utr"] },
      { tag: "{{rejection_reason}}", description: "Admin's specific explanation for rejection", example: "UTR not found in bank statement", aliases: ["reason", "rejectionReason"] },
      { tag: "{{site_name}}", description: "Platform site name", example: "Trade Learning Hub", aliases: ["siteName"] },
    ],
  },
  COURSE_ENROLLMENT: {
    event: "COURSE_ENROLLMENT",
    name: "Course Enrollment Confirmation",
    description: "Sent when a student is enrolled into a free course or manually assigned by an admin.",
    variables: [
      { tag: "{{user_name}}", description: "Student's full name", example: "John Doe", aliases: ["userName", "name", "student_name"] },
      { tag: "{{user_email}}", description: "Student's email address", example: "john@example.com", aliases: ["userEmail", "email"] },
      { tag: "{{course_name}}", description: "Enrolled course title", example: "Stock Market Basics for Beginners", aliases: ["courseName", "courseTitle", "course_title", "course"] },
      { tag: "{{course_url}}", description: "Direct link to start course lessons", example: "http://tradelearninghub.com/learn/stock-market-basics", aliases: ["courseUrl", "learn_url", "learnUrl", "link"] },
      { tag: "{{site_name}}", description: "Platform site name", example: "Trade Learning Hub", aliases: ["siteName"] },
    ],
  },
  PASSWORD_RESET: {
    event: "PASSWORD_RESET",
    name: "Password Reset Request",
    description: "Sent when a user requests a secure single-use password reset link.",
    variables: [
      { tag: "{{user_name}}", description: "Account owner's name", example: "John Doe", aliases: ["userName", "name"] },
      { tag: "{{user_email}}", description: "Account email address", example: "john@example.com", aliases: ["userEmail", "email"] },
      { tag: "{{reset_link}}", description: "Secure single-use password update link", example: "http://tradelearninghub.com/reset-password?token=...", aliases: ["link", "resetLink", "password_reset_link", "passwordResetLink"] },
      { tag: "{{site_name}}", description: "Platform site name", example: "Trade Learning Hub", aliases: ["siteName"] },
    ],
  },
  ACCOUNT_VERIFICATION: {
    event: "ACCOUNT_VERIFICATION",
    name: "Account Verification",
    description: "Sent to verify student email address or confirm identity.",
    variables: [
      { tag: "{{user_name}}", description: "Student's name", example: "John Doe", aliases: ["userName", "name"] },
      { tag: "{{user_email}}", description: "Student's email address", example: "john@example.com", aliases: ["userEmail", "email"] },
      { tag: "{{verification_link}}", description: "Account verification URL", example: "http://tradelearninghub.com/verify-email?token=...", aliases: ["link", "verify_link", "verificationLink"] },
      { tag: "{{site_name}}", description: "Platform site name", example: "Trade Learning Hub", aliases: ["siteName"] },
    ],
  },
  LOGIN_OTP: {
    event: "LOGIN_OTP",
    name: "Login OTP Code",
    description: "Sent when student or admin requests a 6-digit email login code.",
    variables: [
      { tag: "{{user_name}}", description: "Account owner's name", example: "John Doe", aliases: ["userName", "name"] },
      { tag: "{{user_email}}", description: "Account email address", example: "john@example.com", aliases: ["userEmail", "email"] },
      { tag: "{{otp_code}}", description: "6-digit numerical login verification code", example: "482910", aliases: ["otp", "code", "login_code", "otpCode", "loginCode", "link"] },
      { tag: "{{site_name}}", description: "Platform site name", example: "Trade Learning Hub", aliases: ["siteName"] },
    ],
  },
  ADMIN_NOTIFICATION: {
    event: "ADMIN_NOTIFICATION",
    name: "Admin System Alert",
    description: "Sent to platform administrators on important system triggers or new orders.",
    variables: [
      { tag: "{{message}}", description: "Alert message text / payload summary", example: "New order ORD-20260831-01 submitted for review", aliases: ["content", "details", "body"] },
      { tag: "{{user_name}}", description: "Associated student or user's name", example: "John Doe", aliases: ["userName", "name"] },
      { tag: "{{user_email}}", description: "Associated user's email", example: "john@example.com", aliases: ["userEmail", "email"] },
      { tag: "{{order_number}}", description: "Associated order reference", example: "ORD-20260831-01", aliases: ["orderNumber", "order_id"] },
      { tag: "{{amount}}", description: "Associated amount", example: "₹1,999.00", aliases: ["order_amount", "price"] },
      { tag: "{{site_name}}", description: "Platform site name", example: "Trade Learning Hub", aliases: ["siteName"] },
    ],
  },
  CUSTOM_BROADCAST: {
    event: "CUSTOM_BROADCAST",
    name: "Custom Broadcast",
    description: "Broadcast announcements sent to selected students or subscriber lists.",
    variables: [
      { tag: "{{user_name}}", description: "Recipient student's full name", example: "John Doe", aliases: ["userName", "name"] },
      { tag: "{{user_email}}", description: "Recipient's email address", example: "john@example.com", aliases: ["userEmail", "email"] },
      { tag: "{{subject}}", description: "Email subject line", example: "Live Market Analysis Session Tonight", aliases: [] },
      { tag: "{{title}}", description: "Main headline title in email body", example: "Market Updates", aliases: [] },
      { tag: "{{body}}", description: "Main content paragraph text", example: "Join us at 8 PM for live trading analysis.", aliases: ["message", "content"] },
      { tag: "{{site_name}}", description: "Platform site name", example: "Trade Learning Hub", aliases: ["siteName"] },
    ],
  },
};

/**
 * Returns the variable metadata for a given event, or a generic list if event is custom.
 */
export function getAvailableVariablesForEvent(event: string): VariableMeta[] {
  const meta = TEMPLATE_VARIABLES_REGISTRY[event];
  if (meta) return meta.variables;

  return [
    { tag: "{{user_name}}", description: "Recipient name", example: "John Doe", aliases: ["userName", "name"] },
    { tag: "{{user_email}}", description: "Recipient email", example: "john@example.com", aliases: ["userEmail", "email"] },
    { tag: "{{site_name}}", description: "Site name", example: "Trade Learning Hub", aliases: ["siteName"] },
  ];
}

/**
 * Normalizes input variable keys into a unified lookup dictionary containing
 * canonical tags, aliases, camelCase, snake_case, and raw keys.
 */
export function buildNormalizedVariablesMap(
  event: string,
  rawVariables: Record<string, string | number | boolean | null | undefined>
): Map<string, string> {
  const map = new Map<string, string>();

  // 1. Populate raw key entries
  for (const [key, val] of Object.entries(rawVariables)) {
    if (val !== undefined && val !== null) {
      const strVal = String(val);
      map.set(key.toLowerCase(), strVal);
      map.set(key.replace(/_/g, "").toLowerCase(), strVal);
      map.set(key, strVal);
    }
  }

  // 2. Resolve based on registered event aliases
  const meta = TEMPLATE_VARIABLES_REGISTRY[event];
  if (meta) {
    for (const v of meta.variables) {
      const cleanTagKey = v.tag.replace(/[{}]/g, ""); // e.g. "user_name"
      
      // Check if tag is already mapped
      let resolvedValue = map.get(cleanTagKey) || map.get(cleanTagKey.replace(/_/g, ""));

      // If not, check all defined aliases for this variable
      if (!resolvedValue) {
        for (const alias of v.aliases) {
          const aliasVal = map.get(alias) || map.get(alias.toLowerCase()) || map.get(alias.replace(/_/g, "").toLowerCase());
          if (aliasVal) {
            resolvedValue = aliasVal;
            break;
          }
        }
      }

      if (resolvedValue !== undefined) {
        map.set(cleanTagKey, resolvedValue);
        map.set(cleanTagKey.replace(/_/g, ""), resolvedValue);
        for (const alias of v.aliases) {
          map.set(alias, resolvedValue);
          map.set(alias.toLowerCase(), resolvedValue);
        }
      }
    }
  }

  return map;
}

/**
 * Replaces all placeholder tags in `content` with matching values.
 * If a tag has a resolved value, it is substituted.
 * If a tag does NOT have a matching value, it is preserved as literal `{{tag}}`
 * so misspellings/mistakes remain visible as requested in item (e).
 */
export function replaceTemplateVariables(
  content: string,
  event: string,
  variables: Record<string, string | number | boolean | null | undefined>
): string {
  if (!content) return "";

  const varMap = buildNormalizedVariablesMap(event, variables);

  // Regex to match {{ variable_name }} with optional surrounding whitespace
  return content.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (match, key: string) => {
    const rawKey = key;
    const lowerKey = key.toLowerCase();
    const noUnderscore = lowerKey.replace(/_/g, "");

    if (varMap.has(rawKey)) {
      return varMap.get(rawKey)!;
    }
    if (varMap.has(lowerKey)) {
      return varMap.get(lowerKey)!;
    }
    if (varMap.has(noUnderscore)) {
      return varMap.get(noUnderscore)!;
    }

    // Unmatched tag: keep as literal text so the mistake is visible (per req e)
    return match;
  });
}
