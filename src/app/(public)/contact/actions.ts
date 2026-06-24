"use server";

import { queryOne } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email address"),
  subject: z.string().min(3, "Subject must be at least 3 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export type ContactState = {
  error?: string;
  success?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

export async function sendContactMessageAction(
  _prev: ContactState,
  formData: FormData
): Promise<ContactState> {
  const raw = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    subject: formData.get("subject") as string,
    message: formData.get("message") as string,
  };

  const parsed = contactSchema.safeParse(raw);
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { name, email, subject, message } = parsed.data;

  // Retrieve admin contact email
  const site = await queryOne("SELECT contact_email FROM site_settings WHERE id = 'default'").catch(() => null);
  const adminEmail = site?.contact_email || process.env.SEED_ADMIN_EMAIL || "admin@tradelearninghub.local";

  const emailHtml = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px;">
      <h2 style="color: #2563eb; margin-top: 0; border-bottom: 1px solid #eee; padding-bottom: 10px;">New Contact Form Submission</h2>
      <table style="width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 14px;">
        <tr>
          <td style="padding: 6px 0; font-weight: bold; width: 100px;">Name:</td>
          <td style="padding: 6px 0; color: #333;">${name}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-weight: bold;">Email:</td>
          <td style="padding: 6px 0; color: #333;"><a href="mailto:${email}">${email}</a></td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-weight: bold;">Subject:</td>
          <td style="padding: 6px 0; color: #333;">${subject}</td>
        </tr>
      </table>
      <div style="margin-top: 20px; padding: 15px; background-color: #f9f9f9; border-radius: 6px; border: 1px solid #eee; font-size: 14px; color: #444; line-height: 1.6;">
        <h4 style="margin: 0 0 10px 0; color: #111;">Message:</h4>
        <p style="margin: 0; white-space: pre-wrap;">${message}</p>
      </div>
      <hr style="border: none; border-top: 1px solid #eee; margin: 25px 0 15px 0;" />
      <p style="font-size: 11px; color: #888; text-align: center; margin: 0;">Sent via Trade Learning Hub Contact Portal</p>
    </div>
  `;

  const result = await sendEmail({
    to: adminEmail,
    subject: `[Contact Form] ${subject}`,
    html: emailHtml,
  });

  if (!result.ok) {
    return { error: result.error || "Failed to send message. Please try again later." };
  }

  return { success: "Thank you! Your message has been sent successfully. We will get back to you soon." };
}
