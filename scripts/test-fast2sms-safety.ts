import dotenv from "dotenv";
dotenv.config();

import { sendFast2SMSOtp, verifyFast2SMSOtp } from "../lib/fast2sms";

async function testDemoAndRealModes() {
  console.log("=== Fast2SMS Demo Mode & Real Mode Verification ===");

  // -------------------------------------------------------------
  // Test 1: DEMO MODE ENABLED (FAST2SMS_DEMO_MODE=true)
  // -------------------------------------------------------------
  process.env.FAST2SMS_DEMO_MODE = "true";
  console.log("\n[Test 1] Demo Mode ENABLED (FAST2SMS_DEMO_MODE=true):");

  const demoSendRes = await sendFast2SMSOtp("9998887771");
  console.log("  sendFast2SMSOtp Result:", JSON.stringify(demoSendRes));

  if (demoSendRes.success && demoSendRes.isDemo && demoSendRes.otpForTesting === "123456") {
    console.log("  ✅ PASS: Fast2SMS API call skipped. Demo OTP '123456' returned.");
  } else {
    console.log("  ❌ FAIL: Demo send failed or called external API.");
  }

  const demoVerifyRes = verifyFast2SMSOtp("9998887771", "123456");
  console.log("  verifyFast2SMSOtp Result:", JSON.stringify(demoVerifyRes));

  if (demoVerifyRes.valid) {
    console.log("  ✅ PASS: Demo OTP '123456' successfully verified!");
  } else {
    console.log("  ❌ FAIL: Demo OTP verification failed!");
  }

  // -------------------------------------------------------------
  // Test 2: REAL MODE ENABLED (FAST2SMS_DEMO_MODE=false)
  // -------------------------------------------------------------
  process.env.FAST2SMS_DEMO_MODE = "false";
  console.log("\n[Test 2] Real Mode ENABLED (FAST2SMS_DEMO_MODE=false):");

  const masterVerifyFalse = verifyFast2SMSOtp("8010530980", "123456");
  console.log("  Master OTP verification attempt in Real Mode:", JSON.stringify(masterVerifyFalse));

  if (!masterVerifyFalse.valid) {
    console.log("  ✅ PASS: Master OTP '123456' is strictly BLOCKED in Real Mode.");
  } else {
    console.log("  ❌ FAIL: Master OTP was accepted in Real Mode!");
  }
}

testDemoAndRealModes().catch(console.error);
