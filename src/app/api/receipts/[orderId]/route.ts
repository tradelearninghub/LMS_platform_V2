import PDFDocument from "pdfkit";
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

  // Create PDF
  const doc = new PDFDocument({ margin: 50 });
  const chunks: Buffer[] = [];

  doc.on("data", (chunk) => chunks.push(chunk));

  // Build PDF layout
  doc.fontSize(20).font("Helvetica-Bold").text("RECEIPT / INVOICE", { align: "right" });
  doc.moveDown();

  doc.fontSize(12).font("Helvetica-Bold").text("Trade Learning Hub");
  doc.font("Helvetica").text("Email: support@tradelearninghub.in");
  doc.text("Web: www.tradelearninghub.in");
  doc.moveDown();

  // Invoice Meta Info
  doc.fontSize(10);
  doc.text(`Invoice Number: ${order.order_number}`, { align: "right" });
  doc.text(`Date: ${formatDate(order.created_at)}`, { align: "right" });
  doc.text(`Payment Method: Manual Transfer / UPI`, { align: "right" });
  doc.moveDown(2);

  // Bill To
  doc.fontSize(12).font("Helvetica-Bold").text("Bill To:");
  doc.font("Helvetica").fontSize(10);
  doc.text(`Name: ${order.payer_name || order.user_name || "N/A"}`);
  doc.text(`Email: ${order.user_email}`);
  doc.text(`Mobile: ${order.payer_mobile || "N/A"}`);
  doc.moveDown(2);

  // Table header
  const tableTop = 280;
  doc.font("Helvetica-Bold").text("Item Description", 50, tableTop);
  doc.text("Amount", 450, tableTop, { width: 100, align: "right" });

  doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

  // Table item
  const itemY = tableTop + 25;
  doc.font("Helvetica").text(order.course_title, 50, itemY);
  doc.text(formatCurrency(order.amount_cents, order.currency), 450, itemY, { width: 100, align: "right" });

  doc.moveTo(50, itemY + 20).lineTo(550, itemY + 20).stroke();

  // Table total
  const totalY = itemY + 35;
  doc.font("Helvetica-Bold").text("Total Paid", 350, totalY);
  doc.text(formatCurrency(order.amount_cents, order.currency), 450, totalY, { width: 100, align: "right" });

  doc.moveDown(4);
  doc.font("Helvetica-Oblique").text("This is a system generated invoice confirming your payment.", 50, doc.y + 40, { align: "center" });

  doc.end();

  // Return as Stream
  const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", (err) => reject(err));
  });

  return new NextResponse(pdfBuffer as any, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=receipt-${order.order_number}.pdf`,
    },
  });
}
