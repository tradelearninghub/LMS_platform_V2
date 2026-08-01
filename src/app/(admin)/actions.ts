"use server";

import { queryOne, query, execute } from "@/lib/db";
import { requireAdmin } from "@/lib/guards";
import { slugify } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { sendEventEmail } from "@/lib/email";
import crypto from "crypto";
import nodemailer from "nodemailer";

// ── Course CRUD ─────────────────────────────────────────────────────────────

export async function createCourseAction(_prev: unknown, formData: FormData) {
  await requireAdmin();
  const title = formData.get("title") as string;
  const slug = slugify(title);
  const shortDescription = (formData.get("shortDescription") as string) || null;
  const description = (formData.get("description") as string) || null;
  const mrpCents = Math.round(parseFloat(formData.get("mrpCents") as string || "0") * 100) || 0;
  const sellingPriceCents = Math.round(parseFloat(formData.get("sellingPriceCents") as string || "0") * 100) || 0;
  const categoryId = (formData.get("categoryId") as string) || null;
  const isFeatured = formData.get("isFeatured") === "on";

  if (!title) return { error: "Title is required" };

  // Check slug uniqueness
  const existing = await queryOne("SELECT id FROM courses WHERE slug = ?", [slug]);
  if (existing) return { error: "A course with a similar title already exists" };

  const id = crypto.randomUUID();

  await execute(
    `INSERT INTO courses (id, title, slug, short_description, description, price_cents, mrp_cents, selling_price_cents, category_id, is_featured, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'DRAFT')`,
    [id, title, slug, shortDescription, description, sellingPriceCents, mrpCents, sellingPriceCents, categoryId, isFeatured]
  );

  revalidatePath("/admin/courses");
  return { success: true };
}

export async function updateCourseAction(_prev: unknown, formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  const title = formData.get("title") as string;
  const shortDescription = (formData.get("shortDescription") as string) || null;
  const description = (formData.get("description") as string) || null;
  const mrpCents = Math.round(parseFloat(formData.get("mrpCents") as string || "0") * 100) || 0;
  const sellingPriceCents = Math.round(parseFloat(formData.get("sellingPriceCents") as string || "0") * 100) || 0;
  const categoryId = (formData.get("categoryId") as string) || null;
  const isFeatured = formData.get("isFeatured") === "on";
  const status = formData.get("status") as string;
  const seoTitle = (formData.get("seoTitle") as string) || null;
  const seoDescription = (formData.get("seoDescription") as string) || null;
  const thumbnailUrl = (formData.get("thumbnailUrl") as string) || null;

  if (!id || !title) return { error: "Missing required fields" };

  await execute(
    `UPDATE courses 
     SET title = ?, short_description = ?, description = ?, price_cents = ?, mrp_cents = ?, selling_price_cents = ?,
         category_id = ?, is_featured = ?, status = ?, seo_title = ?, seo_description = ?, thumbnail_url = ?
     WHERE id = ?`,
    [
      title,
      shortDescription,
      description,
      sellingPriceCents,
      mrpCents,
      sellingPriceCents,
      categoryId,
      isFeatured,
      status,
      seoTitle,
      seoDescription,
      thumbnailUrl,
      id,
    ]
  );

  revalidatePath("/admin/courses");
  revalidatePath(`/admin/courses/${id}`);
  return { success: true };
}

export async function deleteCourseAction(courseId: string) {
  await requireAdmin();
  await execute("DELETE FROM courses WHERE id = ?", [courseId]);
  revalidatePath("/admin/courses");
  return { success: true };
}

export async function updateCourseSortOrderAction(courseId: string, sortOrder: number) {
  await requireAdmin();
  await execute("UPDATE courses SET sort_order = ? WHERE id = ?", [sortOrder, courseId]);
  revalidatePath("/admin/courses");
  return { success: true };
}

export async function toggleCourseStatusAction(courseId: string, currentStatus: string) {
  await requireAdmin();
  const newStatus = currentStatus === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
  await execute("UPDATE courses SET status = ? WHERE id = ?", [newStatus, courseId]);
  revalidatePath("/admin/courses");
  return { success: true };
}

// ── Module CRUD ─────────────────────────────────────────────────────────────

export async function createModuleAction(_prev: unknown, formData: FormData) {
  await requireAdmin();
  const courseId = formData.get("courseId") as string;
  const title = formData.get("title") as string;
  if (!courseId || !title) return { error: "Missing fields" };

  const maxSortResult = await queryOne(
    "SELECT MAX(sort_order) AS max_sort FROM modules WHERE course_id = ?",
    [courseId]
  );
  const nextSort = (maxSortResult?.max_sort ?? -1) + 1;
  const id = crypto.randomUUID();

  await execute(
    "INSERT INTO modules (id, course_id, title, sort_order) VALUES (?, ?, ?, ?)",
    [id, courseId, title, nextSort]
  );

  revalidatePath(`/admin/courses/${courseId}`);
  return { success: true };
}

export async function updateModuleAction(_prev: unknown, formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  const title = formData.get("title") as string;
  if (!id || !title) return { error: "Missing fields" };
  await execute("UPDATE modules SET title = ? WHERE id = ?", [title, id]);
  revalidatePath("/admin/courses");
  return { success: true };
}

export async function deleteModuleAction(moduleId: string) {
  await requireAdmin();
  await execute("DELETE FROM modules WHERE id = ?", [moduleId]);
  revalidatePath("/admin/courses");
  return { success: true };
}

// ── Lesson CRUD ─────────────────────────────────────────────────────────────

export async function createLessonAction(_prev: unknown, formData: FormData) {
  await requireAdmin();
  const moduleId = formData.get("moduleId") as string;
  const title = formData.get("title") as string;
  const videoUrl = (formData.get("videoUrl") as string) || null;
  const contentType = (formData.get("contentType") as string) || "URL";
  const pdfFileKey = (formData.get("pdfFileKey") as string) || null;
  const durationSeconds = parseInt(formData.get("durationSeconds") as string, 10) || 0;
  const description = (formData.get("description") as string) || null;
  const notes = (formData.get("notes") as string) || null;
  const isPreview = formData.get("isPreview") === "on";

  if (!moduleId || !title) return { error: "Missing fields" };

  const maxSortResult = await queryOne(
    "SELECT MAX(sort_order) AS max_sort FROM lessons WHERE module_id = ?",
    [moduleId]
  );
  const nextSort = (maxSortResult?.max_sort ?? -1) + 1;
  const id = crypto.randomUUID();

  await execute(
    `INSERT INTO lessons (id, module_id, title, video_url, content_type, pdf_file_key, duration_seconds, description, notes, is_preview, sort_order)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, moduleId, title, videoUrl, contentType, pdfFileKey, durationSeconds, description, notes, isPreview, nextSort]
  );

  revalidatePath("/admin/courses");
  return { success: true };
}

export async function updateLessonAction(_prev: unknown, formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  const title = formData.get("title") as string;
  const videoUrl = (formData.get("videoUrl") as string) || null;
  const contentType = (formData.get("contentType") as string) || "URL";
  const pdfFileKey = (formData.get("pdfFileKey") as string) || null;
  const durationSeconds = parseInt(formData.get("durationSeconds") as string, 10) || 0;
  const description = (formData.get("description") as string) || null;
  const notes = (formData.get("notes") as string) || null;
  const isPreview = formData.get("isPreview") === "on";

  if (!id || !title) return { error: "Missing fields" };

  await execute(
    `UPDATE lessons 
     SET title = ?, video_url = ?, content_type = ?, pdf_file_key = ?, duration_seconds = ?, description = ?, notes = ?, is_preview = ? 
     WHERE id = ?`,
    [title, videoUrl, contentType, pdfFileKey, durationSeconds, description, notes, isPreview, id]
  );
  revalidatePath("/admin/courses");
  return { success: true };
}

export async function deleteLessonAction(lessonId: string) {
  await requireAdmin();
  await execute("DELETE FROM lessons WHERE id = ?", [lessonId]);
  revalidatePath("/admin/courses");
  return { success: true };
}

// ── Order management ────────────────────────────────────────────────────────

export async function approveOrderAction(orderId: string) {
  const admin = await requireAdmin();
  const order = await queryOne("SELECT * FROM orders WHERE id = ?", [orderId]);
  if (!order || order.status !== "PENDING") return { error: "Invalid order" };

  const user = await queryOne("SELECT email FROM users WHERE id = ?", [order.user_id]);
  const course = await queryOne("SELECT title FROM courses WHERE id = ?", [order.course_id]);

  // Create enrollment
  const enrollId = crypto.randomUUID();
  await execute(
    `INSERT INTO enrollments (id, user_id, course_id, status, source) 
     VALUES (?, ?, ?, 'ACTIVE', 'purchase')
     ON DUPLICATE KEY UPDATE status = 'ACTIVE', source = 'purchase'`,
    [enrollId, order.user_id, order.course_id]
  );

  // Update order status
  await execute(
    "UPDATE orders SET status = 'APPROVED', reviewed_by_id = ?, reviewed_at = ? WHERE id = ?",
    [admin.id, new Date(), orderId]
  );

  // Send confirmation email
  if (user?.email && course?.title) {
    await sendEventEmail("PAYMENT_APPROVED", user.email, {
      courseTitle: course.title,
    });
  }

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  return { success: true };
}

export async function rejectOrderAction(orderId: string, reason?: string) {
  const admin = await requireAdmin();
  const order = await queryOne("SELECT * FROM orders WHERE id = ?", [orderId]);
  if (!order) return { error: "Invalid order" };

  const user = await queryOne("SELECT email FROM users WHERE id = ?", [order.user_id]);

  const rejectionReason = reason || "Payment could not be verified";

  await execute(
    "UPDATE orders SET status = 'REJECTED', rejection_reason = ?, reviewed_by_id = ?, reviewed_at = ? WHERE id = ?",
    [rejectionReason, admin.id, new Date(), orderId]
  );

  if (user?.email) {
    await sendEventEmail("PAYMENT_REJECTED", user.email, {
      reason: rejectionReason,
    });
  }

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  return { success: true };
}

// ── Enrollment management ───────────────────────────────────────────────────

export async function manualEnrollAction(_prev: unknown, formData: FormData) {
  await requireAdmin();
  const userId = formData.get("userId") as string;
  const courseId = formData.get("courseId") as string;
  if (!userId || !courseId) return { error: "Missing fields" };

  const existing = await queryOne(
    "SELECT id FROM enrollments WHERE user_id = ? AND course_id = ?",
    [userId, courseId]
  );
  if (existing && existing.status === "ACTIVE") return { error: "Already enrolled" };

  const id = crypto.randomUUID();
  await execute(
    `INSERT INTO enrollments (id, user_id, course_id, status, source) 
     VALUES (?, ?, ?, 'ACTIVE', 'manual')
     ON DUPLICATE KEY UPDATE status = 'ACTIVE', source = 'manual'`,
    [id, userId, courseId]
  );

  revalidatePath("/admin/enrollments");
  return { success: true };
}

export async function revokeEnrollmentAction(enrollmentId: string) {
  await requireAdmin();
  await execute("UPDATE enrollments SET status = 'REVOKED' WHERE id = ?", [enrollmentId]);
  revalidatePath("/admin/enrollments");
  return { success: true };
}

export async function reactivateEnrollmentAction(enrollmentId: string) {
  await requireAdmin();
  await execute("UPDATE enrollments SET status = 'ACTIVE' WHERE id = ?", [enrollmentId]);
  revalidatePath("/admin/enrollments");
  return { success: true };
}

// ── Settings updates ────────────────────────────────────────────────────────

export async function updateSiteSettingsAction(_prev: unknown, formData: FormData) {
  await requireAdmin();
  
  const siteName = (formData.get("siteName") as string) || "Trade Learning Hub";
  const tagline = (formData.get("tagline") as string) || null;
  const logoUrl = (formData.get("logoUrl") as string) || null;
  const contactEmail = (formData.get("contactEmail") as string) || null;
  const couponsEnabled = formData.get("couponsEnabled") === "on";
  const referralsEnabled = formData.get("referralsEnabled") === "on";

  await execute(
    "UPDATE site_settings SET site_name = ?, tagline = ?, logo_url = ?, contact_email = ?, coupons_enabled = ?, referrals_enabled = ? WHERE id = 'default'",
    [siteName, tagline, logoUrl, contactEmail, couponsEnabled, referralsEnabled]
  );

  revalidatePath("/admin/settings/site");
  return { success: true };
}

export async function updatePaymentSettingsAction(_prev: unknown, formData: FormData) {
  await requireAdmin();
  
  const enabled = formData.get("enabled") === "on";
  const qrImageUrl = (formData.get("qrImageUrl") as string) || null;
  const upiId = (formData.get("upiId") as string) || null;
  const instructions = (formData.get("instructions") as string) || null;
  const supportContact = (formData.get("supportContact") as string) || null;

  await execute(
    `UPDATE payment_settings 
     SET enabled = ?, qr_image_url = ?, upi_id = ?, instructions = ?, support_contact = ? 
     WHERE id = 'default'`,
    [
      enabled,
      qrImageUrl,
      upiId,
      instructions,
      supportContact,
    ]
  );

  revalidatePath("/admin/settings/payment");
  return { success: true };
}

// ── V3: Email Sender CRUD (replaces single email_settings) ──────────────────

export async function createEmailSenderAction(_prev: { error?: string; success?: boolean }, formData: FormData): Promise<{ error?: string; success?: boolean }> {
  await requireAdmin();
  const label = formData.get("label") as string;
  const senderEmail = formData.get("senderEmail") as string;
  const senderName = formData.get("senderName") as string;
  const smtpHost = formData.get("smtpHost") as string;
  const smtpPort = parseInt(formData.get("smtpPort") as string, 10) || 587;
  const smtpUsername = formData.get("smtpUsername") as string;
  const smtpPassword = formData.get("smtpPassword") as string;
  const smtpSecure = formData.get("smtpSecure") === "on";
  const isDefault = formData.get("isDefault") === "on";

  if (!label || !senderEmail || !smtpHost) return { error: "Label, sender email, and SMTP host are required" };

  const id = crypto.randomUUID();

  // If setting as default, unset other defaults first
  if (isDefault) {
    await execute("UPDATE email_senders SET is_default = FALSE WHERE is_default = TRUE");
  }

  await execute(
    `INSERT INTO email_senders (id, label, sender_email, sender_name, smtp_host, smtp_port, smtp_username, smtp_password, smtp_secure, is_default, active)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE)`,
    [id, label, senderEmail, senderName || label, smtpHost, smtpPort, smtpUsername || '', smtpPassword || '', smtpSecure, isDefault]
  );

  revalidatePath("/admin/settings/email-senders");
  return { success: true };
}

export async function updateEmailSenderAction(_prev: { error?: string; success?: boolean }, formData: FormData): Promise<{ error?: string; success?: boolean }> {
  await requireAdmin();
  const id = formData.get("id") as string;
  const label = formData.get("label") as string;
  const senderEmail = formData.get("senderEmail") as string;
  const senderName = formData.get("senderName") as string;
  const smtpHost = formData.get("smtpHost") as string;
  const smtpPort = parseInt(formData.get("smtpPort") as string, 10) || 587;
  const smtpUsername = formData.get("smtpUsername") as string;
  const smtpPassword = formData.get("smtpPassword") as string;
  const smtpPasswordStr = (formData.get("smtpPassword") as string) || "";
  const smtpSecure = formData.get("smtpSecure") === "on";
  const isDefault = formData.get("isDefault") === "on";
  const active = formData.get("active") !== "off";

  if (!id || !label || !senderEmail || !smtpHost) return { error: "Missing required fields" };

  if (isDefault) {
    await execute("UPDATE email_senders SET is_default = FALSE WHERE is_default = TRUE AND id != ?", [id]);
  }

  await execute(
    `UPDATE email_senders
     SET label = ?, sender_email = ?, sender_name = ?, smtp_host = ?, smtp_port = ?,
         smtp_username = ?, smtp_password = ?, smtp_secure = ?, is_default = ?, active = ?
     WHERE id = ?`,
    [label, senderEmail, senderName || label, smtpHost, smtpPort, smtpUsername || '', smtpPasswordStr, smtpSecure, isDefault, active, id]
  );

  revalidatePath("/admin/settings/email-senders");
  return { success: true };
}

export async function deleteEmailSenderAction(senderId: string) {
  await requireAdmin();
  await execute("DELETE FROM email_senders WHERE id = ?", [senderId]);
  revalidatePath("/admin/settings/email-senders");
  return { success: true };
}

export async function testEmailSenderAction(_prev: { error?: string; success?: boolean }, formData: FormData): Promise<{ error?: string; success?: boolean }> {
  await requireAdmin();
  const smtpHost = formData.get("smtpHost") as string;
  const smtpPort = parseInt(formData.get("smtpPort") as string, 10) || 587;
  const smtpUsername = (formData.get("smtpUsername") as string) || null;
  const smtpPassword = (formData.get("smtpPassword") as string) || null;
  const smtpSecure = formData.get("smtpSecure") === "on";
  const senderEmail = formData.get("senderEmail") as string;
  const senderName = (formData.get("senderName") as string) || null;
  const toEmail = formData.get("toEmail") as string;

  if (!smtpHost || !smtpPort || !senderEmail || !toEmail) {
    return { error: "Host, Port, Sender Email, and Test Recipient are required." };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: smtpUsername ? { user: smtpUsername, pass: smtpPassword ?? undefined } : undefined,
    });

    const from = senderName ? `"${senderName}" <${senderEmail}>` : senderEmail;

    await transporter.sendMail({
      from,
      to: toEmail,
      subject: "Test Email from Trade Learning Hub",
      text: "This is a test email to verify your SMTP settings.",
      html: `<div style="font-family: sans-serif; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2B2B2B;">SMTP Connection Test</h2>
        <p>This is a test email sent from your LMS admin dashboard.</p>
        <p><strong>Status:</strong> Success!</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #666;">Sent on: ${new Date().toLocaleString()}</p>
      </div>`
    });

    return { success: true };
  } catch (error: any) {
    console.error("Test email failed:", error);
    return { error: error.message || "Failed to send test email." };
  }
}

// ── Legacy Email Settings compatibility ──────────────────────────────────────

export async function updateEmailSettingsAction(_prev: { error?: string; success?: boolean }, formData: FormData): Promise<{ error?: string; success?: boolean }> {
  return createEmailSenderAction(_prev, formData);
}

export async function testEmailSettingsAction(_prev: { error?: string; success?: boolean }, formData: FormData): Promise<{ error?: string; success?: boolean }> {
  return testEmailSenderAction(_prev, formData);
}

// ── V3: Coupon CRUD ─────────────────────────────────────────────────────────

export async function createCouponAction(_prev: { error?: string; success?: boolean }, formData: FormData): Promise<{ error?: string; success?: boolean }> {
  await requireAdmin();
  const code = (formData.get("code") as string)?.trim().toUpperCase();
  const type = (formData.get("type") as string) || "COUPON";
  const discountKind = (formData.get("discountKind") as string) || "FLAT";
  const discountValue = parseInt(formData.get("discountValue") as string, 10) || 0;
  const courseId = (formData.get("courseId") as string) || null;

  if (!code) return { error: "Code is required" };
  if (discountValue <= 0) return { error: "Discount value must be positive" };

  const existing = await queryOne("SELECT id FROM coupons WHERE code = ?", [code]);
  if (existing) return { error: "A code with this name already exists" };

  const id = crypto.randomUUID();
  await execute(
    "INSERT INTO coupons (id, code, type, discount_kind, discount_value, active, course_id) VALUES (?, ?, ?, ?, ?, TRUE, ?)",
    [id, code, type, discountKind, discountValue, courseId]
  );

  revalidatePath("/admin/coupons");
  return { success: true };
}

export async function updateCouponAction(_prev: { error?: string; success?: boolean }, formData: FormData): Promise<{ error?: string; success?: boolean }> {
  await requireAdmin();
  const id = formData.get("id") as string;
  const code = (formData.get("code") as string)?.trim().toUpperCase();
  const type = (formData.get("type") as string) || "COUPON";
  const discountKind = (formData.get("discountKind") as string) || "FLAT";
  const discountValue = parseInt(formData.get("discountValue") as string, 10) || 0;
  const courseId = (formData.get("courseId") as string) || null;
  const active = formData.get("active") === "on";

  if (!id || !code) return { error: "Missing required fields" };

  await execute(
    "UPDATE coupons SET code = ?, type = ?, discount_kind = ?, discount_value = ?, active = ?, course_id = ? WHERE id = ?",
    [code, type, discountKind, discountValue, active, courseId, id]
  );

  revalidatePath("/admin/coupons");
  return { success: true };
}

export async function deleteCouponAction(couponId: string) {
  await requireAdmin();
  await execute("DELETE FROM coupons WHERE id = ?", [couponId]);
  revalidatePath("/admin/coupons");
  return { success: true };
}

export async function toggleCouponAction(couponId: string, currentActive: boolean) {
  await requireAdmin();
  await execute("UPDATE coupons SET active = ? WHERE id = ?", [!currentActive, couponId]);
  revalidatePath("/admin/coupons");
  return { success: true };
}

// ── Category CRUD ───────────────────────────────────────────────────────────

export async function createCategoryAction(_prev: unknown, formData: FormData) {
  await requireAdmin();
  const name = formData.get("name") as string;
  if (!name) return { error: "Name is required" };
  const slug = slugify(name);

  const existing = await queryOne("SELECT id FROM categories WHERE slug = ?", [slug]);
  if (existing) return { error: "Category already exists" };

  const id = crypto.randomUUID();
  await execute("INSERT INTO categories (id, name, slug) VALUES (?, ?, ?)", [id, name, slug]);
  
  revalidatePath("/admin/courses");
  return { success: true };
}

// ── Email templates ─────────────────────────────────────────────────────────

export async function updateEmailTemplateAction(_prev: unknown, formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  const subject = formData.get("subject") as string;
  const blocksJson = formData.get("blocksJson") as string;
  const isActive = formData.get("isActive") === "on";
  const senderId = (formData.get("senderId") as string) || null;

  if (!id || !subject) return { error: "Missing fields" };

  await execute(
    "UPDATE email_templates SET subject = ?, blocks_json = ?, is_active = ?, sender_id = ? WHERE id = ?",
    [subject, blocksJson, isActive, senderId, id]
  );

  revalidatePath("/admin/email-templates");
  return { success: true };
}

// ── Homepage sections ───────────────────────────────────────────────────────

export async function updateHomepageSectionAction(_prev: unknown, formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  const title = (formData.get("title") as string) || null;
  const subtitle = (formData.get("subtitle") as string) || null;
  const enabled = formData.get("enabled") === "on";
  const data = formData.get("data") as string;

  if (!id) return { error: "Missing section ID" };

  await execute(
    "UPDATE homepage_sections SET title = ?, subtitle = ?, enabled = ?, data = ? WHERE id = ?",
    [title, subtitle, enabled, data, id]
  );

  revalidatePath("/admin/homepage");
  return { success: true };
}

// ── Data Exports (V3) ───────────────────────────────────────────────────────

export async function exportStudentsAction(startDate?: string, endDate?: string) {
  await requireAdmin();
  let sql = "SELECT id, name, email, mobile, status, role, created_at FROM users WHERE role = 'STUDENT'";
  const params: any[] = [];

  if (startDate) {
    sql += " AND created_at >= ?";
    params.push(`${startDate} 00:00:00`);
  }
  if (endDate) {
    sql += " AND created_at <= ?";
    params.push(`${endDate} 23:59:59`);
  }

  sql += " ORDER BY created_at DESC";
  const rows = await query(sql, params);
  return rows;
}

export async function exportOrdersAction(startDate?: string, endDate?: string) {
  await requireAdmin();
  let sql = `
    SELECT o.order_number, u.name AS student_name, u.email AS student_email,
           c.title AS course_title, o.amount_cents, o.discount_cents, o.final_amount_cents,
           o.applied_code, o.status, o.transaction_id, o.payer_name, o.payer_mobile, o.created_at
    FROM orders o
    JOIN users u ON o.user_id = u.id
    JOIN courses c ON o.course_id = c.id
    WHERE 1=1
  `;
  const params: any[] = [];

  if (startDate) {
    sql += " AND o.created_at >= ?";
    params.push(`${startDate} 00:00:00`);
  }
  if (endDate) {
    sql += " AND o.created_at <= ?";
    params.push(`${endDate} 23:59:59`);
  }

  sql += " ORDER BY o.created_at DESC";
  const rows = await query(sql, params);
  return rows;
}

export async function exportEnrollmentsAction(startDate?: string, endDate?: string) {
  await requireAdmin();
  let sql = `
    SELECT u.name AS student_name, u.email AS student_email,
           c.title AS course_title, e.status, e.source, e.enrolled_at
    FROM enrollments e
    JOIN users u ON e.user_id = u.id
    JOIN courses c ON e.course_id = c.id
    WHERE 1=1
  `;
  const params: any[] = [];

  if (startDate) {
    sql += " AND e.enrolled_at >= ?";
    params.push(`${startDate} 00:00:00`);
  }
  if (endDate) {
    sql += " AND e.enrolled_at <= ?";
    params.push(`${endDate} 23:59:59`);
  }

  sql += " ORDER BY e.enrolled_at DESC";
  const rows = await query(sql, params);
  return rows;
}

