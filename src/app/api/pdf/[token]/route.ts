import { NextRequest, NextResponse } from "next/server";
import { verifySignedPdfToken } from "@/lib/pdf-security";
import { queryOne } from "@/lib/db";
import path from "path";
import fs from "fs/promises";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  // 1. Verify the signed token
  const payload = verifySignedPdfToken(token);
  if (!payload) {
    return new NextResponse("Access denied or link expired", { status: 403 });
  }

  // 2. Fetch the lesson to get the pdf_file_key
  const lesson = await queryOne(
    "SELECT pdf_file_key, content_type FROM lessons WHERE id = ?",
    [payload.lessonId]
  );

  if (!lesson || lesson.content_type !== "PDF" || !lesson.pdf_file_key) {
    return new NextResponse("PDF not found", { status: 404 });
  }

  // 3. Verify the user has enrollment access
  const enrollment = await queryOne(
    `SELECT e.id FROM enrollments e
     JOIN lessons l ON 1=1
     JOIN modules m ON l.module_id = m.id
     WHERE e.user_id = ? AND e.course_id = m.course_id AND e.status = 'ACTIVE' AND l.id = ?`,
    [payload.userId, payload.lessonId]
  );

  if (!enrollment) {
    return new NextResponse("Access denied", { status: 403 });
  }

  // 4. Read and stream the PDF from private storage
  const pdfPath = path.resolve(process.cwd(), "data", "pdf-lessons", lesson.pdf_file_key);

  try {
    const fileBuffer = await fs.readFile(pdfPath);

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "inline; filename=lesson.pdf",
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (err) {
    console.error("PDF file read error:", err);
    return new NextResponse("PDF file not found", { status: 404 });
  }
}
