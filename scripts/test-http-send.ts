async function testHttpSend() {
  console.log("=== Testing POST http://localhost:3000/api/auth/send-otp ===");
  const res = await fetch("http://localhost:3000/api/auth/send-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone: "8010530980" }),
  });

  const data = await res.json();
  console.log("HTTP Response Status:", res.status);
  console.log("HTTP Response Body:", JSON.stringify(data, null, 2));
}

testHttpSend().catch(console.error);
