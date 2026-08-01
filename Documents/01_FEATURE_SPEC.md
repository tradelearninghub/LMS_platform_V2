# Trade Learning Hub — Feature Specification (V3 Plan)

> This document reflects the finalized plan after reviewing the existing codebase (`PROJECT_STATE.md`). It supersedes prior assumptions where they conflict. Anything not explicitly changed here should be preserved as-is from the current build.

---

## 1. Public Site

### 1.1 Landing Page (`/`)
- Hero section with CTA
- Trust/credibility strip (experience, student count, results)
- Featured courses (pulled dynamically)
- "Why learn here" feature cards
- Testimonials
- "How it works" (Pick a course → Pay via UPI → Get access after approval)
- FAQ
- Footer with legal links
- Keep existing dynamic homepage-section editor (admin-managed blocks) — no change needed here.

### 1.2 Course Catalog (`/courses`)
- **CHANGE**: Remove search bar and category filter tabs. Course count will stay low; a simple grid is sufficient.
- Grid of course cards: thumbnail, title, short description, MRP (struck-through) + selling price, "View Details" CTA.

### 1.3 Course Detail (`/courses/[slug]`)
- Title, banner image, full description
- Stats (total lessons, estimated duration)
- Curriculum tree: module names + unit/lesson names visible pre-purchase, collapsed by default, **not clickable until purchased**
- Pricing block: MRP struck-through, selling price, (if a coupon/referral is active and applied) discounted price
- **CHANGE**: No instructor bio block.
- Smart CTA: "Buy Now" / "Continue Learning" / "Sign in to Enroll"
- Trading risk disclaimer included on this page (not a separate legal page)

### 1.4 Purchase / Checkout Flow (`/courses/[slug]/buy`)
- Payment popup: QR code image + UPI ID with copy-to-clipboard
- **NEW**: Coupon/referral code input field — user enters code, clicks Apply, price recalculates and displays rounded up to nearest whole rupee (e.g. 2599.76 → 2600)
- Payment form fields:
  - Name, email, course — prefilled, greyed out, non-editable
  - Transaction ID (UTR), mobile number — editable, required
  - Payment screenshot upload — required
  - **NEW**: Applied coupon/referral code — shown pre-filled/read-only in the form so admin sees why the price is discounted
- On submit: creates a `PENDING` order, shows confirmation popup ("Submitted — course unlocks after admin approval")
- Existing duplicate-order and re-purchase blocking logic is preserved

### 1.5 Policy Pages (`/privacy`, `/refund`, `/terms`, `/research`)
- **CHANGE**: Restyle to read like a long-form article (Medium-style): generous line-height, comfortable reading width, article typography — see Design System doc.
- Refund policy: to be drafted separately (not yet decided by owner) — placeholder page structure only for now.

### 1.6 Contact Page
- Contact form
- Trading risk disclaimer repeated here as well

---

## 2. Authentication
No structural changes — existing system is solid:
- Email + password login
- 6-digit OTP login
- Registration with email verification
- Forgot/reset password flow

**NEW addition**: Session limit enforcement — max 2 concurrent active sessions per student account (see Database Schema doc for mechanism). When a 3rd login occurs, the oldest active session is invalidated (or the user is warned and asked to log out elsewhere — decide exact UX during build).

---

## 3. Student Portal

### 3.1 Dashboard Overview
- Enrolled courses with progress bars
- Recent orders
- No change

### 3.2 My Courses
- No change

### 3.3 My Orders
- Order history table with receipt download
- **CHANGE**: Receipt generation approach — instead of drawing PDFs imperatively with PDFKit, use a stored HTML receipt template populated with the order's stored transaction details at request time, then rendered to PDF on download. No PDF file is stored — always generated fresh from the order record.

### 3.4 Profile
- No change

### 3.5 Course Player (`/learn/[courseSlug]/[lessonId]`)
Two lesson content types now supported:

**URL-type lesson** (existing, e.g. Google Drive video)
- Lesson page shows title + description
- "Open Lesson" action opens the link (modal or new tab) and marks the lesson as "started"
- When the user returns to the app tab, a popup reopens automatically: "Mark this lesson complete?" with Mark Complete / Close options
- Previous / Next buttons at the bottom

**PDF-type lesson** (NEW)
- PDF renders as a continuous in-page scroll — not downloadable, not a raw file link
- Right-click/print/save disabled at the viewer level
- Served via a signed, time-limited URL — never a direct static file path
- Progress bar at the top of the page, fills as the student scrolls through
- Previous / Next buttons at the bottom, same placement as URL lessons

Sidebar curriculum with completion checkmarks — unchanged.

---

## 4. Admin Panel

### 4.1 Overview Dashboard
- No change (revenue, users, courses, pending orders KPIs)

### 4.2 Course Management
- Add/edit course: title, thumbnail, brief, description, **MRP + selling price** (replacing single price field)
- Module → Lesson hierarchy, unchanged structure
- **NEW**: Per-lesson content type selector — "Add URL" or "Upload PDF" — determines which player experience is used
- Publish/draft/archive toggle — unchanged

### 4.3 Coupons & Referrals (NEW)
- Two independently toggleable systems: Coupons and Referrals
- Admin can create/edit/activate/deactivate codes
- Each code: code string, discount type (flat / percentage), value, active flag, optional per-course or site-wide scope
- Applied code is recorded on the order for admin visibility

### 4.4 Order / Payment Approval
- **CHANGE**: Remove search feature from this section (not needed at current volume)
- Table: student, course, transaction ID, mobile, screenshot thumbnail, applied coupon/referral code (if any), submitted date
- Approve / Reject with optional rejection reason — unchanged
- Approve → creates enrollment, sends Payment Approved email

### 4.5 Student Management
- No structural change — list, profile view, manual enrollment grant/revoke

### 4.6 Enrollment Management
- No change

### 4.7 Settings
- **Site & Branding** — unchanged
- **Payment (QR/UPI)** — unchanged
- **Email** — **CHANGE**: becomes a list of sender profiles rather than a single SMTP config (see 4.9)
- **NEW**: Export — CSV / Excel / PDF export buttons for student list, order/payment ledger, enrollment report, with date-range filtering

### 4.8 Email Templates
- Existing template list (`WELCOME`, `REGISTRATION`, `PAYMENT_RECEIVED`, `PAYMENT_APPROVED`, `PAYMENT_REJECTED`, `COURSE_ENROLLMENT`, `PASSWORD_RESET`, `ACCOUNT_VERIFICATION`, `ADMIN_NOTIFICATION`, `CUSTOM_BROADCAST`) — preserved as-is
- **NEW**: Each template gets a sender dropdown — choose which configured sender email profile (see 4.9) that event sends from. Falls back to a default sender if unset.

### 4.9 Multiple Email Senders (NEW)
- Admin can add multiple full SMTP sender profiles (name, email address, SMTP host/port/username/password, secure flag, active toggle)
- Each profile has its own independent "Send Test Email" action
- Used by 4.8's per-template sender dropdown

### 4.10 Homepage Section Editor
- No change

### 4.11 SEO Overview
- No change planned for now (remains read-only; can be revisited later)

---

## 5. Explicitly Out of Scope (for now)
- Automated payment gateways (Razorpay/Stripe/etc.)
- Quiz/assessment engine
- Live webinars
- Course completion certificates
- In-app notification bell (deferred — would require DB query changes across the app; revisit later)
- Multi-currency / tax engine
- Search/analytics dashboards beyond existing KPIs

---

## 6. Cross-Cutting Rules
- **Course access**: lifetime, no expiry
- **Sessions**: max 2 concurrent active sessions per student
- **Pricing/coupons**: discounted price always rounded up to the nearest whole rupee
- **PDF course content**: must be secured server-side (signed/expiring URLs, no direct download, no reliance on frontend-only restrictions)
- **Receipts**: generated on-demand from stored order data via an HTML template → PDF, never stored as static files
- **Refund policy**: not yet finalized — page scaffold only, content to be added later
