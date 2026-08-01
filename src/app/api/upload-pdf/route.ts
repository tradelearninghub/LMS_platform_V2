import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import path from "path";
import fs from "fs/promises";
import crypto from "crypto";

const PDF_DIR = path.resolve(process.cwd(), "data", "pdf-lessons");

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file || file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "A valid PDF file is required" },
        { status: 400 }
      );
    }

    // Ensure storage directory exists
    await fs.mkdir(PDF_DIR, { recursive: true });

    // Generate a unique filename
    const ext = ".pdf";
    const fileKey = `${crypto.randomUUID()}${ext}`;
    const filePath = path.join(PDF_DIR, fileKey);

    // Write file to private storage
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(filePath, buffer);

    return NextResponse.json({
      success: true,
      fileKey,
      fileName: file.name,
      fileSize: file.size,
    });
  } catch (error) {
    console.error("PDF upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload PDF" },
      { status: 500 }
    );
  }
}
