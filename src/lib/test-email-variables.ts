import { replaceTemplateVariables, TEMPLATE_VARIABLES_REGISTRY, getAvailableVariablesForEvent } from "./email-variables";
import { compileTemplate } from "./email";

console.log("=== Testing Email Template Variable Replacement Engine ===");

let totalTests = 0;
let passedTests = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  totalTests++;
  if (condition) {
    console.log(`✅ [PASS] ${testName}`);
    passedTests++;
  } else {
    console.error(`❌ [FAIL] ${testName}`, detail || "");
  }
}

// 1. Test every registered event type
for (const [event, meta] of Object.entries(TEMPLATE_VARIABLES_REGISTRY)) {
  const sampleVars: Record<string, string> = {
    site_name: "Trade Learning Hub",
    siteName: "Trade Learning Hub",
  };
  
  for (const v of meta.variables) {
    const cleanKey = v.tag.replace(/[{}]/g, "");
    sampleVars[cleanKey] = v.example;
  }

  // Construct text containing all tags
  const textWithTags = meta.variables.map(v => `${v.tag}`).join(" | ");
  const replaced = replaceTemplateVariables(textWithTags, event, sampleVars);

  const hasUnreplacedTags = /\{\{\s*[a-zA-Z0-9_]+\s*\}\}/.test(replaced);
  assert(!hasUnreplacedTags, `All registered tags replaced for event: ${event}`, `Result: ${replaced}`);

  // Test aliases
  for (const v of meta.variables) {
    for (const alias of v.aliases) {
      const aliasTag = `{{${alias}}}`;
      const aliasReplaced = replaceTemplateVariables(aliasTag, event, sampleVars);
      assert(
        aliasReplaced === v.example || aliasReplaced === "Trade Learning Hub",
        `Alias tag '${aliasTag}' correctly replaced for ${event} with '${aliasReplaced}'`
      );
    }
  }
}

// 2. Test unknown / invalid tag retention (Requirement e)
const textWithInvalidTag = "Hello {{user_name}}, your code is {{unknown_custom_tag}}!";
const resultInvalid = replaceTemplateVariables(textWithInvalidTag, "WELCOME", { user_name: "John Doe" });
assert(
  resultInvalid === "Hello John Doe, your code is {{unknown_custom_tag}}!",
  "Unmatched tags are preserved as literal text per requirement (e)",
  `Got: ${resultInvalid}`
);

// 3. Test compileTemplate with visual layout blocks
const blocksJson = JSON.stringify([
  { type: "header", logo: true },
  { type: "title", text: "Welcome {{user_name}} to {{site_name}}!" },
  { type: "text", text: "Your purchase of {{course_name}} for {{amount}} was approved on {{order_date}}.\nOrder Number: {{order_number}}\nUTR: {{transaction_id}}" },
  { type: "button", text: "Access {{course_name}}", url: "{{course_url}}" },
  { type: "footer", text: "© {{site_name}} Support" }
]);

const compiledHtml = compileTemplate(blocksJson, {
  user_name: "Alok Sharma",
  course_name: "Forex Basis",
  amount: "₹1,999.00",
  order_number: "ORD-20260831-01",
  transaction_id: "UTR1234567890",
  order_date: "31 Aug 2026",
  course_url: "http://tradelearninghub.com/learn/forex-basis",
  site_name: "Trade Learning Hub",
}, "PAYMENT_APPROVED");

assert(compiledHtml.includes("Welcome Alok Sharma to Trade Learning Hub!"), "Title block rendered correctly");
assert(compiledHtml.includes("Forex Basis for ₹1,999.00 was approved on 31 Aug 2026"), "Text block rendered correctly");
assert(compiledHtml.includes("ORD-20260831-01"), "Order number rendered");
assert(compiledHtml.includes("UTR1234567890"), "Transaction ID rendered");
assert(compiledHtml.includes('href="http://tradelearninghub.com/learn/forex-basis"'), "Button URL replaced correctly");
assert(compiledHtml.includes("Access Forex Basis"), "Button text replaced correctly");
assert(!/\{\{\s*[a-zA-Z0-9_]+\s*\}\}/.test(compiledHtml), "No literal placeholder braces remaining in compiled HTML");

console.log(`\n=== Summary: ${passedTests}/${totalTests} tests passed ===`);
if (passedTests === totalTests) {
  console.log("🎉 ALL TESTS PASSED!");
  process.exit(0);
} else {
  process.exit(1);
}
