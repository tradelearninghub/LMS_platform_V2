# Deploying Trade Learning Hub to Hostinger Node.js Hosting

## Prerequisites

- **Hostinger Node.js Hosting** plan (Business or higher)
- **MySQL database** created in Hostinger hPanel
- **Node.js 18+** selected in hPanel
- **Git** installed locally

---

## Step 1: Create MySQL Database on Hostinger

1. Log in to **hPanel** → **Databases** → **MySQL Databases**
2. Create a new database:
   - Database name: `trade_learning_hub`
   - Username: `tlh_admin`
   - Password: (generate a strong one)
3. Note down:
   - **Host**: Usually `localhost` or shown in hPanel
   - **Port**: `3306`
   - **Database name**: `u123456789_trade_learning_hub` (Hostinger prefixes it)
   - **Username**: `u123456789_tlh_admin`
   - **Password**: your password

---

## Step 2: Switch Prisma to MySQL

The production schema needs MySQL. Create a file `prisma/schema.production.prisma` or modify `prisma/schema.prisma`:

Change the datasource:
```prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}
```

For long text fields, add `@db.Text`:
- `Course.description`
- `Lesson.description`
- `Lesson.notes`
- `LessonResource.content`
- `PaymentSettings.instructions`
- `EmailTemplate.blocksJson`
- `EmailTemplate.compiledHtml`
- `HomepageSection.data`
- `AuditLog.metadata`

Example:
```prisma
description String? @db.Text
```

---

## Step 3: Set Environment Variables

In Hostinger hPanel → **Advanced** → **Environment Variables** (or create a `.env` file):

```env
DATABASE_URL="mysql://u123456789_tlh_admin:YOUR_PASSWORD@localhost:3306/u123456789_trade_learning_hub"
AUTH_SECRET="generate-random-32-chars-here"
AUTH_URL="https://yourdomain.com"
AUTH_TRUST_HOST=true
APP_URL="https://yourdomain.com"
NODE_ENV="production"
```

### Generate AUTH_SECRET
Run this in your terminal:
```bash
openssl rand -base64 32
```
Or use: https://generate-secret.vercel.app/32

---

## Step 4: Upload & Build

### Option A: Git Deploy (Recommended)

1. Push your code to GitHub/GitLab
2. In hPanel → **Advanced** → **Git**
3. Connect your repository
4. Set the deployment branch

### Option B: File Manager Upload

1. Build locally: `npm run build`
2. Upload via File Manager or FTP:
   - Upload the entire project (excluding `node_modules/`)
   - Upload to `public_html/` or your Node.js app directory

### After upload:

```bash
# SSH into your Hostinger server or use the terminal in hPanel
cd ~/public_html  # or your app directory

# Install production dependencies
npm install --production

# Generate Prisma client
npx prisma generate

# Push schema to MySQL database
npx prisma db push

# Seed the database (first time only)
npx tsx prisma/seed.ts

# Build the app
npm run build
```

---

## Step 5: Configure Node.js in hPanel

1. Go to **hPanel** → **Advanced** → **Node.js**
2. Set:
   - **Node.js version**: 18.x or 20.x
   - **Application root**: `/` (or your app directory)
   - **Application startup file**: `node_modules/next/dist/bin/next`
   - **Application mode**: Production
3. Click **Start** or **Restart**

### Alternative: Using PM2

If hPanel supports custom commands:
```bash
npm install -g pm2
pm2 start ecosystem.config.js
pm2 save
```

---

## Step 6: Set Up Domain & SSL

1. In hPanel → **Domains** → point your domain to the hosting
2. In hPanel → **SSL** → install free Let's Encrypt SSL
3. Update your `.env`:
   ```env
   AUTH_URL="https://yourdomain.com"
   APP_URL="https://yourdomain.com"
   ```

---

## Step 7: Post-Deploy Verification

1. Visit `https://yourdomain.com` → should show the landing page
2. Visit `https://yourdomain.com/login` → sign in with admin credentials:
   - Email: `admin@tradelearninghub.local`
   - Password: `ChangeMe123!`
3. **IMMEDIATELY** change the admin password via the database or add a password change feature
4. Visit `https://yourdomain.com/admin` → admin dashboard should show KPIs
5. Visit `https://yourdomain.com/sitemap.xml` → should list your courses
6. Visit `https://yourdomain.com/robots.txt` → should block `/admin` and `/api`

---

## Troubleshooting

### "Cannot connect to database"
- Verify `DATABASE_URL` format: `mysql://user:pass@host:3306/dbname`
- Ensure the MySQL user has full permissions on the database
- Check if Hostinger requires `localhost` vs the actual hostname

### "ECONNREFUSED" or "AUTH_SECRET missing"
- Ensure all environment variables are set in hPanel
- Restart the Node.js application after changing env vars

### "Module not found" errors
- Run `npm install` on the server
- Run `npx prisma generate` after install

### Build fails with memory errors
- Hostinger may have limited RAM. Try:
  ```bash
  NODE_OPTIONS="--max-old-space-size=512" npm run build
  ```

### Prisma issues with MySQL
- Ensure you changed `provider = "mysql"` in schema.prisma
- Run `npx prisma db push` (not `migrate deploy` for first setup)

---

## Updating the App

After making changes:

```bash
git pull origin main  # or upload new files
npm install
npx prisma generate
npx prisma db push    # if schema changed
npm run build
pm2 restart trade-learning-hub  # or restart via hPanel
```

---

## Security Checklist

- [ ] Change default admin password
- [ ] Set strong `AUTH_SECRET`
- [ ] Enable HTTPS (SSL certificate)
- [ ] Set `AUTH_TRUST_HOST=true` in env
- [ ] Configure SMTP from Admin → Settings → Email
- [ ] Keep `node_modules` out of version control
- [ ] Don't commit `.env` to git
