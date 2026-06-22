import { queryOne, execute } from "./db";

/** Cached fetch of singleton settings rows. */
export async function getSiteSettings() {
  try {
    let settings = await queryOne("SELECT * FROM site_settings WHERE id = 'default'");
    if (!settings) {
      await execute(
        "INSERT INTO site_settings (id, site_name, tagline) VALUES ('default', 'Trade Learning Hub', 'Premium trading education')"
      );
      settings = await queryOne("SELECT * FROM site_settings WHERE id = 'default'");
    }
    const res = settings || { id: "default", site_name: "Trade Learning Hub", tagline: "Premium trading education" };
    return {
      ...res,
      siteName: res.site_name || "Trade Learning Hub",
      logoUrl: res.logo_url || null,
      contactEmail: res.contact_email || null,
    };
  } catch (err) {
    console.error("[Settings] Failed to fetch site settings, returning defaults:", err);
    return {
      id: "default",
      site_name: "Trade Learning Hub",
      siteName: "Trade Learning Hub",
      tagline: "Premium trading education",
      logo_url: null,
      logoUrl: null,
      contact_email: null,
      contactEmail: null,
    };
  }
}

export async function getPaymentSettings() {
  try {
    let settings = await queryOne("SELECT * FROM payment_settings WHERE id = 'default'");
    if (!settings) {
      await execute(
        "INSERT INTO payment_settings (id, enabled, upi_id, instructions) VALUES ('default', true, 'tradelearninghub@upi', 'Scan the QR and pay.')"
      );
      settings = await queryOne("SELECT * FROM payment_settings WHERE id = 'default'");
    }
    const res = settings || { id: "default", enabled: 1, upi_id: "tradelearninghub@upi", instructions: "Scan the QR and pay." };
    return {
      ...res,
      qrImageUrl: res.qr_image_url || null,
      upiId: res.upi_id || "tradelearninghub@upi",
      accountHolderName: res.account_holder_name || null,
      accountNumber: res.account_number || null,
      ifscCode: res.ifsc_code || null,
      bankName: res.bank_name || null,
      supportContact: res.support_contact || null,
    };
  } catch (err) {
    console.error("[Settings] Failed to fetch payment settings:", err);
    return {
      id: "default",
      enabled: 1,
      upi_id: "tradelearninghub@upi",
      upiId: "tradelearninghub@upi",
      instructions: "Scan the QR and pay.",
      qr_image_url: null,
      qrImageUrl: null,
      account_holder_name: null,
      accountHolderName: null,
      account_number: null,
      accountNumber: null,
      ifsc_code: null,
      ifscCode: null,
      bank_name: null,
      bankName: null,
      support_contact: null,
      supportContact: null,
    };
  }
}

export async function getEmailSettings() {
  try {
    let settings = await queryOne("SELECT * FROM email_settings WHERE id = 'default'");
    if (!settings) {
      await execute(
        "INSERT INTO email_settings (id, enabled, smtp_secure) VALUES ('default', false, true)"
      );
      settings = await queryOne("SELECT * FROM email_settings WHERE id = 'default'");
    }
    const res = settings || { id: "default", enabled: 0, smtp_secure: 1 };
    return {
      ...res,
      smtpHost: res.smtp_host || null,
      smtpPort: res.smtp_port || null,
      smtpUsername: res.smtp_username || null,
      smtpPassword: res.smtp_password || null,
      smtpSecure: res.smtp_secure ?? true,
      senderEmail: res.sender_email || null,
      senderName: res.sender_name || null,
      replyTo: res.reply_to || null,
    };
  } catch (err) {
    console.error("[Settings] Failed to fetch email settings:", err);
    return {
      id: "default",
      enabled: 0,
      smtp_secure: 1,
      smtpSecure: true,
      smtp_host: null,
      smtpHost: null,
      smtp_port: null,
      smtpPort: null,
      smtp_username: null,
      smtpUsername: null,
      smtp_password: null,
      smtpPassword: null,
      sender_email: null,
      senderEmail: null,
      sender_name: null,
      senderName: null,
      reply_to: null,
      replyTo: null,
    };
  }
}

