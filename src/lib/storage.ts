import path from "path";
import fs from "fs";
import { promises as fsPromises } from "fs";

/**
 * Storage Manager for Trade Learning Hub LMS
 * Handles persistent file storage across Git deployments, PM2 restarts, and host rebuilds.
 *
 * Precedence for persistent storage:
 * 1. STORAGE_DIR or UPLOAD_DIR environment variable (if explicitly set)
 * 2. Sibling directory outside Git root: `path.resolve(process.cwd(), "..", "lms_storage")`
 *    (On Hostinger, process.cwd() is public_html / app dir; `../lms_storage` lives safely OUTSIDE Git)
 * 3. Local fallback directory: `path.resolve(process.cwd(), "data")`
 */

let resolvedStorageBase: string | null = null;

export function getStorageBaseDir(): string {
  if (resolvedStorageBase) return resolvedStorageBase;

  // 1. Explicit environment variable
  if (process.env.STORAGE_DIR) {
    const custom = path.resolve(process.env.STORAGE_DIR);
    try {
      fs.mkdirSync(custom, { recursive: true });
      resolvedStorageBase = custom;
      return resolvedStorageBase;
    } catch (e) {
      console.warn(`[Storage] Custom STORAGE_DIR (${custom}) not writable, trying next fallback:`, e);
    }
  }

  if (process.env.UPLOAD_DIR) {
    const custom = path.resolve(process.env.UPLOAD_DIR);
    try {
      fs.mkdirSync(custom, { recursive: true });
      resolvedStorageBase = custom;
      return resolvedStorageBase;
    } catch (e) {
      console.warn(`[Storage] Custom UPLOAD_DIR (${custom}) not writable, trying next fallback:`, e);
    }
  }

  // 2. Persistent sibling directory outside Git workspace: ../lms_storage
  try {
    const parentStorage = path.resolve(process.cwd(), "..", "lms_storage");
    fs.mkdirSync(parentStorage, { recursive: true });
    // Verify write permissions with a temporary probe
    const testFile = path.join(parentStorage, ".write_test");
    fs.writeFileSync(testFile, "ok");
    fs.unlinkSync(testFile);
    resolvedStorageBase = parentStorage;
    return resolvedStorageBase;
  } catch (e) {
    console.warn("[Storage] Sibling directory ../lms_storage not accessible, falling back to local ./data:", e);
  }

  // 3. Local fallback directory: ./data
  const localData = path.resolve(process.cwd(), "data");
  fs.mkdirSync(localData, { recursive: true });
  resolvedStorageBase = localData;
  return resolvedStorageBase;
}

/**
 * Returns all potential search directories for uploaded public assets (images, QR codes, receipts).
 */
export function getUploadCandidateDirs(): string[] {
  const base = getStorageBaseDir();
  const dirs = [
    path.join(base, "uploads"),
    path.resolve(process.cwd(), "..", "lms_storage", "uploads"),
    path.resolve(process.cwd(), "data", "uploads"),
    path.resolve(process.cwd(), "public", "uploads"),
  ];

  if (process.env.UPLOAD_DIR) {
    dirs.unshift(path.resolve(process.env.UPLOAD_DIR));
  }

  // Filter unique paths that exist or can be created
  const unique = Array.from(new Set(dirs.filter(Boolean) as string[]));
  return unique;
}

/**
 * Returns all potential search directories for private uploaded PDF lesson files.
 */
export function getPdfCandidateDirs(): string[] {
  const base = getStorageBaseDir();
  const dirs = [
    path.join(base, "pdf-lessons"),
    path.resolve(process.cwd(), "..", "lms_storage", "pdf-lessons"),
    path.resolve(process.cwd(), "data", "pdf-lessons"),
  ];

  if (process.env.STORAGE_DIR) {
    dirs.unshift(path.join(path.resolve(process.env.STORAGE_DIR), "pdf-lessons"));
  }

  const unique = Array.from(new Set(dirs.filter(Boolean) as string[]));
  return unique;
}

/**
 * Returns the primary writable directory for uploaded public assets.
 */
export async function getPrimaryUploadsDir(): Promise<string> {
  const base = getStorageBaseDir();
  const primary = path.join(base, "uploads");
  await fsPromises.mkdir(primary, { recursive: true });
  return primary;
}

/**
 * Returns the primary writable directory for private lesson PDF files.
 */
export async function getPrimaryPdfDir(): Promise<string> {
  const base = getStorageBaseDir();
  const primary = path.join(base, "pdf-lessons");
  await fsPromises.mkdir(primary, { recursive: true });
  return primary;
}

/**
 * Saves a file buffer across persistent storage and local fallback locations.
 */
export async function saveUploadedFile(filename: string, buffer: Buffer): Promise<{ filename: string; url: string }> {
  // 1. Write to primary persistent storage directory
  const primaryDir = await getPrimaryUploadsDir();
  await fsPromises.writeFile(path.join(primaryDir, filename), buffer);

  // 2. Also write to secondary fallback locations (public/uploads, data/uploads)
  const secondaryDirs = [
    path.resolve(process.cwd(), "public", "uploads"),
    path.resolve(process.cwd(), "data", "uploads"),
  ];

  for (const dir of secondaryDirs) {
    try {
      if (dir !== primaryDir) {
        await fsPromises.mkdir(dir, { recursive: true });
        await fsPromises.writeFile(path.join(dir, filename), buffer);
      }
    } catch (err) {
      // Non-fatal, primary is already written
      console.warn(`[Storage] Secondary upload write warning for ${dir}:`, err);
    }
  }

  return {
    filename,
    url: `/uploads/${filename}`,
  };
}

/**
 * Saves a private PDF file buffer across persistent PDF storage locations.
 */
export async function savePrivatePdf(fileKey: string, buffer: Buffer): Promise<{ fileKey: string; filePath: string }> {
  const primaryDir = await getPrimaryPdfDir();
  const primaryPath = path.join(primaryDir, fileKey);
  await fsPromises.writeFile(primaryPath, buffer);

  // Mirror to local data/pdf-lessons as well if different
  const localPdfDir = path.resolve(process.cwd(), "data", "pdf-lessons");
  if (localPdfDir !== primaryDir) {
    try {
      await fsPromises.mkdir(localPdfDir, { recursive: true });
      await fsPromises.writeFile(path.join(localPdfDir, fileKey), buffer);
    } catch (err) {
      console.warn("[Storage] Local PDF mirror write warning:", err);
    }
  }

  return {
    fileKey,
    filePath: primaryPath,
  };
}

/**
 * Finds an uploaded file by path across candidate storage directories.
 */
export async function findUploadedFile(relativePath: string): Promise<string | null> {
  const safePath = relativePath.replace(/\.\./g, "");
  const candidateDirs = getUploadCandidateDirs();

  for (const dir of candidateDirs) {
    const fullPath = path.join(dir, safePath);
    if (fs.existsSync(fullPath)) {
      return fullPath;
    }
  }

  return null;
}

/**
 * Finds a private PDF file by fileKey across candidate storage directories.
 */
export async function findPdfFile(fileKey: string): Promise<string | null> {
  const safeKey = path.basename(fileKey);
  const candidateDirs = getPdfCandidateDirs();

  for (const dir of candidateDirs) {
    const fullPath = path.join(dir, safeKey);
    if (fs.existsSync(fullPath)) {
      return fullPath;
    }
  }

  return null;
}
