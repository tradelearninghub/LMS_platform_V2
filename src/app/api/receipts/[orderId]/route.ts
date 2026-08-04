import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { queryOne } from "@/lib/db";
import { formatCurrency, formatDate } from "@/lib/utils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { orderId } = await params;

  // Fetch order details
  const order = await queryOne(
    `SELECT o.*, c.title AS course_title, u.name AS user_name, u.email AS user_email
     FROM orders o
     JOIN courses c ON o.course_id = c.id
     JOIN users u ON o.user_id = u.id
     WHERE o.id = ? AND o.status = 'APPROVED'`,
    [orderId]
  );

  if (!order) {
    return new NextResponse("Order not found or not approved", { status: 404 });
  }

  // Authorize check: user must own order or be admin
  if (order.user_id !== session.user.id && session.user.role !== "ADMIN") {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const originalAmount = order.amount_cents || order.final_amount_cents;
  const finalAmount = order.final_amount_cents || order.amount_cents;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Receipt #${order.order_number} — Trade Learning Hub</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #1f2937;
      background-color: #f9fafb;
      padding: 40px 20px;
    }
    .invoice-card {
      max-width: 680px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 16px;
      border: 1px solid #e5e7eb;
      box-shadow: 0 4px 20px rgba(0,0,0,0.05);
      padding: 40px;
    }
    .header-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #f3f4f6;
      padding-bottom: 24px;
      margin-bottom: 24px;
    }
    .brand-title { font-size: 22px; font-weight: 800; color: #0f172a; }
    .brand-sub { font-size: 12px; color: #64748b; margin-top: 4px; }
    .badge-paid {
      display: inline-block;
      background-color: #dcfce7;
      color: #166534;
      font-size: 11px;
      font-weight: 800;
      padding: 4px 12px;
      border-radius: 9999px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .meta-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 24px;
      margin-bottom: 32px;
    }
    .meta-block h4 { font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; }
    .meta-block p { font-size: 14px; font-weight: 500; color: #334155; line-height: 1.5; }
    .table-container { margin-bottom: 32px; }
    table { width: 100%; border-collapse: collapse; text-align: left; }
    th { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; padding: 12px 16px; background-color: #f8fafc; border-bottom: 1px solid #e2e8f0; }
    td { font-size: 14px; color: #1e293b; padding: 16px; border-bottom: 1px solid #f1f5f9; }
    .text-right { text-align: right; }
    .total-row td { font-weight: 700; font-size: 16px; color: #0f172a; border-bottom: none; border-top: 2px solid #e2e8f0; padding-top: 20px; }
    .footer-note {
      text-align: center;
      font-size: 12px;
      color: #94a3b8;
      border-top: 1px solid #f1f5f9;
      padding-top: 24px;
      margin-top: 16px;
    }
    .actions-bar {
      max-width: 680px;
      margin: 20px auto 0 auto;
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 20px;
      font-size: 13px;
      font-weight: 600;
      border-radius: 8px;
      cursor: pointer;
      border: 1px solid #cbd5e1;
      background: #ffffff;
      color: #334155;
      text-decoration: none;
    }
    .btn-primary { background: #0f172a; color: #ffffff; border-color: #0f172a; }
    .btn:hover { opacity: 0.9; }

    @media print {
      body { background: #ffffff; padding: 0; }
      .invoice-card { border: none; box-shadow: none; padding: 20px 0; }
      .actions-bar { display: none; }
    }
  </style>
</head>
<body>
  <div class="actions-bar">
    <button onclick="window.print()" class="btn btn-primary">
      🖨️ Print / Save PDF
    </button>
  </div>

  <div class="invoice-card">
    <div class="header-row">
      <div>
        <div class="brand-title">Trade Learning Hub</div>
        <div class="brand-sub">Official Payment Receipt & Course Invoice</div>
      </div>
      <div>
        <span class="badge-paid">✓ PAID</span>
      </div>
    </div>

    <div class="meta-grid">
      <div class="meta-block">
        <h4>Billed To</h4>
        <p><strong>${order.payer_name || order.user_name || "Student"}</strong></p>
        <p>${order.user_email}</p>
        ${order.payer_mobile ? `<p>Mobile: ${order.payer_mobile}</p>` : ""}
      </div>
      <div class="meta-block">
        <h4>Order Meta</h4>
        <p><strong>Order #:</strong> ${order.order_number}</p>
        <p><strong>Date:</strong> ${formatDate(order.created_at)}</p>
        <p><strong>Payment Method:</strong> UPI / Direct Bank Transfer</p>
        ${order.transaction_id ? `<p><strong>Ref UTR:</strong> ${order.transaction_id}</p>` : ""}
      </div>
    </div>

    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>Course Description</th>
            <th class="text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <strong>${order.course_title}</strong><br />
              <span style="font-size: 12px; color: #64748b;">Lifetime Access • Practitioner-led Curriculum</span>
            </td>
            <td class="text-right">
              ${formatCurrency(originalAmount, order.currency)}
            </td>
          </tr>
          ${order.applied_code && order.discount_cents > 0 ? `
          <tr>
            <td style="color: #166534;">
              Discount Applied (${order.applied_code})
            </td>
            <td class="text-right" style="color: #166534;">
              -${formatCurrency(order.discount_cents, order.currency)}
            </td>
          </tr>
          ` : ""}
          <tr class="total-row">
            <td>Total Amount Paid</td>
            <td class="text-right">${formatCurrency(finalAmount, order.currency)}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="footer-note">
      This is a computer-generated tax receipt confirming successful course registration at Trade Learning Hub.<br />
      If you have questions, please reach out at support@tradelearninghub.in
    </div>
  </div>

  <script>
    // Auto-trigger browser print / save to PDF dialog on page load
    window.addEventListener('load', () => {
      setTimeout(() => {
        window.print();
      }, 300);
    });
  </script>
</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  });
}

