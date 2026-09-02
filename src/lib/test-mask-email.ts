import { maskEmail } from "../app/(auth)/actions";

console.log("=== Testing Mask Email Pattern Engine ===");

let passed = 0;
let total = 0;

function assertEqual(actual: string, expected: string, label: string) {
  total++;
  if (actual === expected) {
    console.log(`✅ [PASS] ${label} -> '${actual}'`);
    passed++;
  } else {
    console.error(`❌ [FAIL] ${label} -> Expected '${expected}', got '${actual}'`);
  }
}

// 1. Test user example: "512834o5@gmail.com" -> "5**8**o*@gmail.com"
assertEqual(maskEmail("512834o5@gmail.com"), "5**8**o*@gmail.com", "8-character local part");

// 2. Test length 1
assertEqual(maskEmail("a@domain.com"), "a@domain.com", "1-character local part");

// 3. Test length 2
assertEqual(maskEmail("ab@domain.com"), "a*@domain.com", "2-character local part");

// 4. Test length 3
assertEqual(maskEmail("abc@domain.com"), "a**@domain.com", "3-character local part");

// 5. Test length 4
assertEqual(maskEmail("abcd@domain.com"), "a**d@domain.com", "4-character local part");

// 6. Test length 5
assertEqual(maskEmail("abcde@domain.com"), "a**d*@domain.com", "5-character local part");

// 7. Test length 6
assertEqual(maskEmail("abcdef@domain.com"), "a**d**@domain.com", "6-character local part");

// 8. Test length 7
assertEqual(maskEmail("abcdefg@domain.com"), "a**d**g@domain.com", "7-character local part");

// 9. Verify exact length preservation
const sampleEmails = [
  "aloksharma@gmail.com",
  "supertrader100@tradelearninghub.com",
  "contact.us.now@example.co.in",
];

for (const email of sampleEmails) {
  const masked = maskEmail(email);
  total++;
  if (masked.length === email.length) {
    console.log(`✅ [PASS] Exact length preserved for '${email}' (${email.length} === ${masked.length}) -> '${masked}'`);
    passed++;
  } else {
    console.error(`❌ [FAIL] Length mismatch for '${email}': ${masked.length} vs ${email.length}`);
  }
}

console.log(`\n=== Summary: ${passed}/${total} tests passed ===`);
if (passed === total) {
  console.log("🎉 ALL MASK EMAIL TESTS PASSED!");
  process.exit(0);
} else {
  process.exit(1);
}
