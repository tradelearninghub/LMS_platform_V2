export const metadata = {
  title: "Refund Policy | Trade Learning Hub",
  description: "Read our rules regarding course refunds and purchase cancellations.",
};

export default function RefundPolicyPage() {
  return (
    <div className="container py-16 max-w-4xl prose prose-slate">
      <h1 className="text-3xl font-extrabold tracking-tight mb-4">Refund & Cancellation Policy</h1>
      <p className="text-sm text-muted-foreground mb-8">Last Updated: June 24, 2026</p>

      <p className="lead">
        Thank you for purchasing our digital learning programs at Trade Learning Hub. We strive to provide premium-quality educational courses on trading and finance. Please review our refund policy before making any purchase.
      </p>

      <h2 className="text-xl font-bold mt-8 mb-4">1. Digital Nature of Services</h2>
      <p>
        All courses offered on our platform are digital products. Upon confirmation of payment (either through automatic checkouts or manual bank transfer reviews), instant and lifetime access is granted to the video lessons, notes, and learning resources.
      </p>

      <h2 className="text-xl font-bold mt-8 mb-4">2. Non-Refundable Purchases</h2>
      <p>
        Due to the immediate consumption nature of digital content and downloadable materials:
      </p>
      <ul className="list-disc pl-6 space-y-2">
        <li><strong>All sales are final.</strong> We do not offer cash refunds, exchanges, or store credits once an enrollment has been activated.</li>
        <li>We do not offer refunds if a student changes their mind, finds the content too basic/advanced, or experiences personal financial changes.</li>
      </ul>

      <h2 className="text-xl font-bold mt-8 mb-4">3. Payment Review and Rejection</h2>
      <p>
        When you check out using our manual QR Code / UPI transfer options:
      </p>
      <ul className="list-disc pl-6 space-y-2">
        <li>Your order remains in a <code>PENDING</code> state until the admin checks the reference number and matches the screenshot with our bank accounts.</li>
        <li>If the payment proof is invalid, forged, or the transfer was not received, the admin will reject the order. In such cases, no enrollment is created.</li>
        <li>If you believe your payment was rejected in error, please contact us with your original bank transaction slip/UTR.</li>
      </ul>

      <h2 className="text-xl font-bold mt-8 mb-4">4. Duplicate Transactions</h2>
      <p>
        If you make a duplicate payment for the same course due to a technical failure or gateway delay, please notify us immediately with screenshots of both successful transactions. Upon verification, the duplicate transfer will be refunded back to the source bank account within 5 to 7 business days.
      </p>

      <h2 className="text-xl font-bold mt-8 mb-4">5. Support Contact</h2>
      <p>
        For payment issues, transaction verification delays, or duplicate billing enquiries, please contact us at our official contact address.
      </p>
    </div>
  );
}
