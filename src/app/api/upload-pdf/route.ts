import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import crypto from "crypto";
import { savePrivatePdf } from "@/lib/storage";

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

    // Generate a unique filename
    const ext = ".pdf";
    const fileKey = `${crypto.randomUUID()}${ext}`;

    // Write file to persistent private storage
    const buffer = Buffer.from(await file.arrayBuffer());
    await savePrivatePdf(fileKey, buffer);

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
