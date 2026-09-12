import { NextRequest } from "next/server";
import { POST } from "../app/api/predict-wait/route";
import { validateGeminiResponse, predictWaitDuration } from "../lib/ai/gemini";
import { checkSafetyRules } from "../lib/ai/safety-rules";
import { getDeterministicFallback } from "../lib/ai/fallback";

let passCount = 0;
let failCount = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  ✅ [PASS] ${testName}`);
    passCount++;
  } else {
    console.error(`  ❌ [FAIL] ${testName} - ${detail || "Assertion failed"}`);
    failCount++;
  }
}

async function runAllTests() {
  console.log("=================================================");
  console.log("🧪 AF-005 + AF-006: AI & Fallback Prediction Test Suite");
  console.log("=================================================\n");

  const originalApiKey = process.env.GEMINI_API_KEY;

  try {
    // ---------------------------------------------------------
    // AF-005 Unit Tests: Direct Gemini Utility & Validation Tests
    // ---------------------------------------------------------
    console.log("--- AF-005 Core Unit Tests ---");

    console.log("Test 1: Valid Gemini SDK response parsing & validation");
    {
      const raw = { predicted_mins: 12, triage_level: "express" };
      const validated = validateGeminiResponse(raw);
      assert(validated.predicted_mins === 12, "Parses predicted_mins integer correctly (12)");
      assert(validated.triage_level === "express", "Parses express triage level correctly");
      assert(validated.source === "gemini-3.6-flash", "Source is set to gemini-3.6-flash");
    }

    console.log("\nTest 2: Invalid Gemini response validation strictness");
    {
      let caughtStringError = false;
      try {
        validateGeminiResponse({ predicted_mins: "8", triage_level: "routine" });
      } catch (err: unknown) {
        caughtStringError = err.message.includes("strings or non-integers are rejected");
      }
      assert(caughtStringError, "Rejects string predicted_mins ('8') without string coercion");

      let caughtFloatError = false;
      try {
        validateGeminiResponse({ predicted_mins: 8.5, triage_level: "routine" });
      } catch (err: unknown) {
        caughtFloatError = err.message.includes("integer number");
      }
      assert(caughtFloatError, "Rejects float predicted_mins (8.5)");

      let caughtOutOfRangeError = false;
      try {
        validateGeminiResponse({ predicted_mins: 999, triage_level: "routine" });
      } catch (err: unknown) {
        caughtOutOfRangeError = err.message.includes("between 1 and 60");
      }
      assert(caughtOutOfRangeError, "Rejects out-of-range predicted_mins (> 60)");

      let caughtTriageError = false;
      try {
        validateGeminiResponse({ predicted_mins: 5, triage_level: "invalid_level" });
      } catch (err: unknown) {
        caughtTriageError = err.message.includes("must be routine, priority, or express");
      }
      assert(caughtTriageError, "Rejects invalid triage level");
    }

    console.log("\nTest 3: Gemini SDK mock execution");
    {
      process.env.GEMINI_API_KEY = "mock_test_api_key_12345";
      const mockClient = {
        models: {
          generateContent: async () => ({
            text: JSON.stringify({ predicted_mins: 8, triage_level: "routine" }),
          }),
        },
      };

      const result = await predictWaitDuration("Dry cough and mild fever", undefined, mockClient);
      assert(result.predicted_mins === 8, "predictWaitDuration returns predicted_mins (8)");
      assert(result.triage_level === "routine", "predictWaitDuration returns triage_level ('routine')");
      assert(result.source === "gemini-3.6-flash", "predictWaitDuration includes source 'gemini-3.6-flash'");
    }

    console.log("\nTest 4: Gemini SDK error propagation");
    {
      process.env.GEMINI_API_KEY = "mock_test_api_key_12345";
      const mockFailingClient = {
        models: {
          generateContent: async () => {
            throw new Error("Gemini upstream service unavailable 503");
          },
        },
      };

      let threw = false;
      try {
        await predictWaitDuration("Test complaint", undefined, mockFailingClient);
      } catch (err: unknown) {
        threw = err.message.includes("upstream service");
      }
      assert(threw, "API client failure propagates error to caller");
    }

    // ---------------------------------------------------------
    // Request Validation Tests (Requirement 16)
    // ---------------------------------------------------------
    console.log("\n--- Request Validation Tests (400 Bad Request) ---");

    console.log("Test 5: Malformed JSON request body");
    {
      const req = new NextRequest("http://localhost:3000/api/predict-wait", {
        method: "POST",
        body: "invalid-json{",
      });
      const res = await POST(req);
      const data = await res.json();

      assert(res.status === 400, "Returns HTTP 400 status code for malformed JSON");
      assert(Boolean(data.error), "Returns error message in body");
    }

    console.log("\nTest 6: Missing complaint field");
    {
      const req = new NextRequest("http://localhost:3000/api/predict-wait", {
        method: "POST",
        body: JSON.stringify({}),
      });
      const res = await POST(req);
      const data = await res.json();

      assert(res.status === 400, "Returns HTTP 400 status code for missing complaint");
      assert(data.error.includes("required"), "Error message specifies required complaint field");
    }

    console.log("\nTest 7: Empty or whitespace complaint string");
    {
      const req = new NextRequest("http://localhost:3000/api/predict-wait", {
        method: "POST",
        body: JSON.stringify({ complaint: "   " }),
      });
      const res = await POST(req);
      const data = await res.json();

      assert(res.status === 400, "Returns HTTP 400 status code for empty complaint");
      assert(data.error.includes("cannot be empty"), "Error message specifies complaint cannot be empty");
    }

    console.log("\nTest 8: Invalid complaint type (non-string)");
    {
      const req = new NextRequest("http://localhost:3000/api/predict-wait", {
        method: "POST",
        body: JSON.stringify({ complaint: 12345 }),
      });
      const res = await POST(req);
      const data = await res.json();

      assert(res.status === 400, "Returns HTTP 400 status code for non-string complaint");
      assert(data.error.includes("must be a string"), "Error message specifies string type requirement");
    }

    // ---------------------------------------------------------
    // AF-006 Safety Override Tests (Requirements 1 - 10)
    // ---------------------------------------------------------
    console.log("\n--- AF-006 Safety Override Tests ---");

    console.log("Test 9: Safety override — priority: 'I have chest pain'");
    {
      const req = new NextRequest("http://localhost:3000/api/predict-wait", {
        method: "POST",
        body: JSON.stringify({ complaint: "I have chest pain" }),
      });
      const res = await POST(req);
      const data = await res.json();

      assert(res.status === 200, "Returns HTTP 200");
      assert(data.predicted_mins === 20, "predicted_mins is 20");
      assert(data.triage_level === "priority", "triage_level is 'priority'");
      assert(data.source === "safety-override", "source is 'safety-override'");
    }

    console.log("\nTest 10: Safety override — priority: 'patient has bleeding'");
    {
      const req = new NextRequest("http://localhost:3000/api/predict-wait", {
        method: "POST",
        body: JSON.stringify({ complaint: "patient has bleeding" }),
      });
      const res = await POST(req);
      const data = await res.json();

      assert(res.status === 200, "Returns HTTP 200");
      assert(data.predicted_mins === 20, "predicted_mins is 20");
      assert(data.triage_level === "priority", "triage_level is 'priority'");
      assert(data.source === "safety-override", "source is 'safety-override'");
    }

    console.log("\nTest 11: Safety override — priority: 'patient is unconscious'");
    {
      const req = new NextRequest("http://localhost:3000/api/predict-wait", {
        method: "POST",
        body: JSON.stringify({ complaint: "patient is unconscious" }),
      });
      const res = await POST(req);
      const data = await res.json();

      assert(res.status === 200, "Returns HTTP 200");
      assert(data.predicted_mins === 20, "predicted_mins is 20");
      assert(data.triage_level === "priority", "triage_level is 'priority'");
      assert(data.source === "safety-override", "source is 'safety-override'");
    }

    console.log("\nTest 12: Safety override — priority: 'acute breathlessness'");
    {
      const req = new NextRequest("http://localhost:3000/api/predict-wait", {
        method: "POST",
        body: JSON.stringify({ complaint: "acute breathlessness" }),
      });
      const res = await POST(req);
      const data = await res.json();

      assert(res.status === 200, "Returns HTTP 200");
      assert(data.predicted_mins === 20, "predicted_mins is 20");
      assert(data.triage_level === "priority", "triage_level is 'priority'");
      assert(data.source === "safety-override", "source is 'safety-override'");
    }

    console.log("\nTest 13: Safety override — express: 'follow-up visit'");
    {
      const req = new NextRequest("http://localhost:3000/api/predict-wait", {
        method: "POST",
        body: JSON.stringify({ complaint: "follow-up visit" }),
      });
      const res = await POST(req);
      const data = await res.json();

      assert(res.status === 200, "Returns HTTP 200");
      assert(data.predicted_mins === 5, "predicted_mins is 5");
      assert(data.triage_level === "express", "triage_level is 'express'");
      assert(data.source === "safety-override", "source is 'safety-override'");
    }

    console.log("\nTest 14: Safety override — express: 'report check'");
    {
      const req = new NextRequest("http://localhost:3000/api/predict-wait", {
        method: "POST",
        body: JSON.stringify({ complaint: "report check" }),
      });
      const res = await POST(req);
      const data = await res.json();

      assert(res.status === 200, "Returns HTTP 200");
      assert(data.predicted_mins === 5, "predicted_mins is 5");
      assert(data.triage_level === "express", "triage_level is 'express'");
      assert(data.source === "safety-override", "source is 'safety-override'");
    }

    console.log("\nTest 15: Safety override — express: 'BP check'");
    {
      const req = new NextRequest("http://localhost:3000/api/predict-wait", {
        method: "POST",
        body: JSON.stringify({ complaint: "BP check" }),
      });
      const res = await POST(req);
      const data = await res.json();

      assert(res.status === 200, "Returns HTTP 200");
      assert(data.predicted_mins === 5, "predicted_mins is 5");
      assert(data.triage_level === "express", "triage_level is 'express'");
      assert(data.source === "safety-override", "source is 'safety-override'");
    }

    console.log("\nTest 16: Safety override — express: 'medicine refill'");
    {
      const req = new NextRequest("http://localhost:3000/api/predict-wait", {
        method: "POST",
        body: JSON.stringify({ complaint: "medicine refill" }),
      });
      const res = await POST(req);
      const data = await res.json();

      assert(res.status === 200, "Returns HTTP 200");
      assert(data.predicted_mins === 5, "predicted_mins is 5");
      assert(data.triage_level === "express", "triage_level is 'express'");
      assert(data.source === "safety-override", "source is 'safety-override'");
    }

    console.log("\nTest 17: Priority override takes precedence over express");
    {
      const req = new NextRequest("http://localhost:3000/api/predict-wait", {
        method: "POST",
        body: JSON.stringify({ complaint: "follow-up visit for severe chest pain" }),
      });
      const res = await POST(req);
      const data = await res.json();

      assert(res.status === 200, "Returns HTTP 200");
      assert(data.predicted_mins === 20, "predicted_mins is 20 (priority)");
      assert(data.triage_level === "priority", "triage_level is 'priority'");
      assert(data.source === "safety-override", "source is 'safety-override'");
    }

    console.log("\nTest 18: Safety override does NOT call Gemini API (Missing key ignored)");
    {
      delete process.env.GEMINI_API_KEY; // No API key set
      const req = new NextRequest("http://localhost:3000/api/predict-wait", {
        method: "POST",
        body: JSON.stringify({ complaint: "I have chest pain" }),
      });
      const res = await POST(req);
      const data = await res.json();

      assert(res.status === 200, "Returns HTTP 200 without API key");
      assert(data.source === "safety-override", "Returns safety override without attempting Gemini API call");
    }

    // ---------------------------------------------------------
    // AF-006 Fallback Matrix & Gemini Route Integration Tests
    // ---------------------------------------------------------
    console.log("\n--- AF-006 Fallback & Route Integration Tests ---");

    console.log("Test 19: Missing GEMINI_API_KEY triggers deterministic fallback");
    {
      delete process.env.GEMINI_API_KEY;
      const req = new NextRequest("http://localhost:3000/api/predict-wait", {
        method: "POST",
        body: JSON.stringify({ complaint: "Persistent dry cough and mild fever" }),
      });
      const res = await POST(req);
      const data = await res.json();

      assert(res.status === 200, "Returns HTTP 200 OK (fallback active)");
      assert(data.predicted_mins === 8, "Returns fallback predicted_mins (8)");
      assert(data.triage_level === "routine", "Returns fallback triage_level ('routine')");
      assert(data.source === "deterministic-fallback", "Returns source 'deterministic-fallback'");
    }

    console.log("\nTest 20: Unknown complaint with missing key defaults to 8 mins / routine fallback");
    {
      delete process.env.GEMINI_API_KEY;
      const req = new NextRequest("http://localhost:3000/api/predict-wait", {
        method: "POST",
        body: JSON.stringify({ complaint: "unusual rash on elbow" }),
      });
      const res = await POST(req);
      const data = await res.json();

      assert(res.status === 200, "Returns HTTP 200 OK");
      assert(data.predicted_mins === 8, "Unknown complaint defaults to 8 minutes");
      assert(data.triage_level === "routine", "Unknown complaint defaults to 'routine'");
      assert(data.source === "deterministic-fallback", "Returns source 'deterministic-fallback'");
    }

    console.log("\nTest 21: Chronic / abdominal complaint fallback trigger");
    {
      delete process.env.GEMINI_API_KEY;
      const req = new NextRequest("http://localhost:3000/api/predict-wait", {
        method: "POST",
        body: JSON.stringify({ complaint: "chronic abdominal cramps" }),
      });
      const res = await POST(req);
      const data = await res.json();

      assert(res.status === 200, "Returns HTTP 200 OK");
      assert(data.predicted_mins === 15, "Chronic abdominal complaint falls back to 15 minutes");
      assert(data.triage_level === "priority", "Chronic abdominal complaint falls back to 'priority'");
      assert(data.source === "deterministic-fallback", "Returns source 'deterministic-fallback'");
    }
  } finally {
    process.env.GEMINI_API_KEY = originalApiKey;
  }

  console.log("\n=================================================");
  console.log(`📊 TEST RESULTS: ${passCount} Passed, ${failCount} Failed`);
  console.log("=================================================");

  if (failCount > 0) {
    process.exit(1);
  }
}

runAllTests();
