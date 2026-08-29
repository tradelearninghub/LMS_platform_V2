# Trade Learning Hub V3 — Project State Documentation

> **Document Version**: 3.0  
> **Target Audience**: External AI Assistants / Developers working outside this codebase  
> **Last Verified**: August 2026  

---

## 1. Tech Stack

| Layer / Concern | Technology Choice | Version / Details |
|---|---|---|
| **Frontend Framework** | Next.js (App Router, React Server Components, Server Actions) | `15.0.3` |
| **UI Library & Rendering** | React & React DOM | `19.0.0-rc-66855b96-20241106` |
| **Animations** | Framer Motion | `^11.11.17` |
| **Language & Type Safety** | TypeScript | `^5.6.3` |
| **Styling Approach** | Tailwind CSS + Design tokens (Charcoal #2B2B2B, Warm off-white #FAF7F2) | `tailwindcss ^3.4.15`, `autoprefixer ^10.4.20` |
| **UI Utilities** | Lucide React, clsx, tailwind-merge | `lucide-react ^0.460.0`, `clsx ^2.1.1`, `tailwind-merge ^2.5.4` |
| **Backend / API Engine** | Next.js Server Actions & Route Handlers | Built-in Next.js 15 |
| **Database Driver** | MySQL2 (Native Connection Pool via `mysql2/promise`) | `mysql2 ^3.11.4` |
| **Database Schema Init** | Programmatic MySQL Table DDL & Safe Idempotent Migrations | `src/lib/db-init.ts` (Auto-runs on first DB query) |
| **ORM / Data Access Layer** | Native SQL queries (No ORM). Native MySQL helper functions `query`, `queryOne`, `execute` | `src/lib/db.ts` |
| **Authentication Engine** | Auth.js / NextAuth.js v5 with Session Limit Registry (Max 2 active sessions for students) | `next-auth 5.0.0-beta.25` |
| **Discount / Referral Engine**| In-house Coupon Validation Library (Flat/Percent, course-scoped, round up to whole rupee) | `src/lib/coupons.ts` |
| **PDF Lesson Security** | HMAC-SHA256 Signed Time-Limited Tokens & Private Local Storage | `src/lib/pdf-security.ts`, `data/pdf-lessons/` |
| **Password Hashing** | bcryptjs | `bcryptjs ^2.4.3` |
| **Form Validation** | Zod | `zod ^3.23.8` |
| **File & Image Storage** | Local Disk (`public/uploads` for screenshots/images, `data/pdf-lessons` for private PDFs) | Route Handlers `src/app/api/upload/route.ts` & `upload-pdf/route.ts` |
| **Video & PDF Delivery** | External Video Embeds (Google Drive) & Protected PDF Canvas Viewer | `src/app/(student)/learn/[courseSlug]/[lessonId]/pdf-viewer.tsx` |
| **Email Transporter** | Multi-Sender SMTP Engine (Configured per-template or system default) | `nodemailer ^6.9.16`, `email_senders` table |
| **PDF Invoice Generation** | Streamed PDF Invoices with discount & coupon line items | `pdfkit ^0.19.1` |
| **Hosting & Process Management** | Hostinger Node.js Hosting / PM2 process manager | `ecosystem.config.js` (fork mode, `start -p 3000`), `next.config.mjs` (`output: "standalone"`) |
| **Script Runner** | TSX (TypeScript Execute) | `tsx ^4.19.2` |

> [!IMPORTANT]
> **ORM Migration Note**: Legacy project documentation (`README.md` and `DEPLOYMENT.md`) mentions Prisma and SQLite. However, **V2 of this codebase has completely removed Prisma** and migrated to **Native MySQL (`mysql2/promise`)** with an automatic table DDL initialization module (`src/lib/db-init.ts`).

---

## 2. Project Structure

```
c:\Users\aloks\Work\LMS\LMS_v2
├── .env                       # Environment configuration (secrets, DB credentials, auth keys)
├── .env.example               # Template environment configuration file
├── DEPLOYMENT.md              # Hostinger Node.js deployment walkthrough (Legacy references)
├── README.md                  # Project overview document (Legacy references)
├── ecosystem.config.js        # PM2 process manager configuration for production server
├── migration.js               # Standalone node script for database column migrations
├── next.config.mjs            # Next.js 15 configuration (standalone output, remote images, server actions limit)
├── package.json               # Package manifests, dependencies, scripts
├── postcss.config.js          # PostCSS configuration for Tailwind CSS compilation
├── public/                    # Static public assets
│   ├── favicon.ico            # Dynamic site favicon icon file
│   ├── images/                # Default course cover images and landing page illustration assets
│   └── uploads/               # Uploaded payment screenshots and branding image uploads
├── src/                       # Application source code
│   ├── app/                   # Next.js App Router root
│   │   ├── (admin)/           # Admin Route Group (protected by ADMIN role check)
│   │   │   ├── actions.ts     # Admin server actions (Course, Module, Lesson, Order, Settings, Templates)
│   │   │   ├── layout.tsx     # Admin dashboard sidebar layout and top bar
│   │   │   └── admin/         # Admin sub-routes
│   │   │       ├── page.tsx                  # Admin overview panel with live DB KPI metrics
│   │   │       ├── courses/                  # Course listing, status toggling, sorting, creation form
│   │   │       │   └── [id]/                 # Course editor (details, modules, lessons hierarchy)
│   │   │       ├── email-templates/          # System event email template viewer and visual block editor
│   │   │       ├── enrollments/              # Student course enrollment list and manual assign/revoke
│   │   │       ├── homepage/                 # Homepage section toggles and JSON block content manager
│   │   │       ├── orders/                   # Billing orders table and status overview
│   │   │       │   └── [id]/                 # Order verification page (UTR, screenshot, approve/reject)
│   │   │       ├── seo/                      # Global SEO settings summary dashboard
│   │   │       ├── settings/                 # Platform settings pages
│   │   │       │   ├── email/                # SMTP credentials configuration and test mail trigger
│   │   │       │   ├── payment/              # Manual payment settings (QR image, UPI ID, Bank details)
│   │   │       │   └── site/                 # Site branding configuration (Name, Tagline, Logo, Contact)
│   │   │       └── students/                 # Registered student user list and status toggle
│   │   │           ├── student-actions.ts    # Student status server actions
│   │   │           └── [id]/                 # Comprehensive student profile view (details, enrollments, orders)
│   │   ├── (auth)/            # Authentication Route Group
│   │   │   ├── actions.ts     # Auth server actions (Login, Register, OTP, Password Reset, Resend Email, Lookup Email)
│   │   │   ├── layout.tsx     # Auth views layout container
│   │   │   ├── forgot-email/  # Registered email lookup (masked email output)
│   │   │   ├── forgot-password/ # Password reset request page
│   │   │   ├── login/         # Password-based login page (with show/hide eye toggle)
│   │   │   ├── login-otp/     # 6-digit OTP code request & verification login page
│   │   │   ├── register/      # New student registration page
│   │   │   ├── reset-password/# Password token update page
│   │   │   └── verify-email/  # Registration email verification endpoint page
│   │   ├── (public)/          # Public Marketing & Catalog Route Group
│   │   │   ├── layout.tsx     # Site header navbar, mobile nav, and footer
│   │   │   ├── mobile-nav.tsx # Responsive mobile navigation drawer menu
│   │   │   ├── page.tsx       # Landing page (Hero, Stats, Featured Courses, Advantage Cards)
│   │   │   ├── contact/       # Contact form page & submission handler
│   │   │   ├── courses/       # Course catalog index with search filter and category tabs
│   │   │   │   └── [slug]/    # Course detail view (curriculum tree, pricing, CTA)
│   │   │   │       └── buy/   # Purchase checkout page (Payment details, QR Code, Screenshot upload)
│   │   │   ├── privacy/       # Privacy Policy static page
│   │   │   ├── refund/        # Refund Policy static page
│   │   │   ├── research/      # Research & Analysis disclosure page
│   │   │   └── terms/         # Terms & Conditions static page
│   │   ├── (student)/         # Student Portal Route Group (protected by login requirement)
│   │   │   ├── actions.ts     # Student server actions (Profile update, Lesson progress toggle)
│   │   │   ├── layout.tsx     # Student dashboard header navigation layout
│   │   │   ├── dashboard/     # Student portal pages
│   │   │   │   ├── page.tsx              # Overview with progress bars & recent orders
│   │   │   │   ├── courses/              # Enrolled courses list
│   │   │   │   ├── orders/               # Purchase orders list & PDF receipt download links
│   │   │   │   └── profile/              # Student account profile management form
│   │   │   └── learn/         # Course LMS Player
│   │   │       └── [courseSlug]/
│   │   │           ├── page.tsx           # Auto-redirects student to first lesson in course
│   │   │           └── [lessonId]/        # Course player (Video iframe, sidebar checklist, notes, resources)
│   │   ├── uploads/           # Runtime uploaded files route handler
│   │   │   └── [...path]/route.ts # Serves uploaded images directly with cache headers
│   │   ├── api/               # Next.js Route Handlers (REST endpoints)
│   │   │   ├── auth/[...nextauth]/route.ts # NextAuth authentication endpoint
│   │   │   ├── receipts/[orderId]/route.ts # Dynamic PDF receipt generator endpoint
│   │   │   ├── upload/route.ts            # Image file upload API (max 5MB, saves to /public/uploads & /data/uploads)
│   │   │   └── upload-favicon/route.ts    # Admin favicon upload API (saves to /public/favicon.ico)
│   │   ├── globals.css        # Tailwind CSS import, root variables, custom utility classes
│   │   ├── layout.tsx         # Top-level HTML root layout wrapper
│   │   ├── robots.ts          # Dynamic robots.txt metadata route handler
│   │   └── sitemap.ts         # Dynamic sitemap.xml metadata route handler
│   ├── components/
│   │   └── ui/
│   │       └── password-input.tsx # Reusable show/hide eye toggle input component
│   ├── auth.config.ts         # Edge-compatible Auth.js middleware permissions configuration
│   ├── auth.ts                # NextAuth instance setup with Credentials Provider & MySQL verification
│   ├── middleware.ts          # Route protection middleware intercepting NextAuth sessions
│   ├── lib/                   # Shared utility modules & DB configuration
│   │   ├── db-init.ts         # MySQL table schema creation scripts & initial data seeds
│   │   ├── db.ts              # MySQL connection pool singleton & execution wrappers (`query`, `queryOne`, `execute`)
│   │   ├── email.ts           # Nodemailer transport builder & HTML template compilation engine
│   │   ├── guards.ts          # Server-side authentication guards (`requireUser`, `requireAdmin`)
│   │   ├── settings.ts        # Singleton DB settings fetchers (`getSiteSettings`, `getPaymentSettings`, `getEmailSettings`)
│   │   └── utils.ts           # Helper functions (`cn`, `formatCurrency`, `formatDate`, `slugify`, `generateOrderNumber`)
│   └── types/
│       └── next-auth.d.ts     # TypeScript type augmentations for NextAuth session & JWT user properties
├── tailwind.config.ts         # Tailwind CSS design system, colors, fonts, and animation configuration
├── test-db.js                 # Standalone script to test MySQL database connection credentials
└── tsconfig.json              # TypeScript compiler configuration
```

---

## 3. Database Schema

The database is built on **MySQL (InnoDB, utf8mb4_unicode_ci)**. Tables are programmatically created upon first connection via DDL statements defined in `src/lib/db-init.ts`.

### 1. `users`
Stores student accounts, administrators, authentication credentials, and user profiles.
* **Fields**:
  * `id` (`VARCHAR(255)`, Primary Key)
  * `email` (`VARCHAR(255)`, Not Null, Unique Index)
  * `email_verified` (`TIMESTAMP`, Nullable)
  * `name` (`VARCHAR(255)`, Nullable)
  * `image` (`VARCHAR(255)`, Nullable)
  * `password_hash` (`VARCHAR(255)`, Nullable)
  * `role` (`VARCHAR(50)`, Default `'STUDENT'`) — Values: `'STUDENT'`, `'ADMIN'`
  * `status` (`VARCHAR(50)`, Default `'ACTIVE'`) — Values: `'ACTIVE'`, `'INACTIVE'`, `'PENDING_VERIFICATION'`
  * `mobile` (`VARCHAR(50)`, Nullable)
  * `bio` (`TEXT`, Nullable)
  * `last_login_at` (`TIMESTAMP`, Nullable)
  * `created_at` (`TIMESTAMP`, Default `CURRENT_TIMESTAMP`)
  * `updated_at` (`TIMESTAMP`, Default `CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`)

### 2. `verification_tokens`
Stores email verification tokens and temporary OTP codes.
* **Fields**:
  * `identifier` (`VARCHAR(255)`, Not Null) — Email address or prefixed identifier (e.g. `otp:email@domain.com`)
  * `token` (`VARCHAR(255)`, Not Null, Unique Index) — UUID or 6-digit numeric OTP
  * `expires` (`TIMESTAMP`, Not Null)
* **Constraints**: Primary Key (`identifier`, `token`)

### 3. `password_reset_tokens`
Stores single-use tokens for password recovery flow.
* **Fields**:
  * `id` (`VARCHAR(255)`, Primary Key)
  * `user_id` (`VARCHAR(255)`, Not Null, Foreign Key → `users.id` ON DELETE CASCADE)
  * `token` (`VARCHAR(255)`, Not Null, Unique Index)
  * `expires_at` (`TIMESTAMP`, Not Null)
  * `used_at` (`TIMESTAMP`, Nullable)
  * `created_at` (`TIMESTAMP`, Default `CURRENT_TIMESTAMP`)

### 4. `categories`
Organizes courses into subject categories.
* **Fields**:
  * `id` (`VARCHAR(255)`, Primary Key)
  * `name` (`VARCHAR(255)`, Not Null, Unique Index)
  * `slug` (`VARCHAR(255)`, Not Null, Unique Index)
  * `description` (`TEXT`, Nullable)
  * `sort_order` (`INT`, Default `0`)
  * `created_at` (`TIMESTAMP`, Default `CURRENT_TIMESTAMP`)

### 5. `courses`
Stores course details, pricing, status, and SEO metadata.
* **Fields**:
  * `id` (`VARCHAR(255)`, Primary Key)
  * `title` (`VARCHAR(255)`, Not Null)
  * `slug` (`VARCHAR(255)`, Not Null, Unique Index)
  * `short_description` (`TEXT`, Nullable)
  * `description` (`TEXT`, Nullable)
  * `thumbnail_url` (`VARCHAR(500)`, Nullable)
  * `price_cents` (`INT`, Default `0`) — Stored in integer currency cents (e.g., `499900` = ₹4,999.00)
  * `currency` (`VARCHAR(10)`, Default `'INR'`)
  * `status` (`VARCHAR(50)`, Default `'DRAFT'`) — Values: `'DRAFT'`, `'PUBLISHED'`, `'ARCHIVED'`
  * `is_featured` (`BOOLEAN`, Default `FALSE`)
  * `category_id` (`VARCHAR(255)`, Nullable, Foreign Key → `categories.id` ON DELETE SET NULL)
  * `seo_title` (`VARCHAR(255)`, Nullable)
  * `seo_description` (`TEXT`, Nullable)
  * `sort_order` (`INT`, Default `0`)
  * `created_at` (`TIMESTAMP`, Default `CURRENT_TIMESTAMP`)
  * `updated_at` (`TIMESTAMP`, Default `CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`)

### 6. `modules`
Groupings of lessons within a course.
* **Fields**:
  * `id` (`VARCHAR(255)`, Primary Key)
  * `course_id` (`VARCHAR(255)`, Not Null, Foreign Key → `courses.id` ON DELETE CASCADE)
  * `title` (`VARCHAR(255)`, Not Null)
  * `sort_order` (`INT`, Default `0`)

### 7. `lessons`
Individual learning modules/video items.
* **Fields**:
  * `id` (`VARCHAR(255)`, Primary Key)
  * `module_id` (`VARCHAR(255)`, Not Null, Foreign Key → `modules.id` ON DELETE CASCADE)
  * `title` (`VARCHAR(255)`, Not Null)
  * `description` (`TEXT`, Nullable)
  * `video_url` (`VARCHAR(500)`, Nullable) — Stored Google Drive link
  * `duration_seconds` (`INT`, Default `0`)
  * `notes` (`TEXT`, Nullable)
  * `sort_order` (`INT`, Default `0`)
  * `is_preview` (`BOOLEAN`, Default `FALSE`)

### 8. `lesson_resources`
Supplemental downloadable files or external links attached to lessons.
* **Fields**:
  * `id` (`VARCHAR(255)`, Primary Key)
  * `lesson_id` (`VARCHAR(255)`, Not Null, Foreign Key → `lessons.id` ON DELETE CASCADE)
  * `type` (`VARCHAR(50)`, Default `'FILE'`) — Values: `'FILE'`, `'LINK'`, `'NOTE'`
  * `title` (`VARCHAR(255)`, Not Null)
  * `url` (`VARCHAR(500)`, Nullable)
  * `content` (`TEXT`, Nullable)
  * `sort_order` (`INT`, Default `0`)
  * `created_at` (`TIMESTAMP`, Default `CURRENT_TIMESTAMP`)

### 9. `enrollments`
Tracks student access grants to courses.
* **Fields**:
  * `id` (`VARCHAR(255)`, Primary Key)
  * `user_id` (`VARCHAR(255)`, Not Null, Foreign Key → `users.id` ON DELETE CASCADE)
  * `course_id` (`VARCHAR(255)`, Not Null, Foreign Key → `courses.id` ON DELETE CASCADE)
  * `status` (`VARCHAR(50)`, Default `'ACTIVE'`) — Values: `'ACTIVE'`, `'EXPIRED'`, `'REVOKED'`
  * `source` (`VARCHAR(50)`, Default `'purchase'`) — Values: `'purchase'`, `'manual'`
  * `enrolled_at` (`TIMESTAMP`, Default `CURRENT_TIMESTAMP`)
* **Constraints**: Unique Index `unique_user_course` (`user_id`, `course_id`)

### 10. `lesson_progress`
Tracks student lesson completion states.
* **Fields**:
  * `id` (`VARCHAR(255)`, Primary Key)
  * `user_id` (`VARCHAR(255)`, Not Null, Foreign Key → `users.id` ON DELETE CASCADE)
  * `lesson_id` (`VARCHAR(255)`, Not Null, Foreign Key → `lessons.id` ON DELETE CASCADE)
  * `is_completed` (`BOOLEAN`, Default `FALSE`)
  * `completed_at` (`TIMESTAMP`, Nullable)
* **Constraints**: Unique Index `unique_user_lesson` (`user_id`, `lesson_id`)

### 11. `orders`
Stores offline manual payment transactions submitted by students for course purchases.
* **Fields**:
  * `id` (`VARCHAR(255)`, Primary Key)
  * `order_number` (`VARCHAR(255)`, Not Null, Unique Index) — Format: `ORD-YYYYMMDD-XXXX`
  * `user_id` (`VARCHAR(255)`, Not Null, Foreign Key → `users.id` ON DELETE CASCADE)
  * `course_id` (`VARCHAR(255)`, Not Null, Foreign Key → `courses.id` ON DELETE CASCADE)
  * `amount_cents` (`INT`, Not Null)
  * `currency` (`VARCHAR(10)`, Default `'INR'`)
  * `status` (`VARCHAR(50)`, Default `'PENDING'`) — Values: `'PENDING'`, `'APPROVED'`, `'REJECTED'`, `'REFUNDED'`, `'INFO_REQUESTED'`
  * `payer_name` (`VARCHAR(255)`, Nullable)
  * `payer_mobile` (`VARCHAR(50)`, Nullable)
  * `transaction_id` (`VARCHAR(255)`, Nullable) — Bank UTR or UPI reference string
  * `payment_screenshot_url` (`VARCHAR(500)`, Nullable)
  * `student_notes` (`TEXT`, Nullable)
  * `reviewed_by_id` (`VARCHAR(255)`, Nullable, Foreign Key → `users.id` ON DELETE SET NULL)
  * `reviewed_at` (`TIMESTAMP`, Nullable)
  * `rejection_reason` (`TEXT`, Nullable)
  * `created_at` (`TIMESTAMP`, Default `CURRENT_TIMESTAMP`)

### 12. `payment_settings`
Singleton table (`id = 'default'`) for bank/QR payment gateway instructions.
* **Fields**: `id` (`VARCHAR(50)` PK), `enabled` (`BOOLEAN`), `qr_image_url` (`VARCHAR(500)`), `upi_id` (`VARCHAR(255)`), `account_holder_name` (`VARCHAR(255)`), `account_number` (`VARCHAR(255)`), `ifsc_code` (`VARCHAR(50)`), `bank_name` (`VARCHAR(255)`), `instructions` (`TEXT`), `support_contact` (`VARCHAR(255)`).

### 13. `email_settings`
Singleton table (`id = 'default'`) for platform SMTP credentials.
* **Fields**: `id` (`VARCHAR(50)` PK), `enabled` (`BOOLEAN`), `smtp_host` (`VARCHAR(255)`), `smtp_port` (`INT`), `smtp_username` (`VARCHAR(255)`), `smtp_password` (`VARCHAR(255)`), `smtp_secure` (`BOOLEAN`), `sender_email` (`VARCHAR(255)`), `sender_name` (`VARCHAR(255)`), `reply_to` (`VARCHAR(255)`).

### 14. `site_settings`
Singleton table (`id = 'default'`) for site metadata and global branding.
* **Fields**: `id` (`VARCHAR(50)` PK), `site_name` (`VARCHAR(255)`), `tagline` (`VARCHAR(255)`), `logo_url` (`VARCHAR(500)`), `contact_email` (`VARCHAR(255)`).

### 15. `email_templates`
Customizable HTML email template blocks per system event.
* **Fields**: `id` (`VARCHAR(255)` PK), `event` (`VARCHAR(100)` Unique), `name` (`VARCHAR(255)`), `subject` (`VARCHAR(255)`), `blocks_json` (`TEXT`), `compiled_html` (`TEXT`), `is_active` (`BOOLEAN`).

### 16. `email_logs`
Logs of all dispatched emails and delivery error stack traces.
* **Fields**: `id` (`VARCHAR(255)` PK), `to_email` (`VARCHAR(255)`), `subject` (`VARCHAR(255)`), `status` (`VARCHAR(50)`), `error_msg` (`TEXT`), `sent_at` (`TIMESTAMP`), `created_at` (`TIMESTAMP`).

### 17. `homepage_sections`
Dynamic homepage block content settings.
* **Fields**: `id` (`VARCHAR(255)` PK), `key` (`VARCHAR(100)` Unique), `title` (`VARCHAR(255)`), `subtitle` (`VARCHAR(255)`), `enabled` (`BOOLEAN`), `sort_order` (`INT`), `data` (`TEXT`), `updated_at` (`TIMESTAMP`).

### 18. `nav_menu_items`
Navigation menu structure table.
* **Fields**: `id` (`VARCHAR(255)` PK), `label` (`VARCHAR(255)`), `url` (`VARCHAR(255)`), `location` (`VARCHAR(50)`), `sort_order` (`INT`), `open_in_new` (`BOOLEAN`), `parent_id` (`VARCHAR(255)` FK → `nav_menu_items.id`).

### 19. `audit_logs`
System activity log table.
* **Fields**: `id` (`VARCHAR(255)` PK), `user_id` (`VARCHAR(255)` FK → `users.id`), `action` (`VARCHAR(255)`), `entity_type` (`VARCHAR(100)`), `entity_id` (`VARCHAR(255)`), `metadata` (`TEXT`), `ip_address` (`VARCHAR(100)`), `user_agent` (`VARCHAR(500)`), `created_at` (`TIMESTAMP`).

---

## 4. Features Implemented

### 1. Landing Page (`/`)
* **Status**: **Fully Working**
* **Details**: Renders responsive Hero section with CTA buttons, statistics banner (10k+ Traders, 50+ Strategies), course cards dynamically loaded from DB (or fallback defaults), "Why Choose Us" feature cards, header navigation, and mobile menu drawer.

### 2. Course Catalog (`/courses`)
* **Status**: **Fully Working**
* **Details**: Full course discovery page with text search filter (`q`) and category filter tabs (`category`). Displays course cards with pricing, enrollment count, and featured tags.

### 3. Course Detail Page (`/courses/[slug]`)
* **Status**: **Fully Working**
* **Details**: Displays course description, stats (total hours, lesson count, student count), collapsible module/lesson curriculum tree with preview tags, and smart state CTA ("Buy Now", "Continue Learning", or "Sign in to Enroll").

### 4. Purchase & Payment Flow (`/courses/[slug]/buy`)
* **Status**: **Fully Working**
* **Details**: Auto-enrolls free courses instantly. For paid courses, renders payment instructions (QR image, UPI ID with copy button, bank details), collects payer name, mobile, UTR transaction ID, and screenshot upload, creating a `PENDING` order. Blocks duplicate pending orders or re-purchases of enrolled courses.

### 5. Authentication System (`(auth)/*`)
* **Status**: **Fully Working**
* **Details**:
  * Email + Password Login (`/login`)
  * 6-digit Email OTP Login (`/login-otp`)
  * New User Registration (`/register`) sending verification token link via email; sets status to `PENDING_VERIFICATION` until verified (`/verify-email`)
  * Password Reset Flow (`/forgot-password` and `/reset-password`) with token validation and expiration checks.

### 6. Student Portal (`(student)/*`)
* **Status**: **Fully Working**
* **Details**:
  * **Dashboard Overview (`/dashboard`)**: Displays enrolled courses with progress bar calculation (`completedLessons / totalLessons * 100`) and recent orders.
  * **My Courses (`/dashboard/courses`)**: Enrolled courses list.
  * **My Orders (`/dashboard/orders`)**: Complete order transaction history table with downloadable PDF receipt link for approved orders.
  * **My Profile (`/dashboard/profile`)**: Form to update display name, mobile number, and bio.

### 7. LMS Course Player (`/learn/[courseSlug]/[lessonId]`)
* **Status**: **Fully Working**
* **Details**: Top bar navigation, full curriculum sidebar with completion checkmarks, embedded Google Drive video player (automatically transforms `drive.google.com/file/d/...` URLs to `/preview`), lesson description, lesson notes text, attached resources list with download links, toggle complete/incomplete server action button, and previous/next lesson navigation links.

### 8. PDF Invoice & Receipt Generator (`/api/receipts/[orderId]`)
* **Status**: **Fully Working**
* **Details**: Authenticated endpoint using `pdfkit` to generate PDF receipts on-the-fly for approved orders. Accessible by the student owner or admin.

### 9. Admin Overview Dashboard (`/admin`)
* **Status**: **Fully Working**
* **Details**: Live metrics calculated from DB: Total Revenue, Total Users, Total Courses, Pending Orders count.

### 10. Admin Course Management (`/admin/courses` & `/admin/courses/[id]`)
* **Status**: **Fully Working**
* **Details**: Create course modal, courses table with category filter, quick publish/draft toggle action, quick sort order input, full course editor (modifying details, pricing, thumbnail, SEO title/description), and module/lesson CRUD (adding, editing, deleting modules and lessons).

### 11. Admin Order Review (`/admin/orders` & `/admin/orders/[id]`)
* **Status**: **Fully Working**
* **Details**: Table listing all orders. Detail page displays UTR ID, payer info, and uploaded screenshot. Includes Approve button (creates active `Enrollment`, updates order status to `APPROVED`, sends `PAYMENT_APPROVED` email) and Reject button (with custom reason prompt, updates status to `REJECTED`, sends `PAYMENT_REJECTED` email).

### 12. Admin Student Management (`/admin/students` & `/admin/students/[id]`)
* **Status**: **Fully Working**
* **Details**: List of registered students with search/filter, quick active/inactive status toggle, and detailed profile page showing personal information, course enrollments (with revoke/reactivate buttons), and billing order history.

### 13. Admin Enrollment Management (`/admin/enrollments`)
* **Status**: **Fully Working**
* **Details**: Lists all enrollments across the system. Includes manual student enrollment form (selecting user and course for complimentary access), revoking active enrollments, and reactivating revoked access.

### 14. Admin Settings (`/admin/settings/*`)
* **Status**: **Fully Working**
* **Details**:
  * **Site & Branding (`/admin/settings/site`)**: Updates site name, tagline, contact email, and uploads logo or site favicon.
  * **QR Payment (`/admin/settings/payment`)**: Updates UPI ID, payment instructions, support contact, and uploads payment QR image.
  * **Email (SMTP) (`/admin/settings/email`)**: Configures SMTP host, port, username, password, secure flag, sender name/email, and includes a live "Send Test Email" action.

### 15. Admin Email Templates (`/admin/email-templates`)
* **Status**: **Fully Working**
* **Details**: Lists all system event templates (`WELCOME`, `REGISTRATION`, `PAYMENT_RECEIVED`, `PAYMENT_APPROVED`, `PAYMENT_REJECTED`, `COURSE_ENROLLMENT`, `PASSWORD_RESET`, `ACCOUNT_VERIFICATION`, `ADMIN_NOTIFICATION`, `CUSTOM_BROADCAST`). Allows editing subject lines, active toggle, and visual block JSON structures.

### 16. Admin Homepage Section Editor (`/admin/homepage`)
* **Status**: **Fully Working**
* **Details**: Lists homepage sections (`hero`, `features`, `testimonials`, `faq`, `cta`). Allows toggling enable/disable status and editing JSON data configurations.

### 17. Admin SEO Overview (`/admin/seo`)
* **Status**: **Partially Implemented**
* **Details**: Display-only summary page showing global SEO properties configured in site settings. Does not contain direct edit form fields (edits must be made via Site Settings or individual Course edit pages).

---

## 5. Auth & Sessions

* **Library**: NextAuth.js v5 (`next-auth 5.0.0-beta.25`).
* **Strategy**: **JWT Sessions** (`session: { strategy: "jwt" }`).
* **Credentials Provider**: Handled in `src/auth.ts`:
  * Supports password verification using `bcryptjs`.
  * Supports 6-digit OTP verification against the `verification_tokens` table.
* **Token Payload**: Contains `id` (User ID) and `role` (`'STUDENT'` or `'ADMIN'`).
* **Route Protection**:
  * **Middleware**: `src/middleware.ts` delegates to `auth.config.ts`.
  * `/admin/*` routes require `isLoggedIn && role === "ADMIN"`.
  * `/dashboard/*` and `/learn/*` routes require `isLoggedIn`.
  * `/login` and `/register` redirect authenticated users to `/admin` or `/dashboard`.
  * **Server-side Guards**: `requireUser()` and `requireAdmin()` in `src/lib/guards.ts` protect server actions and React Server Components.
* **Session Limits / Max Concurrent Logins**: **Not Implemented**. JWT tokens are stateless; there is no concurrent login enforcement or token invalidation tracking table.

---

## 6. API Routes / Endpoints

| HTTP Method | Route Endpoint | Purpose | Authorization / Auth Check |
|---|---|---|---|
| `GET / POST` | `/api/auth/[...nextauth]` | NextAuth authentication handler endpoints (signIn, signOut, session, callback) | Public |
| `GET` | `/api/receipts/[orderId]` | Generates dynamic PDF receipt buffer for an approved order using `pdfkit` | Requires Session; Order `user_id` must match `session.user.id` OR `session.user.role === 'ADMIN'` |
| `POST` | `/api/upload` | Handles image file upload (PNG, JPEG, WebP, GIF up to 5MB), saves to `public/uploads` | Requires Session (`session?.user`) |
| `POST` | `/api/upload-favicon` | Uploads site favicon file (.ico or .png up to 1MB), saves directly to `public/favicon.ico` | Requires Admin Session (`session.user.role === 'ADMIN'`) |
| `GET` | `/robots.txt` | Returns dynamic robots.txt file disallowing `/admin`, `/dashboard`, `/api` | Public |
| `GET` | `/sitemap.xml` | Returns dynamic XML sitemap listing all published course URLs | Public |

---

## 7. Known Issues / Incomplete Areas

1. **Documentation Discrepancy**:
   * `README.md` and `DEPLOYMENT.md` reference Prisma, SQLite, and Prisma CLI commands (`npx prisma db push`). V2 of the codebase operates entirely on Native MySQL (`mysql2/promise`) and `src/lib/db-init.ts`.
2. **Email Dependency Risk**:
   * If SMTP is disabled or misconfigured in `email_settings`, user registration still creates the user account in status `PENDING_VERIFICATION`, but the email dispatch fails (logged in `email_logs`). The student cannot log in until verified or marked active by an admin.
3. **Google Drive Video Regex Fragility**:
   * In `src/app/(student)/learn/[courseSlug]/[lessonId]/page.tsx`, Google Drive URL parsing relies on `/d\/([^/]+)/`. If an admin inputs a non-standard Google Drive share link (e.g. `open?id=...`), iframe preview URL generation will fail.
4. **Local Disk Storage Limitation**:
   * Images uploaded via `/api/upload` and `/api/upload-favicon` are written directly to local server disk (`public/uploads` and `public/favicon.ico`). On ephemeral hosting environments (e.g., Vercel or container restarts without persistent volumes), uploaded files will be lost.
5. **Unused Database Tables (Dead Schema)**:
   * Tables `nav_menu_items` and `audit_logs` are created in `src/lib/db-init.ts`, but no UI components or server actions read or write to these tables.
6. **SEO Settings Page Read-Only**:
   * `/admin/seo` displays current SEO metadata but does not provide an inline form to edit global meta tags.

---

## 8. Environment & Config

Required environment variables (defined in `.env`):

```env
# === Database Credentials ===
DB_HOST="127.0.0.1"              # MySQL server host address
DB_PORT=3306                     # MySQL server port
DB_USER="database_user"          # Database username
DB_PASSWORD="database_password"  # Database user password
DB_NAME="database_name"          # Target database schema name

# === Auth.js / NextAuth Configuration ===
AUTH_SECRET="random_32_char_string" # Secret key for signing/encrypting JWT session cookies
AUTH_URL="http://localhost:3000"    # Canonical app URL for auth callbacks
AUTH_TRUST_HOST=true                # Allows Auth.js to trust proxy host headers

# === Application URL ===
APP_URL="http://localhost:3000"     # Root application URL used for links in email templates

# === Default Seed Admin Credentials (Optional) ===
SEED_ADMIN_EMAIL="admin@tradelearninghub.local" # Initial admin email created on db init
SEED_ADMIN_PASSWORD="ChangeMe123!"              # Initial admin password
SEED_ADMIN_NAME="Platform Admin"                # Initial admin display name
```

---

## 9. What's Missing Entirely

The following standard LMS features currently have **no code presence or database tables**:

1. **Automated Payment Gateways**: No integration for Razorpay, Stripe, Instamojo, or PayPal (only manual QR/UPI receipt upload exists).
2. **Coupons & Discounts System**: No discount codes, promotional links, or checkout coupon input.
3. **Automated Course Completion Certificates**: No PDF generation or tracking for course completion certificates (only billing receipts exist).
4. **Quiz & Assessment Engine**: No support for multiple-choice questions, assignments, grading, or progress quizzes.
5. **Live Webinars & Virtual Classrooms**: No Zoom, Google Meet, or WebRTC live streaming integrations.
6. **In-App Student Notification System**: No notification bell, push notifications, or database notification tables.
7. **CSV / Excel Data Export**: No export buttons for student lists, order ledgers, or enrollment reports.
8. **Tax & Multi-Currency Engine**: Currency is fixed per course; no GST/VAT tax calculation during checkout.
