import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();

import { checkSafetyRules } from "../lib/ai/safety-rules";
import { getDeterministicFallback } from "../lib/ai/fallback";

function verifyAf007Integration() {
  console.log("🧪 Testing AF-007 API Integration with AF-005 & AF-006...");

  // Test Acute Keyword Override (AF-006)
  const acuteResult = checkSafetyRules("Severe chest pain and bleeding");
  console.log("Acute Complaint Output:", acuteResult);

  if (!acuteResult || acuteResult.triage_level !== "priority" || acuteResult.predicted_mins !== 20) {
    throw new Error("Failed acute keyword safety override test");
  }
  console.log("✅ Acute keyword override integrated successfully!");

  // Test Follow-up Keyword Override (AF-006)
  const expressResult = checkSafetyRules("Follow-up sugar check and report");
  console.log("Express Complaint Output:", expressResult);

  if (!expressResult || expressResult.triage_level !== "express" || expressResult.predicted_mins !== 5) {
    throw new Error("Failed express keyword safety override test");
  }
  console.log("✅ Express keyword override integrated successfully!");

  // Test Deterministic Fallback Matrix (AF-006)
  const fallbackResult = getDeterministicFallback("General fever and body ache");
  console.log("Fallback Output:", fallbackResult);

  if (fallbackResult.predicted_mins !== 8 || fallbackResult.triage_level !== "routine") {
    throw new Error("Failed fallback matrix test");
  }
  console.log("✅ Deterministic fallback matrix integrated successfully!");

  console.log("🎉 ALL AF-007 INTEGRATION TESTS PASSED CLEANLY!");
}

verifyAf007Integration();
