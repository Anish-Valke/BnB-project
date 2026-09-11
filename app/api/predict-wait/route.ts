import { NextRequest, NextResponse } from "next/server";
import { predictWaitDuration } from "@/lib/ai/gemini";
import { checkSafetyRules } from "@/lib/ai/safety-rules";
import { getDeterministicFallback } from "@/lib/ai/fallback";

export async function POST(request: NextRequest) {
  try {
    // 1. Parse and validate JSON request body
    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Malformed JSON payload in request body" },
        { status: 400 }
      );
    }

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Request body must be a JSON object" },
        { status: 400 }
      );
    }

    const { complaint } = body;

    if (typeof complaint !== "string") {
      return NextResponse.json(
        { error: "Field 'complaint' is required and must be a string" },
        { status: 400 }
      );
    }

    const trimmedComplaint = complaint.trim();
    if (trimmedComplaint.length === 0) {
      return NextResponse.json(
        { error: "Field 'complaint' cannot be empty" },
        { status: 400 }
      );
    }

    // 2. Check deterministic safety rules BEFORE calling Gemini
    const safetyOverride = checkSafetyRules(trimmedComplaint);
    if (safetyOverride) {
      return NextResponse.json(
        {
          predicted_mins: safetyOverride.predicted_mins,
          triage_level: safetyOverride.triage_level,
          source: safetyOverride.source,
        },
        { status: 200 }
      );
    }

    // 3. Call Gemini AI Engine prediction (with fallback on ANY failure)
    try {
      if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.trim() === "") {
        throw new Error("GEMINI_API_KEY environment variable is missing");
      }

      const prediction = await predictWaitDuration(trimmedComplaint);

      return NextResponse.json(
        {
          predicted_mins: prediction.predicted_mins,
          triage_level: prediction.triage_level,
          source: prediction.source,
        },
        { status: 200 }
      );
    } catch (geminiError: any) {
      console.warn(
        "Gemini AI prediction failed, using deterministic fallback:",
        geminiError?.message || geminiError
      );

      // 4. Return deterministic fallback on ANY Gemini failure
      const fallback = getDeterministicFallback(trimmedComplaint);
      return NextResponse.json(
        {
          predicted_mins: fallback.predicted_mins,
          triage_level: fallback.triage_level,
          source: fallback.source,
        },
        { status: 200 }
      );
    }
  } catch (error: any) {
    console.error("Unexpected error in POST /api/predict-wait:", error?.message || error);
    return NextResponse.json(
      { error: "Failed to process wait duration prediction" },
      { status: 500 }
    );
  }
}
