import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import path from "path";
import fs from "fs/promises";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type (images only)
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Only PNG, JPEG, WebP, and GIF images are allowed" },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File must be under 5MB" }, { status: 400 });
    }

    // Generate unique filename
    const ext = path.extname(file.name) || ".png";
    const randomHex = crypto.randomBytes(4).toString("hex");
    const filename = `upload-${Date.now()}-${randomHex}${ext}`;

    // Save to public/uploads directory
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadsDir, { recursive: true });

    const buffer = Buffer.from(await file.arrayBuffer());
    const filePath = path.join(uploadsDir, filename);
    await fs.writeFile(filePath, buffer);

    const url = `/uploads/${filename}`;
    return NextResponse.json({ url });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
