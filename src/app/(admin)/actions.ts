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
  const priceCents = Math.round(parseFloat(formData.get("priceCents") as string || "0") * 100) || 0;
  const categoryId = (formData.get("categoryId") as string) || null;
  const isFeatured = formData.get("isFeatured") === "on";

  if (!title) return { error: "Title is required" };

  // Check slug uniqueness
  const existing = await queryOne("SELECT id FROM courses WHERE slug = ?", [slug]);
  if (existing) return { error: "A course with a similar title already exists" };

  const id = crypto.randomUUID();

  await execute(
    `INSERT INTO courses (id, title, slug, short_description, description, price_cents, category_id, is_featured, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'DRAFT')`,
    [id, title, slug, shortDescription, description, priceCents, categoryId, isFeatured]
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
  const priceCents = Math.round(parseFloat(formData.get("priceCents") as string || "0") * 100) || 0;
  const categoryId = (formData.get("categoryId") as string) || null;
  const isFeatured = formData.get("isFeatured") === "on";
  const status = formData.get("status") as string;
  const seoTitle = (formData.get("seoTitle") as string) || null;
  const seoDescription = (formData.get("seoDescription") as string) || null;
  const thumbnailUrl = (formData.get("thumbnailUrl") as string) || null;

  if (!id || !title) return { error: "Missing required fields" };

  const publishedAt = status === "PUBLISHED" ? new Date() : null;

  // MySQL doesn't have undefined, use null instead
  await execute(
    `UPDATE courses 
     SET title = ?, short_description = ?, description = ?, price_cents = ?, category_id = ?, 
         is_featured = ?, status = ?, seo_title = ?, seo_description = ?, thumbnail_url = ?
     WHERE id = ?`,
    [
      title,
      shortDescription,
      description,
      priceCents,
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
    `INSERT INTO lessons (id, module_id, title, video_url, duration_seconds, description, notes, is_preview, sort_order)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, moduleId, title, videoUrl, durationSeconds, description, notes, isPreview, nextSort]
  );

  revalidatePath("/admin/courses");
  return { success: true };
}

export async function updateLessonAction(_prev: unknown, formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  const title = formData.get("title") as string;
  const videoUrl = (formData.get("videoUrl") as string) || null;
  const durationSeconds = parseInt(formData.get("durationSeconds") as string, 10) || 0;
  const description = (formData.get("description") as string) || null;
  const notes = (formData.get("notes") as string) || null;
  const isPreview = formData.get("isPreview") === "on";

  if (!id || !title) return { error: "Missing fields" };

  await execute(
    `UPDATE lessons 
     SET title = ?, video_url = ?, duration_seconds = ?, description = ?, notes = ?, is_preview = ? 
     WHERE id = ?`,
    [title, videoUrl, durationSeconds, description, notes, isPreview, id]
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

  await execute(
    "UPDATE site_settings SET site_name = ?, tagline = ?, logo_url = ?, contact_email = ? WHERE id = 'default'",
    [siteName, tagline, logoUrl, contactEmail]
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

export async function updateEmailSettingsAction(_prev: unknown, formData: FormData) {
  await requireAdmin();
  
  const enabled = formData.get("enabled") === "on";
  const smtpHost = (formData.get("smtpHost") as string) || null;
  const smtpPort = parseInt(formData.get("smtpPort") as string, 10) || null;
  const smtpUsername = (formData.get("smtpUsername") as string) || null;
  const smtpPassword = (formData.get("smtpPassword") as string) || null;
  const smtpSecure = formData.get("smtpSecure") === "on";
  const senderEmail = (formData.get("senderEmail") as string) || null;
  const senderName = (formData.get("senderName") as string) || null;
  const replyTo = (formData.get("replyTo") as string) || null;

  await execute(
    `UPDATE email_settings 
     SET enabled = ?, smtp_host = ?, smtp_port = ?, smtp_username = ?, smtp_password = ?, 
         smtp_secure = ?, sender_email = ?, sender_name = ?, reply_to = ? 
     WHERE id = 'default'`,
    [
      enabled,
      smtpHost,
      smtpPort,
      smtpUsername,
      smtpPassword,
      smtpSecure,
      senderEmail,
      senderName,
      replyTo,
    ]
  );

  revalidatePath("/admin/settings/email");
  return { success: true };
}

export async function testEmailSettingsAction(_prev: unknown, formData: FormData) {
  await requireAdmin();
  
  const smtpHost = (formData.get("smtpHost") as string) || null;
  const smtpPort = parseInt(formData.get("smtpPort") as string, 10) || null;
  const smtpUsername = (formData.get("smtpUsername") as string) || null;
  const smtpPassword = (formData.get("smtpPassword") as string) || null;
  const smtpSecure = formData.get("smtpSecure") === "on";
  const senderEmail = (formData.get("senderEmail") as string) || null;
  const senderName = (formData.get("senderName") as string) || null;
  const toEmail = (formData.get("toEmail") as string) || null;

  if (!smtpHost || !smtpPort || !senderEmail || !toEmail) {
    return { error: "Host, Port, Sender Email, and Test Recipient Email are required to run a test." };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: smtpUsername
        ? { user: smtpUsername, pass: smtpPassword ?? undefined }
        : undefined,
    });

    const from = senderName ? `"${senderName}" <${senderEmail}>` : senderEmail;
    
    await transporter.sendMail({
      from,
      to: toEmail,
      subject: "Test Email from LMS Admin",
      text: "Hello! This is a test email to verify your SMTP settings in the LMS platform.",
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">SMTP Connection Test</h2>
          <p>Hello,</p>
          <p>This is a test email sent from your LMS platform admin dashboard.</p>
          <p><strong>Status:</strong> Success! NodeMailer successfully connected to your SMTP server and dispatched this email.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #666;">Sent on: ${new Date().toLocaleString()}</p>
        </div>
      `
    });

    return { success: true };
  } catch (error: any) {
    console.error("Test email failed:", error);
    return { error: error.message || "Failed to send test email. Check your SMTP settings and credentials." };
  }
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

  if (!id || !subject) return { error: "Missing fields" };

  await execute(
    "UPDATE email_templates SET subject = ?, blocks_json = ?, is_active = ? WHERE id = ?",
    [subject, blocksJson, isActive, id]
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
