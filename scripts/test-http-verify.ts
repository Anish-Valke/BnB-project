async function testHttpVerify() {
  console.log("=== Testing POST http://localhost:3000/api/auth/verify-otp ===");
  const res = await fetch("http://localhost:3000/api/auth/verify-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      phone: "8010530980",
      otp: "319644",
    }),
  });

  const data = await res.json();
  console.log("HTTP Response Status:", res.status);
  console.log("HTTP Response Body:", JSON.stringify(data, null, 2));
}

testHttpVerify().catch(console.error);
