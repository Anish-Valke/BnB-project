import dotenv from "dotenv";
dotenv.config();

import { sendFast2SMSOtp } from "../lib/fast2sms";

async function runTest() {
  console.log("=== Testing Real Fast2SMS Integration ===");
  const apiKey = process.env.FAST2SMS_API_KEY;
  console.log("FAST2SMS_API_KEY present:", !!apiKey, "(Length:", apiKey?.trim().length || 0, ")");

  const phone = "8010530980";
  console.log(`Sending OTP to phone: ${phone}...`);

  const result = await sendFast2SMSOtp(phone);
  console.log("Fast2SMS Result:", JSON.stringify(result, null, 2));
}

runTest().catch((err) => console.error("Test Error:", err));
