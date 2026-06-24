export const metadata = {
  title: "Terms of Service | Trade Learning Hub",
  description: "Read the rules and user conditions for accessing our trading education platform.",
};

export default function TermsOfServicePage() {
  return (
    <div className="container py-16 max-w-4xl prose prose-slate">
      <h1 className="text-3xl font-extrabold tracking-tight mb-4">Terms of Service</h1>
      <p className="text-sm text-muted-foreground mb-8">Last Updated: June 24, 2026</p>

      <p className="lead">
        Welcome to Trade Learning Hub. These Terms of Service govern your access to and use of our platform, including our courses, website, and dashboard tools. By creating an account or registering for a course, you agree to comply with these terms.
      </p>

      <h2 className="text-xl font-bold mt-8 mb-4">1. User Accounts and Verification</h2>
      <p>
        To access our courses, you must create a personal student account. You agree to:
      </p>
      <ul className="list-disc pl-6 space-y-1">
        <li>Provide accurate and complete registration details.</li>
        <li>Maintain your account security and verify your email address to activate your login.</li>
        <li>Notify us immediately of any unauthorized usage or breaches.</li>
      </ul>
      <p>
        Accounts that remain unverified or are flagged for suspicious login locations/device-sharing may be suspended or disabled by administrators.
      </p>

      <h2 className="text-xl font-bold mt-8 mb-4">2. Access License</h2>
      <p>
        Upon purchase of a course, we grant you a limited, non-exclusive, non-transferable personal license to view the course videos and access notes for your private, non-commercial education. You may not:
      </p>
      <ul className="list-disc pl-6 space-y-1">
        <li>Record, download, duplicate, distribute, or stream our videos externally.</li>
        <li>Share your login credentials or allow third parties to view course modules under your account.</li>
        <li>Resell or package our curriculum for commercial gain.</li>
      </ul>

      <h2 className="text-xl font-bold mt-8 mb-4">3. Fees and Payments</h2>
      <p>
        Prices are listed in INR (Rupees) on the course catalog. Verification of payments (e.g. UPI QR transfers) is handled manually by site administrators. Enrolling in courses with fraudulent payment proofs will result in permanent account banning and revocation of all previous course privileges.
      </p>

      <h2 className="text-xl font-bold mt-8 mb-4">4. Non-SEBI Regulator Disclaimer</h2>
      <p className="border-l-4 border-yellow-500 pl-4 py-2 bg-yellow-50/30 text-yellow-900 font-medium">
        Disclaimer: Trade Learning Hub is an individual course provider. We are NOT registered with the Securities and Exchange Board of India (SEBI) as investment advisors, brokers, or analysts. All trading content and analysis lessons are meant strictly for instructional purposes. Trading in stocks, futures, options, or foreign currency carries significant financial risk. We do not guarantee financial returns or provide advisory signals.
      </p>

      <h2 className="text-xl font-bold mt-8 mb-4">5. Account Termination</h2>
      <p>
        We reserve the right to suspend or terminate your account (including active enrollments) if you breach these terms, share passwords, engage in intellectual property violations, or submit duplicate fraudulent transactions.
      </p>

      <h2 className="text-xl font-bold mt-8 mb-4">6. Amendments to Terms</h2>
      <p>
        We may update these terms at our discretion. Continued use of the platform following updates constitutes full acceptance of the revised Terms of Service.
      </p>
    </div>
  );
}
