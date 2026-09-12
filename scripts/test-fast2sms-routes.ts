import dotenv from "dotenv";
dotenv.config();

async function testFast2SMSRoutes() {
  const apiKey = process.env.FAST2SMS_API_KEY?.trim();
  const phone = "8010530980";
  const testOtp = "752815";

  if (!apiKey) {
    console.log("No API key");
    return;
  }

  console.log("--- Testing route: 'otp' ---");
  const resOtp = await fetch("https://www.fast2sms.com/dev/bulkV2", {
    method: "POST",
    headers: {
      authorization: apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      route: "otp",
      variables_values: testOtp,
      numbers: phone,
    }),
  });
  console.log("route: 'otp' status:", resOtp.status, await resOtp.json());

  console.log("\n--- Testing route: 'q' (Quick SMS) ---");
  const resQ = await fetch("https://www.fast2sms.com/dev/bulkV2", {
    method: "POST",
    headers: {
      authorization: apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      route: "q",
      message: `Your verification code is: ${testOtp}`,
      flash: "0",
      numbers: phone,
    }),
  });
  console.log("route: 'q' status:", resQ.status, await resQ.json());
}

testFast2SMSRoutes().catch(console.error);
