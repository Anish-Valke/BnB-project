import dotenv from "dotenv";
dotenv.config();

import { sendFast2SMSOtp, verifyFast2SMSOtp } from "../lib/fast2sms";

async function testSafety() {
  console.log("=== Fast2SMS Production Safety Verification ===");

  // 1. Verify Master Code Behavior with FAST2SMS_DEMO_MODE=false
  process.env.FAST2SMS_DEMO_MODE = "false";
  console.log("\n[Test 1] Master OTP '123456' when FAST2SMS_DEMO_MODE=false:");
  const resMasterFalse = verifyFast2SMSOtp("9999999999", "123456");
  console.log("  Valid:", resMasterFalse.valid, "| Message:", resMasterFalse.message);
  if (!resMasterFalse.valid) {
    console.log("  ✅ PASS: Master OTP is BLOCKED in production mode.");
  } else {
    console.log("  ❌ FAIL: Master OTP was accepted in production mode!");
  }

  // 2. Verify Master Code Behavior with FAST2SMS_DEMO_MODE=true
  process.env.FAST2SMS_DEMO_MODE = "true";
  console.log("\n[Test 2] Master OTP '123456' when FAST2SMS_DEMO_MODE=true:");
  const resMasterTrue = verifyFast2SMSOtp("9999999999", "123456");
  console.log("  Valid:", resMasterTrue.valid, "| Message:", resMasterTrue.message);
  if (resMasterTrue.valid) {
    console.log("  ✅ PASS: Master OTP is ALLOWED in demo mode.");
  } else {
    console.log("  ❌ FAIL: Master OTP was rejected in demo mode!");
  }

  // Restore env settings
  process.env.FAST2SMS_DEMO_MODE = "false";

  // 3. Test Real SMS Flow Intact
  console.log("\n[Test 3] Real Fast2SMS Delivery test when FAST2SMS_DEMO_MODE=false:");
  const sendRes = await sendFast2SMSOtp("8010530980");
  console.log("  Success:", sendRes.success, "| IsDemo:", sendRes.isDemo, "| Message:", sendRes.message);
  if (sendRes.success && !sendRes.isDemo) {
    console.log("  ✅ PASS: Real SMS successfully dispatched via Fast2SMS!");
  } else {
    console.log("  ❌ FAIL: Real SMS dispatch failed!");
  }
}

testSafety().catch(console.error);
