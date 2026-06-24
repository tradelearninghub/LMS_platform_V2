export const metadata = {
  title: "Privacy Policy | Trade Learning Hub",
  description: "Learn how we handle your personal data and privacy settings.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="container py-16 max-w-4xl prose prose-slate">
      <h1 className="text-3xl font-extrabold tracking-tight mb-4">Privacy Policy</h1>
      <p className="text-sm text-muted-foreground mb-8">Last Updated: June 24, 2026</p>

      <p className="lead">
        At Trade Learning Hub, we respect your privacy and are committed to protecting the personal data you share with us. This Privacy Policy explains how we collect, use, and secure your information when you use our website and learning services.
      </p>

      <h2 className="text-xl font-bold mt-8 mb-4">1. Information We Collect</h2>
      <p>
        We collect information that you provide directly to us when registering an account, purchasing courses, or contacting support. This includes:
      </p>
      <ul className="list-disc pl-6 space-y-1">
        <li><strong>Personal Details:</strong> Name, email address, password, mobile number, and student profile preferences.</li>
        <li><strong>Transaction Evidence:</strong> Bank transfer reference numbers, transaction/UTR IDs, and uploaded payment screenshots.</li>
        <li><strong>Usage Activity:</strong> Lesson progression status, quiz attempts, and support log logs.</li>
      </ul>

      <h2 className="text-xl font-bold mt-8 mb-4">2. How We Use Your Information</h2>
      <p>We use the collected information for the following business purposes:</p>
      <ul className="list-disc pl-6 space-y-1">
        <li>To manage student accounts, process enrollment requests, and verify custom bank payments.</li>
        <li>To send course enrollment updates, password reset links, and critical platform notifications.</li>
        <li>To provide customer support and troubleshoot application issues.</li>
        <li>To optimize user experience and platform responsiveness.</li>
      </ul>

      <h2 className="text-xl font-bold mt-8 mb-4">3. Cookies and Tracking</h2>
      <p>
        We use cookies and similar session management mechanisms to maintain user authentication states, remember preferences, and analyze visitor patterns. You can instruct your browser to refuse all cookies, but doing so may prevent you from logging in or fully accessing your purchased courses.
      </p>

      <h2 className="text-xl font-bold mt-8 mb-4">4. Data Sharing and Security</h2>
      <p>
        We do not sell, trade, or rent student personal data to third parties. We employ industrial-grade physical, electronic, and managerial security protocols (such as bcrypt password hashes and secure database pool connection limits) to safeguard your information from unauthorized access, modification, or exposure.
      </p>

      <h2 className="text-xl font-bold mt-8 mb-4">5. Your Legal Rights</h2>
      <p>
        Depending on your location, you have the right to request access to, correction of, or deletion of your personal records. For any such queries or requests, please contact us at our support coordinates.
      </p>

      <h2 className="text-xl font-bold mt-8 mb-4">6. Contact Coordinate</h2>
      <p>
        If you have any questions or clarifications regarding this Privacy Policy, please reach out to us at our main contact email address.
      </p>
    </div>
  );
}
