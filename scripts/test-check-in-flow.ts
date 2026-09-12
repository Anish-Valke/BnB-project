import dotenv from "dotenv";
dotenv.config({ path: ".env" });
dotenv.config({ path: ".env.local" });
dotenv.config();

import { sendFast2SMSOtp, verifyFast2SMSOtp } from "../lib/fast2sms";
import { checkHospitalProximity } from "../lib/location";
import { validateAndTriageIntake } from "../lib/ai/intake-validator";

async function runTests() {
  console.log("=== 1. Testing Fast2SMS OTP Flow ===");
  const sendRes = await sendFast2SMSOtp("9876543210");
  console.log("Send OTP Result:", sendRes);

  const otpCode = sendRes.otpForTesting || "123456";
  const verifyRes = verifyFast2SMSOtp("9876543210", otpCode);
  console.log("Verify OTP Result:", verifyRes);

  console.log("\n=== 2. Testing Location Proximity Check ===");
  const locRes = checkHospitalProximity(19.0760, 72.8777, false);
  console.log("Location Check Result:", locRes);

  console.log("\n=== 3. Testing Gemini Intake Sanity Check (Valid Complaint) ===");
  const validIntake = await validateAndTriageIntake({
    patient_name: "Ramesh Kumar",
    phone: "9876543210",
    age: 42,
    chief_complaint: "High fever 102F and severe headache for past 2 days",
    doctor_id: "doc_general_medicine_104",
  });
  console.log("Valid Intake Gemini Result:", validIntake);

  console.log("\n=== 4. Testing Gemini Intake Sanity Check (Gibberish Data) ===");
  const gibberishIntake = await validateAndTriageIntake({
    patient_name: "asdfgh",
    phone: "9876543210",
    age: 250,
    chief_complaint: "asdfghjk 12345",
    doctor_id: "doc_general_medicine_104",
  });
  console.log("Gibberish Intake Gemini Result:", gibberishIntake);

  console.log("\n=== ALL TESTS COMPLETED SUCCESSFULLY ===");
}

runTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
