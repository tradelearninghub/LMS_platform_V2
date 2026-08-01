# Trade Learning Hub — Database Schema Plan (V3)

> Base: MySQL (InnoDB, utf8mb4_unicode_ci), native SQL via `mysql2/promise`, no ORM, schema managed in `src/lib/db-init.ts`. This document lists every change relative to the current schema documented in `PROJECT_STATE.md`. Tables not mentioned here are unchanged.

---

## Modified Tables

### `courses`
- **REMOVE**: `price_cents`
- **ADD**: `mrp_cents` (`INT`, Not Null) — original/list price
- **ADD**: `selling_price_cents` (`INT`, Not Null) — current selling price before any coupon
- All display/checkout logic reads `selling_price_cents` as the base, with coupon discounts applied and rounded up on top of that.

### `lessons`
- **ADD**: `content_type` (`VARCHAR(20)`, Default `'URL'`) — Values: `'URL'`, `'PDF'`
- **ADD**: `pdf_file_key` (`VARCHAR(500)`, Nullable) — storage key/path for uploaded PDF (not a public URL — resolved to a signed URL at request time)
- `video_url` remains as-is for `URL` type lessons.

### `orders`
- **ADD**: `applied_code` (`VARCHAR(100)`, Nullable) — the coupon/referral code used, if any
- **ADD**: `discount_cents` (`INT`, Default `0`) — amount discounted, for admin visibility and reporting
- **ADD**: `final_amount_cents` (`INT`, Not Null) — the actual rounded amount the student paid (this becomes the source of truth for receipts, replacing reliance on `amount_cents` alone)

### `email_templates`
- **ADD**: `sender_id` (`VARCHAR(255)`, Nullable, Foreign Key → `email_senders.id` ON DELETE SET NULL) — which sender profile this event sends from. Null = use default sender.

### `email_settings` → replaced by `email_senders`
- The current singleton `email_settings` table is replaced by a multi-row `email_senders` table (see New Tables below). Existing single config can be migrated as the first row with `is_default = TRUE`.

---

## New Tables

### `sessions` (for session-limit enforcement)
Tracks active login sessions so concurrent-session limits can be enforced (current JWT setup is stateless and can't do this).
- `id` (`VARCHAR(255)`, Primary Key)
- `user_id` (`VARCHAR(255)`, Not Null, Foreign Key → `users.id` ON DELETE CASCADE)
- `session_token` (`VARCHAR(500)`, Not Null, Unique Index)
- `device_info` (`VARCHAR(255)`, Nullable) — user agent / rough device label
- `created_at` (`TIMESTAMP`, Default `CURRENT_TIMESTAMP`)
- `last_active_at` (`TIMESTAMP`, Default `CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`)
- `revoked` (`BOOLEAN`, Default `FALSE`)

> Implementation note: switching from pure stateless JWT to a session-tracked model is the one architectural change here — worth confirming with the build agent that it either moves to NextAuth database sessions, or layers a session registry check into the existing JWT flow (validate the JWT normally, but also check this table hasn't marked that session as revoked, and enforce the max-2 rule on login by revoking the oldest row past the limit).

### `coupons`
- `id` (`VARCHAR(255)`, Primary Key)
- `code` (`VARCHAR(100)`, Not Null, Unique Index)
- `type` (`VARCHAR(20)`, Not Null) — Values: `'COUPON'`, `'REFERRAL'`
- `discount_kind` (`VARCHAR(20)`, Not Null) — Values: `'FLAT'`, `'PERCENT'`
- `discount_value` (`INT`, Not Null) — rupees if FLAT, percentage points if PERCENT
- `active` (`BOOLEAN`, Default `TRUE`)
- `course_id` (`VARCHAR(255)`, Nullable, Foreign Key → `courses.id` ON DELETE CASCADE) — null = applies site-wide to all courses
- `created_at` (`TIMESTAMP`, Default `CURRENT_TIMESTAMP`)

> Coupons and Referrals share this table but are governed by independent active toggles at the admin-settings level (a global "Coupons enabled" and "Referrals enabled" switch), as decided.

### `email_senders`
- `id` (`VARCHAR(255)`, Primary Key)
- `label` (`VARCHAR(255)`, Not Null) — internal display name, e.g. "Receipts", "Support"
- `sender_email` (`VARCHAR(255)`, Not Null)
- `sender_name` (`VARCHAR(255)`, Not Null)
- `smtp_host` (`VARCHAR(255)`, Not Null)
- `smtp_port` (`INT`, Not Null)
- `smtp_username` (`VARCHAR(255)`, Not Null)
- `smtp_password` (`VARCHAR(255)`, Not Null)
- `smtp_secure` (`BOOLEAN`, Default `TRUE`)
- `is_default` (`BOOLEAN`, Default `FALSE`) — exactly one row should be true; used as fallback when a template has no `sender_id`
- `active` (`BOOLEAN`, Default `TRUE`)
- `created_at` (`TIMESTAMP`, Default `CURRENT_TIMESTAMP`)

### `receipt_data` (optional, only if not deriving entirely from `orders`)
Not required as a separate table — receipts should be generated directly from `orders` + `users` + `courses` joined data at request time via the HTML→PDF template. No new table needed here; noted for clarity that no PDF blob storage is introduced.

---

## Tables to Reconsider / Clean Up
- `nav_menu_items` — currently unused (dead schema). Recommend either dropping it or wiring it into the header/footer if dynamic nav is actually wanted. Not required by anything in this plan — default to dropping unless you want dynamic nav management.
- `audit_logs` — currently unused. Low cost to keep for future use (e.g. tracking admin actions like approvals/rejections/manual enrollments), but not required by this plan. Recommend keeping the table but it's fine to leave unwired for now.

---

## Explicitly Not Adding (per current scope)
- No `notifications` table (deferred)
- No `certificates` table
- No `quiz`/`assessment` tables
- No multi-currency/tax columns
