import { queryOne, execute } from "./db";

/** Cached fetch of singleton settings rows. */
export async function getSiteSettings() {
  let settings = await queryOne("SELECT * FROM site_settings WHERE id = 'default'");
  if (!settings) {
    await execute(
      "INSERT INTO site_settings (id, site_name, tagline) VALUES ('default', 'Trade Learning Hub', 'Premium trading education')"
    );
    settings = await queryOne("SELECT * FROM site_settings WHERE id = 'default'");
  }
  return settings;
}

export async function getPaymentSettings() {
  let settings = await queryOne("SELECT * FROM payment_settings WHERE id = 'default'");
  if (!settings) {
    await execute(
      "INSERT INTO payment_settings (id, enabled, upi_id, instructions) VALUES ('default', true, 'tradelearninghub@upi', 'Scan the QR and pay.')"
    );
    settings = await queryOne("SELECT * FROM payment_settings WHERE id = 'default'");
  }
  return settings;
}

export async function getEmailSettings() {
  let settings = await queryOne("SELECT * FROM email_settings WHERE id = 'default'");
  if (!settings) {
    await execute(
      "INSERT INTO email_settings (id, enabled, smtp_secure) VALUES ('default', false, true)"
    );
    settings = await queryOne("SELECT * FROM email_settings WHERE id = 'default'");
  }
  return settings;
}
