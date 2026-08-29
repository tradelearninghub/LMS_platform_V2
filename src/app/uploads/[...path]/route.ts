import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { promises as fsPromises } from "fs";

const MIME_TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".pdf": "application/pdf",
};

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path: pathSegments } = await context.params;

  if (!pathSegments || pathSegments.length === 0) {
    return new NextResponse("Not Found", { status: 404 });
  }

  // Prevent directory traversal attacks
  const safePath = pathSegments.join("/").replace(/\.\./g, "");
  const ext = path.extname(safePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || "application/octet-stream";

  // Check possible storage locations:
  // 1. UPLOAD_DIR env if configured (persistent mount / custom directory)
  // 2. public/uploads (standard)
  // 3. data/uploads (persistent data folder)
  const candidateDirs = [
    process.env.UPLOAD_DIR ? path.resolve(process.env.UPLOAD_DIR) : null,
    path.resolve(process.cwd(), "public", "uploads"),
    path.resolve(process.cwd(), "data", "uploads"),
  ].filter(Boolean) as string[];

  for (const dir of candidateDirs) {
    const fullPath = path.join(dir, safePath);
    if (fs.existsSync(fullPath)) {
      try {
        const fileBuffer = await fsPromises.readFile(fullPath);
        return new NextResponse(fileBuffer, {
          headers: {
            "Content-Type": contentType,
            "Cache-Control": "public, max-age=31536000, immutable",
            "Content-Length": fileBuffer.length.toString(),
          },
        });
      } catch (err) {
        console.error("Error reading file:", err);
      }
    }
  }

  return new NextResponse("File Not Found", { status: 404 });
}
