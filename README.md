# Trade Learning Hub V2

A complete LMS scaffold built on **Next.js 15 (App Router) + TypeScript + Tailwind + Prisma + Auth.js v5**, ready for **Hostinger Node.js Hosting** with MySQL.

This repo is a **project scaffold + full database schema**. Auth, layouts, route groups, and one sample course are wired up. Feature pages (course management UI, email builder, admin CRUD, payment flow) are stubbed with placeholders inside an already-organized folder structure — designed to be built one module at a time without architectural rework.

---

## Quick start

```bash
# 1. Install deps
npm install

# 2. Initialize the dev database (SQLite)
npm run db:push
npm run db:seed

# 3. Run the dev server
npm run dev
# → http://localhost:3000
```

Default admin (from `.env`):
- email: `admin@tradelearninghub.local`
- password: `ChangeMe123!`

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router, Server Actions) |
| Language | TypeScript |
| Styling | Tailwind CSS + ShadCN-style design tokens |
| Database (dev) | SQLite via Prisma |
| Database (prod) | **MySQL on Hostinger** (switch `provider` in `prisma/schema.prisma`) |
| ORM | Prisma 5 |
| Auth | Auth.js v5 (Credentials provider, Prisma adapter, JWT sessions) |
| Email | Nodemailer over SMTP (configured at runtime via the admin panel) |
| Storage | Google Drive URLs (DB only stores the URL + metadata) |
| Payments | Manual QR / UPI workflow with admin verification |

---

## Folder structure

```
src/
├── app/
│   ├── (public)/          # Marketing site (landing, /courses, /courses/[slug], etc.)
│   ├── (auth)/            # /login, /register, /forgot-password
│   ├── (student)/         # /dashboard, /dashboard/courses, /learn/[course]/[lesson]
│   ├── (admin)/           # /admin, /admin/courses, /admin/orders, /admin/settings/*
│   ├── api/auth/[...nextauth]/route.ts
│   ├── globals.css
│   ├── layout.tsx
│   ├── robots.ts
│   └── sitemap.ts
├── auth.config.ts         # Edge-safe authz callbacks (used by middleware)
├── auth.ts                # Full Auth.js setup with Prisma adapter + Credentials
├── middleware.ts          # Route protection (admin/student/auth)
├── lib/
│   ├── db.ts              # Prisma singleton
│   ├── email.ts           # Nodemailer transport from EmailSettings row
│   ├── guards.ts          # requireUser / requireAdmin server helpers
│   ├── settings.ts        # Singleton settings upsert helpers
│   └── utils.ts           # cn(), formatCurrency, slugify, generateOrderNumber
└── types/next-auth.d.ts   # Augments Session/JWT with id + role
prisma/
├── schema.prisma          # Full data model (see below)
└── seed.ts                # Admin + sample course + default email templates
```

---

## Database model (high level)

All tables live in `prisma/schema.prisma`. Highlights:

- **Auth**: `User`, `Account`, `Session`, `VerificationToken`, `PasswordResetToken`
- **LMS hierarchy**: `Category` → `Course` → `Module` → `Lesson` → `LessonResource`
- **Learning state**: `Enrollment`, `LessonProgress`
- **Payments**: `Order` (manual QR workflow with status `PENDING | APPROVED | REJECTED | REFUNDED | INFO_REQUESTED`)
- **Admin-controlled settings (singleton rows)**:
  - `SiteSettings` — branding, SEO defaults, contact, socials, integrations
  - `PaymentSettings` — QR image URL, UPI ID, bank details, instructions, enabled flag
  - `EmailSettings` — SMTP host/port/user/pass, sender, reply-to
  - `AppSetting` — generic JSON key/value for feature flags
- **CMS**: `HomepageSection` (block-based), `NavMenuItem`
- **Email builder**: `EmailTemplate` (per `EmailEvent`) storing `blocksJson` + cached `compiledHtml`, plus `EmailLog`
- **Audit**: `AuditLog`

Money is stored as **integer cents** (`amountCents`, `priceCents`) — never floats.

### Switching to MySQL (Hostinger)

1. In `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "mysql"
     url      = env("DATABASE_URL")
   }
   ```
2. Add `@db.Text` to long text fields (see inline comments in the schema where they apply: `Course.description`, `Lesson.description`, `Lesson.notes`, `LessonResource.content`, `EmailTemplate.blocksJson`, `EmailTemplate.compiledHtml`).
3. Set `DATABASE_URL="mysql://USER:PASS@HOST:3306/DB"`.
4. `npx prisma migrate deploy`.

---

## Auth flow

- `auth.config.ts` is **edge-safe** (no Prisma, no bcrypt) and used by `middleware.ts` to protect routes.
- `auth.ts` registers the `Credentials` provider with bcrypt-hashed passwords via `PrismaAdapter`.
- Session strategy: **JWT** (works in middleware, no DB hit per request).
- `requireUser()` / `requireAdmin()` in `lib/guards.ts` for server actions / RSC.

---

## Built-in routes (scaffolded)

| Path | Purpose | Status |
|---|---|---|
| `/` | Marketing landing, featured courses | ✅ implemented |
| `/courses` | Course catalogue | placeholder |
| `/courses/[slug]` | Course detail + buy CTA | to build |
| `/login`, `/register` | Auth | login form wired, register placeholder |
| `/dashboard` | Student home | placeholder w/ layout |
| `/admin` | Admin overview with live KPIs from DB | ✅ implemented |
| `/admin/courses`, `/admin/orders`, ... | Admin CRUD modules | nav-wired placeholders |
| `/api/auth/[...nextauth]` | Auth.js handler | ✅ |
| `/sitemap.xml`, `/robots.txt` | SEO | ✅ |

---

## Next implementation passes

Roughly in priority order — each is a focused module that drops into this scaffold:

1. **Course CRUD** in `/admin/courses` (server actions + form components)
2. **Module & Lesson drag-and-drop** ordering (use `sortOrder` columns already in schema)
3. **Public `/courses/[slug]` page** with curriculum tree
4. **Order creation flow** (`POST` server action) + payment screenshot upload to `/public/uploads`
5. **Admin order review** (approve/reject → creates `Enrollment` + sends email)
6. **Visual email builder** (block editor → renders to HTML, saves `blocksJson` + `compiledHtml`)
7. **Student learn view** `/learn/[course]/[lesson]` with progress tracking
8. **SEO + Homepage section editors** in `/admin/seo` and `/admin/homepage`

The schema, route groups, guards, and settings infrastructure to support all of the above are already in place.

---

## Deployment to Hostinger Node.js Hosting

1. Switch Prisma provider to `mysql` and add `@db.Text` annotations (see above).
2. Set env vars in Hostinger panel: `DATABASE_URL`, `AUTH_SECRET`, `NEXTAUTH_URL`, `APP_URL`.
3. Build command: `npm install && npm run build`
4. Start command: `npm start`
5. Run `npx prisma migrate deploy` once after deploy.
6. Configure SMTP from **Admin → Settings → Email** (no redeploy needed to change providers).
