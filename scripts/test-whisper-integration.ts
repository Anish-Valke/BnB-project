import { POST } from "../app/api/transcribe-whisper/route";
import { NextRequest } from "next/server";

async function runWhisperTests() {
  console.log("=== Testing /api/transcribe-whisper Groq Whisper Endpoint Implementation ===\n");

  // Test 1: Unsupported Content Type
  {
    console.log("Test 1: Reject unsupported content-type");
    const req = new NextRequest("http://localhost:3000/api/transcribe-whisper", {
      method: "POST",
      headers: { "content-type": "text/plain" },
      body: "invalid body",
    });
    const res = await POST(req);
    const data = await res.json();
    console.log("Status:", res.status, "| Response:", data);
    if (res.status !== 400 || data.success !== false) {
      throw new Error("Test 1 failed: Expected status 400 for unsupported content-type");
    }
    console.log("✅ Test 1 Passed!\n");
  }

  // Test 2: Missing Audio File in FormData
  {
    console.log("Test 2: Reject FormData without 'audio' field");
    const formData = new FormData();
    formData.append("language", "en");

    const req = new NextRequest("http://localhost:3000/api/transcribe-whisper", {
      method: "POST",
      body: formData,
    });
    const res = await POST(req);
    const data = await res.json();
    console.log("Status:", res.status, "| Response:", data);
    if (res.status !== 400 || data.success !== false) {
      throw new Error("Test 2 failed: Expected status 400 for missing audio");
    }
    console.log("✅ Test 2 Passed!\n");
  }

  // Test 3: Empty Audio File (0 Bytes)
  {
    console.log("Test 3: Reject empty audio Blob (0 bytes)");
    const emptyBlob = new Blob([], { type: "audio/webm" });
    const formData = new FormData();
    formData.append("audio", emptyBlob, "empty.webm");
    formData.append("language", "en");

    const req = new NextRequest("http://localhost:3000/api/transcribe-whisper", {
      method: "POST",
      body: formData,
    });
    const res = await POST(req);
    const data = await res.json();
    console.log("Status:", res.status, "| Response:", data);
    if (res.status !== 400 || data.success !== false || !data.error.includes("empty")) {
      throw new Error("Test 3 failed: Expected 400 error for empty audio file");
    }
    console.log("✅ Test 3 Passed!\n");
  }

  // Test 4: Genuine JSON Text Pass-Through
  {
    console.log("Test 4: Allow JSON text pass-through for existing caller fallback");
    const req = new NextRequest("http://localhost:3000/api/transcribe-whisper", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text: "Patient reports high fever for 2 days", language: "en" }),
    });
    const res = await POST(req);
    const data = await res.json();
    console.log("Status:", res.status, "| Response:", data);
    if (res.status !== 200 || data.success !== true || data.transcription !== "Patient reports high fever for 2 days") {
      throw new Error("Test 4 failed: Expected JSON text pass-through to work");
    }
    console.log("✅ Test 4 Passed!\n");
  }

  // Test 5: Missing GROQ_API_KEY Error Handling
  {
    console.log("Test 5: Handle missing GROQ_API_KEY cleanly with status 500 server configuration error");
    const originalGroqKey = process.env.GROQ_API_KEY;
    delete process.env.GROQ_API_KEY;

    const sampleBlob = new Blob([new Uint8Array([1, 2, 3, 4, 5])], { type: "audio/webm" });
    const formData = new FormData();
    formData.append("audio", sampleBlob, "speech.webm");
    formData.append("language", "en");

    const req = new NextRequest("http://localhost:3000/api/transcribe-whisper", {
      method: "POST",
      body: formData,
    });
    const res = await POST(req);
    const data = await res.json();
    console.log("Status:", res.status, "| Response:", data);

    // Restore GROQ_API_KEY
    if (originalGroqKey) process.env.GROQ_API_KEY = originalGroqKey;

    if (res.status !== 500 || data.success !== false || !data.error.includes("GROQ_API_KEY")) {
      throw new Error("Test 5 failed: Missing GROQ_API_KEY should return status 500 error mentioning GROQ_API_KEY");
    }
    console.log("✅ Test 5 Passed!\n");
  }

  console.log("🎉 ALL GROQ WHISPER API TESTS PASSED SUCCESSFULLY!");
}

runWhisperTests().catch((err) => {
  console.error("❌ Whisper Test Error:", err);
  process.exit(1);
});
