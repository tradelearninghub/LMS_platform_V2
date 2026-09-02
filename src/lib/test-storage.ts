import { saveUploadedFile, findUploadedFile, savePrivatePdf, findPdfFile, getStorageBaseDir } from "./storage";
import fs from "fs";

console.log("=== Testing Persistent Storage Manager ===");

async function runTests() {
  let passed = 0;
  let total = 0;

  function assert(condition: boolean, msg: string) {
    total++;
    if (condition) {
      console.log(`✅ [PASS] ${msg}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${msg}`);
    }
  }

  // 1. Check storage base dir
  const baseDir = getStorageBaseDir();
  console.log(`Resolved Storage Base Directory: ${baseDir}`);
  assert(Boolean(baseDir) && fs.existsSync(baseDir), "Storage base directory exists and is writable");

  // 2. Test saving and finding uploaded file
  const testFilename = `test-upload-${Date.now()}.txt`;
  const testBuffer = Buffer.from("Hello persistent storage!");
  const uploadResult = await saveUploadedFile(testFilename, testBuffer);

  assert(uploadResult.url === `/uploads/${testFilename}`, `Generated upload URL matches: ${uploadResult.url}`);

  const foundPath = await findUploadedFile(testFilename);
  assert(Boolean(foundPath) && fs.existsSync(foundPath!), `Uploaded file located at: ${foundPath}`);

  if (foundPath) {
    const content = fs.readFileSync(foundPath, "utf-8");
    assert(content === "Hello persistent storage!", "File content verified");
    // Clean up test file
    fs.unlinkSync(foundPath);
  }

  // 3. Test saving and finding private PDF
  const testPdfKey = `test-lesson-${Date.now()}.pdf`;
  const pdfBuffer = Buffer.from("%PDF-1.4 test dummy pdf content");
  const pdfResult = await savePrivatePdf(testPdfKey, pdfBuffer);

  assert(pdfResult.fileKey === testPdfKey, "PDF fileKey preserved");

  const foundPdfPath = await findPdfFile(testPdfKey);
  assert(Boolean(foundPdfPath) && fs.existsSync(foundPdfPath!), `Private PDF located at: ${foundPdfPath}`);

  if (foundPdfPath) {
    const pdfContent = fs.readFileSync(foundPdfPath, "utf-8");
    assert(pdfContent.startsWith("%PDF-1.4"), "PDF content verified");
    // Clean up test PDF
    fs.unlinkSync(foundPdfPath);
  }

  console.log(`\n=== Storage Tests Summary: ${passed}/${total} passed ===`);
  if (passed === total) {
    console.log("🎉 ALL STORAGE TESTS PASSED!");
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test error:", err);
  process.exit(1);
});
