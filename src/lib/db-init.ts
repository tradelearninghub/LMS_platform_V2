import bcrypt from "bcryptjs";
import pool from "./db";

export async function initializeDatabase() {
  console.log("Initializing database tables...");

  const connection = await pool.getConnection();
  try {
    // 1. Create tables
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        email_verified TIMESTAMP NULL,
        name VARCHAR(255) NULL,
        image VARCHAR(255) NULL,
        password_hash VARCHAR(255) NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'STUDENT',
        status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
        mobile VARCHAR(50) NULL,
        bio TEXT NULL,
        last_login_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS verification_tokens (
        identifier VARCHAR(255) NOT NULL,
        token VARCHAR(255) NOT NULL UNIQUE,
        expires TIMESTAMP NOT NULL,
        PRIMARY KEY (identifier, token)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        token VARCHAR(255) NOT NULL UNIQUE,
        expires_at TIMESTAMP NOT NULL,
        used_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        slug VARCHAR(255) NOT NULL UNIQUE,
        description TEXT NULL,
        sort_order INT NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS courses (
        id VARCHAR(255) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        short_description TEXT NULL,
        description TEXT NULL,
        thumbnail_url VARCHAR(500) NULL,
        price_cents INT NOT NULL DEFAULT 0,
        currency VARCHAR(10) NOT NULL DEFAULT 'INR',
        status VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
        is_featured BOOLEAN NOT NULL DEFAULT FALSE,
        category_id VARCHAR(255) NULL,
        seo_title VARCHAR(255) NULL,
        seo_description TEXT NULL,
        sort_order INT NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Ensure sort_order column exists in courses (migration for existing databases)
    try {
      await connection.query("ALTER TABLE courses ADD COLUMN sort_order INT NOT NULL DEFAULT 0;");
      console.log("[DB Init] Added sort_order column to courses table.");
    } catch (err: any) {
      if (err.code === "ER_DUP_FIELDNAME") {
        // Safe to ignore since it already exists
        console.log("[DB Init] sort_order column already exists in courses table.");
      } else {
        console.error("[DB Init] Failed to verify/add sort_order to courses:", err);
      }
    }

    await connection.query(`
      CREATE TABLE IF NOT EXISTS modules (
        id VARCHAR(255) PRIMARY KEY,
        course_id VARCHAR(255) NOT NULL,
        title VARCHAR(255) NOT NULL,
        sort_order INT NOT NULL DEFAULT 0,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS lessons (
        id VARCHAR(255) PRIMARY KEY,
        module_id VARCHAR(255) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT NULL,
        video_url VARCHAR(500) NULL,
        duration_seconds INT NOT NULL DEFAULT 0,
        notes TEXT NULL,
        sort_order INT NOT NULL DEFAULT 0,
        is_preview BOOLEAN NOT NULL DEFAULT FALSE,
        FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS lesson_resources (
        id VARCHAR(255) PRIMARY KEY,
        lesson_id VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL DEFAULT 'FILE',
        title VARCHAR(255) NOT NULL,
        url VARCHAR(500) NULL,
        content TEXT NULL,
        sort_order INT NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS enrollments (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        course_id VARCHAR(255) NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
        source VARCHAR(50) NOT NULL DEFAULT 'purchase',
        enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_user_course (user_id, course_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS lesson_progress (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        lesson_id VARCHAR(255) NOT NULL,
        is_completed BOOLEAN NOT NULL DEFAULT FALSE,
        completed_at TIMESTAMP NULL,
        UNIQUE KEY unique_user_lesson (user_id, lesson_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(255) PRIMARY KEY,
        order_number VARCHAR(255) NOT NULL UNIQUE,
        user_id VARCHAR(255) NOT NULL,
        course_id VARCHAR(255) NOT NULL,
        amount_cents INT NOT NULL,
        currency VARCHAR(10) NOT NULL DEFAULT 'INR',
        status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
        payer_name VARCHAR(255) NULL,
        payer_mobile VARCHAR(50) NULL,
        transaction_id VARCHAR(255) NULL,
        payment_screenshot_url VARCHAR(500) NULL,
        student_notes TEXT NULL,
        reviewed_by_id VARCHAR(255) NULL,
        reviewed_at TIMESTAMP NULL,
        rejection_reason TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
        FOREIGN KEY (reviewed_by_id) REFERENCES users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS payment_settings (
        id VARCHAR(50) PRIMARY KEY DEFAULT 'default',
        enabled BOOLEAN NOT NULL DEFAULT TRUE,
        qr_image_url VARCHAR(500) NULL,
        upi_id VARCHAR(255) NULL,
        account_holder_name VARCHAR(255) NULL,
        account_number VARCHAR(255) NULL,
        ifsc_code VARCHAR(50) NULL,
        bank_name VARCHAR(255) NULL,
        instructions TEXT NULL,
        support_contact VARCHAR(255) NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS email_settings (
        id VARCHAR(50) PRIMARY KEY DEFAULT 'default',
        enabled BOOLEAN NOT NULL DEFAULT FALSE,
        smtp_host VARCHAR(255) NULL,
        smtp_port INT NULL,
        smtp_username VARCHAR(255) NULL,
        smtp_password VARCHAR(255) NULL,
        smtp_secure BOOLEAN NOT NULL DEFAULT TRUE,
        sender_email VARCHAR(255) NULL,
        sender_name VARCHAR(255) NULL,
        reply_to VARCHAR(255) NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS site_settings (
        id VARCHAR(50) PRIMARY KEY DEFAULT 'default',
        site_name VARCHAR(255) NOT NULL DEFAULT 'Trade Learning Hub',
        tagline VARCHAR(255) NULL,
        logo_url VARCHAR(500) NULL,
        contact_email VARCHAR(255) NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS email_templates (
        id VARCHAR(255) PRIMARY KEY,
        event VARCHAR(100) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        subject VARCHAR(255) NOT NULL,
        blocks_json TEXT NOT NULL,
        compiled_html TEXT NULL,
        is_active BOOLEAN NOT NULL DEFAULT TRUE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS email_logs (
        id VARCHAR(255) PRIMARY KEY,
        to_email VARCHAR(255) NOT NULL,
        subject VARCHAR(255) NOT NULL,
        status VARCHAR(50) NOT NULL,
        error_msg TEXT NULL,
        sent_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS homepage_sections (
        id VARCHAR(255) PRIMARY KEY,
        \`key\` VARCHAR(100) NOT NULL UNIQUE,
        title VARCHAR(255) NULL,
        subtitle VARCHAR(255) NULL,
        enabled BOOLEAN NOT NULL DEFAULT TRUE,
        sort_order INT NOT NULL DEFAULT 0,
        data TEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS nav_menu_items (
        id VARCHAR(255) PRIMARY KEY,
        label VARCHAR(255) NOT NULL,
        url VARCHAR(255) NOT NULL,
        location VARCHAR(50) NOT NULL DEFAULT 'header',
        sort_order INT NOT NULL DEFAULT 0,
        open_in_new BOOLEAN NOT NULL DEFAULT FALSE,
        parent_id VARCHAR(255) NULL,
        FOREIGN KEY (parent_id) REFERENCES nav_menu_items(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NULL,
        action VARCHAR(255) NOT NULL,
        entity_type VARCHAR(100) NULL,
        entity_id VARCHAR(255) NULL,
        metadata TEXT NULL,
        ip_address VARCHAR(100) NULL,
        user_agent VARCHAR(500) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    console.log("Tables created successfully. Seeding default data...");

    // 2. Seeding default Admin user if empty
    const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@tradelearninghub.local";
    const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "ChangeMe123!";
    const adminName = process.env.SEED_ADMIN_NAME ?? "Platform Admin";

    const [adminRows] = await connection.query("SELECT id FROM users WHERE email = ?", [adminEmail]);
    if ((adminRows as any[]).length === 0) {
      const passwordHash = await bcrypt.hash(adminPassword, 10);
      await connection.query(
        "INSERT INTO users (id, email, email_verified, name, role, status, password_hash) VALUES (?, ?, ?, ?, ?, ?, ?)",
        ["admin-id", adminEmail, new Date(), adminName, "ADMIN", "ACTIVE", passwordHash]
      );
      console.log(`Created default admin: ${adminEmail} / ${adminPassword}`);
    }

    // 3. Seeding settings singletons
    const [siteSettingsRows] = await connection.query("SELECT id FROM site_settings WHERE id = 'default'");
    if ((siteSettingsRows as any[]).length === 0) {
      await connection.query(
        "INSERT INTO site_settings (id, site_name, tagline, contact_email) VALUES ('default', 'Trade Learning Hub', 'Premium trading education', ?)",
        [adminEmail]
      );
    }

    const [paymentSettingsRows] = await connection.query("SELECT id FROM payment_settings WHERE id = 'default'");
    if ((paymentSettingsRows as any[]).length === 0) {
      await connection.query(
        "INSERT INTO payment_settings (id, enabled, upi_id, instructions) VALUES ('default', true, 'tradelearninghub@upi', ?)",
        ["Scan the QR with any UPI app. After paying, upload the screenshot and the transaction ID on the order page."]
      );
    }

    const [emailSettingsRows] = await connection.query("SELECT id FROM email_settings WHERE id = 'default'");
    if ((emailSettingsRows as any[]).length === 0) {
      await connection.query(
        "INSERT INTO email_settings (id, enabled, smtp_secure) VALUES ('default', false, true)"
      );
    }

    // 4. Seeding sample courses, modules, and lessons
    const [catRows] = await connection.query("SELECT id FROM categories WHERE slug = 'stock-market'");
    let categoryId = "cat-stock-market";
    if ((catRows as any[]).length === 0) {
      await connection.query(
        "INSERT INTO categories (id, name, slug, sort_order) VALUES (?, 'Stock Market', 'stock-market', 1)",
        [categoryId]
      );
    } else {
      categoryId = (catRows as any[])[0].id;
    }

    const [courseRows] = await connection.query("SELECT id FROM courses WHERE slug = 'stock-market-mastery'");
    let courseId = "course-smm";
    if ((courseRows as any[]).length === 0) {
      await connection.query(
        `INSERT INTO courses (id, title, slug, short_description, description, price_cents, currency, status, is_featured, category_id, seo_title, seo_description)
         VALUES (?, 'Stock Market Mastery', 'stock-market-mastery', 
                 'A structured path from market basics to working strategies.',
                 'Stock Market Mastery walks you through the fundamentals of equity markets, the core technical analysis toolkit, and a set of repeatable trading strategies — all delivered as bite-sized video lessons.',
                 499900, 'INR', 'PUBLISHED', true, ?, 'Stock Market Mastery — Trade Learning Hub',
                 'Learn the stock market from basics to advanced strategies with practitioner-led video lessons.')`,
        [courseId, categoryId]
      );

      const modulesData = [
        {
          id: "mod-1",
          title: "Module 1 — Basics",
          lessons: [
            { id: "les-1-1", title: "Lesson 1: What is a stock?", isPreview: true },
            { id: "les-1-2", title: "Lesson 2: How exchanges work", isPreview: false },
            { id: "les-1-3", title: "Lesson 3: Reading a quote", isPreview: false },
          ],
        },
        {
          id: "mod-2",
          title: "Module 2 — Technical Analysis",
          lessons: [
            { id: "les-2-1", title: "Lesson 1: Candlesticks", isPreview: false },
            { id: "les-2-2", title: "Lesson 2: Trend & support/resistance", isPreview: false },
            { id: "les-2-3", title: "Lesson 3: Indicators that actually matter", isPreview: false },
          ],
        },
        {
          id: "mod-3",
          title: "Module 3 — Trading Strategies",
          lessons: [
            { id: "les-3-1", title: "Lesson 1: Breakout playbook", isPreview: false },
            { id: "les-3-2", title: "Lesson 2: Pullback playbook", isPreview: false },
          ],
        },
      ];

      for (let i = 0; i < modulesData.length; i++) {
        const m = modulesData[i];
        await connection.query(
          "INSERT INTO modules (id, course_id, title, sort_order) VALUES (?, ?, ?, ?)",
          [m.id, courseId, m.title, i]
        );
        for (let j = 0; j < m.lessons.length; j++) {
          const l = m.lessons[j];
          await connection.query(
            `INSERT INTO lessons (id, module_id, title, description, video_url, duration_seconds, notes, sort_order, is_preview)
             VALUES (?, ?, ?, 'Lesson description placeholder.', 'https://drive.google.com/file/d/EXAMPLE/preview', 600, 'Notes content.', ?, ?)`,
            [l.id, m.id, l.title, j, l.isPreview]
          );
        }
      }
      console.log("Seeded default courses, modules, and lessons.");
    }

    // Seeding course-forex-basis
    const [forexBasisRows] = await connection.query("SELECT id FROM courses WHERE slug = 'forex-basis'");
    if ((forexBasisRows as any[]).length === 0) {
      await connection.query(
        `INSERT INTO courses (id, title, slug, short_description, description, price_cents, currency, status, is_featured, category_id, seo_title, seo_description, thumbnail_url)
         VALUES ('course-forex-basis', 'Forex Basis', 'forex-basis', 
                 'Learn the fundamentals of Forex trading, chart analysis, and risk management.',
                 'Learn the fundamentals of Forex trading, chart analysis, and risk management with practitioner-led video lessons.',
                 199900, 'INR', 'PUBLISHED', true, ?, 'Forex Basis — Trade Learning Hub',
                 'Learn the fundamentals of Forex trading.', '/images/forex-basis.png')`,
        [categoryId]
      );
      // Seed default module/lesson
      await connection.query(
        "INSERT INTO modules (id, course_id, title, sort_order) VALUES ('mod-fb-1', 'course-forex-basis', 'Module 1 — Forex Basics Introduction', 0)"
      );
      await connection.query(
        `INSERT INTO lessons (id, module_id, title, description, video_url, duration_seconds, notes, sort_order, is_preview)
         VALUES ('les-fb-1-1', 'mod-fb-1', 'Lesson 1: Introduction to Forex Market', 'Basics of Forex market.', 'https://drive.google.com/file/d/EXAMPLE/preview', 600, 'Notes.', 0, true)`
      );
      console.log("Seeded Forex Basis course.");
    }

    // Seeding course-forex-advance
    const [forexAdvanceRows] = await connection.query("SELECT id FROM courses WHERE slug = 'forex-advance'");
    if ((forexAdvanceRows as any[]).length === 0) {
      await connection.query(
        `INSERT INTO courses (id, title, slug, short_description, description, price_cents, currency, status, is_featured, category_id, seo_title, seo_description, thumbnail_url)
         VALUES ('course-forex-advance', 'Forex Advance', 'forex-advance', 
                 'Master advanced Forex trading strategies, smart money concepts, risk management.',
                 'Master advanced Forex trading strategies, smart money concepts, risk management with practitioner-led video lessons.',
                 219900, 'INR', 'PUBLISHED', true, ?, 'Forex Advance — Trade Learning Hub',
                 'Master advanced Forex trading.', '/images/forex-advance.png')`,
        [categoryId]
      );
      // Seed default module/lesson
      await connection.query(
        "INSERT INTO modules (id, course_id, title, sort_order) VALUES ('mod-fa-1', 'course-forex-advance', 'Module 1 — Advanced Forex Concepts', 0)"
      );
      await connection.query(
        `INSERT INTO lessons (id, module_id, title, description, video_url, duration_seconds, notes, sort_order, is_preview)
         VALUES ('les-fa-1-1', 'mod-fa-1', 'Lesson 1: Advanced Market Structure', 'Advanced structure of Forex market.', 'https://drive.google.com/file/d/EXAMPLE/preview', 600, 'Notes.', 0, true)`
      );
      console.log("Seeded Forex Advance course.");
    }

    // Seeding course-stock-market-basics
    const [stockBasicsRows] = await connection.query("SELECT id FROM courses WHERE slug = 'stock-market-basics-for-beginners'");
    if ((stockBasicsRows as any[]).length === 0) {
      await connection.query(
        `INSERT INTO courses (id, title, slug, short_description, description, price_cents, currency, status, is_featured, category_id, seo_title, seo_description, thumbnail_url)
         VALUES ('course-stock-basics', 'Stock Market Basics for Beginners', 'stock-market-basics-for-beginners', 
                 'Learn the fundamentals of the stock market, trading basics, chart analysis.',
                 'Learn the fundamentals of the stock market, trading basics, chart analysis with practitioner-led video lessons.',
                 199900, 'INR', 'PUBLISHED', true, ?, 'Stock Market Basics for Beginners — Trade Learning Hub',
                 'Learn the stock market basics.', '/images/stock-basics.png')`,
        [categoryId]
      );
      // Seed default module/lesson
      await connection.query(
        "INSERT INTO modules (id, course_id, title, sort_order) VALUES ('mod-sb-1', 'course-stock-basics', 'Module 1 — Stock Market Basics', 0)"
      );
      await connection.query(
        `INSERT INTO lessons (id, module_id, title, description, video_url, duration_seconds, notes, sort_order, is_preview)
         VALUES ('les-sb-1-1', 'mod-sb-1', 'Lesson 1: Introduction to Stock Market', 'Introduction to Stock Market.', 'https://drive.google.com/file/d/EXAMPLE/preview', 600, 'Notes.', 0, true)`
      );
      console.log("Seeded Stock Market Basics for Beginners course.");
    }

    // 5. Seeding Email templates
    const defaultBlocks = (title: string, body: string) =>
      JSON.stringify([
        { type: "header", logo: true },
        { type: "title", text: title },
        { type: "text", text: body },
        { type: "footer", text: "Trade Learning Hub" },
      ]);

    const templates = [
      { id: "tpl-1", event: "WELCOME", name: "Welcome", subject: "Welcome to {{siteName}}", title: "Welcome aboard", body: "Thanks for joining {{siteName}}. Start by exploring the catalogue." },
      { id: "tpl-2", event: "REGISTRATION", name: "Registration", subject: "Confirm your email", title: "Almost there", body: "Click the link to confirm your email." },
      { id: "tpl-3", event: "PAYMENT_RECEIVED", name: "Payment Received", subject: "Payment received — pending review", title: "We got your payment", body: "Your payment for {{courseTitle}} is under review." },
      { id: "tpl-4", event: "PAYMENT_APPROVED", name: "Payment Approved", subject: "Access granted: {{courseTitle}}", title: "You're in", body: "Your access to {{courseTitle}} is now active." },
      { id: "tpl-5", event: "PAYMENT_REJECTED", name: "Payment Rejected", subject: "Payment could not be verified", title: "We couldn't verify your payment", body: "Reason: {{reason}}" },
      { id: "tpl-6", event: "COURSE_ENROLLMENT", name: "Course Enrollment", subject: "Enrolled in {{courseTitle}}", title: "Enrollment confirmed", body: "You have been enrolled in {{courseTitle}}." },
      { id: "tpl-7", event: "PASSWORD_RESET", name: "Password Reset", subject: "Reset your password", title: "Password reset", body: "Click the link to reset your password." },
      { id: "tpl-8", event: "ACCOUNT_VERIFICATION", name: "Account Verification", subject: "Verify your account", title: "Verify your account", body: "Tap the link to verify." },
      { id: "tpl-9", event: "ADMIN_NOTIFICATION", name: "Admin Notification", subject: "New activity on {{siteName}}", title: "Heads up", body: "{{message}}" },
      { id: "tpl-10", event: "CUSTOM_BROADCAST", name: "Custom Broadcast", subject: "{{subject}}", title: "{{title}}", body: "{{body}}" },
    ];

    for (const t of templates) {
      const [tplRows] = await connection.query("SELECT id FROM email_templates WHERE event = ?", [t.event]);
      if ((tplRows as any[]).length === 0) {
        await connection.query(
          "INSERT INTO email_templates (id, event, name, subject, blocks_json, is_active) VALUES (?, ?, ?, ?, ?, true)",
          [t.id, t.event, t.name, t.subject, defaultBlocks(t.title, t.body)]
        );
      }
    }
    console.log("Seeded default email templates.");

    // 6. Seeding Homepage sections
    const sections = [
      { id: "sec-1", key: "hero", title: "Trade Learning Hub V2", data: { headline: "Learn to trade with structured, practitioner-led courses.", cta: "Browse courses" } },
      { id: "sec-2", key: "features", title: "Why us", data: { items: ["Structured curriculum", "Lifetime access", "Practitioner-led"] } },
      { id: "sec-3", key: "testimonials", title: "Testimonials", data: { items: [] } },
      { id: "sec-4", key: "faq", title: "FAQ", data: { items: [] } },
      { id: "sec-5", key: "cta", title: "Get started", data: { headline: "Pick a course and start today." } },
    ];

    for (let i = 0; i < sections.length; i++) {
      const s = sections[i];
      const [secRows] = await connection.query("SELECT id FROM homepage_sections WHERE \`key\` = ?", [s.key]);
      if ((secRows as any[]).length === 0) {
        await connection.query(
          "INSERT INTO homepage_sections (id, \`key\`, title, sort_order, data) VALUES (?, ?, ?, ?, ?)",
          [s.id, s.key, s.title, i, JSON.stringify(s.data)]
        );
      }
    }
    console.log("Seeded default homepage sections.");

    console.log("Database successfully initialized and seeded!");
  } catch (error) {
    console.error("Database initialization failed:", error);
    throw error;
  } finally {
    connection.release();
  }
}
// Only auto-run and exit process if executed directly via CLI
if (typeof require !== "undefined" && require.main === module) {
  initializeDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
} else if (process.argv[1] && (process.argv[1].endsWith("db-init.ts") || process.argv[1].endsWith("db-init.js"))) {
  initializeDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

