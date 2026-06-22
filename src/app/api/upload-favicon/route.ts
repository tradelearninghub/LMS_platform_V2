import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import path from "path";
import fs from "fs/promises";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type (ico or png)
    const allowedTypes = ["image/x-icon", "image/vnd.microsoft.icon", "image/png"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Only .ico or .png images are allowed for favicons" },
        { status: 400 }
      );
    }

    // Validate file size (max 1MB)
    if (file.size > 1 * 1024 * 1024) {
      return NextResponse.json({ error: "Favicon must be under 1MB" }, { status: 400 });
    }

    // Save to public/favicon.ico
    const publicDir = path.join(process.cwd(), "src", "app"); // Next.js App Router usually reads from app/favicon.ico or public/favicon.ico
    const filePath = path.join(process.cwd(), "public", "favicon.ico");
    
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(filePath, buffer);

    const url = `/favicon.ico?t=${Date.now()}`;
    return NextResponse.json({ url });
  } catch (error) {
    console.error("Favicon Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
