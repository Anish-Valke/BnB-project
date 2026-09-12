import { GoogleGenAI, Type } from "@google/genai";
import { GeminiPredictionResponse, GeminiRawOutput, TriageLevel } from "./types";

export const GEMINI_MODEL_NAME = "gemini-3.6-flash";

const VALID_TRIAGE_LEVELS: Set<TriageLevel> = new Set(["routine", "priority", "express"]);

export function validateGeminiResponse(parsed: unknown): GeminiPredictionResponse {
  if (!parsed || typeof parsed !== "object") {
    throw new Error("Gemini response is not a valid JSON object");
  }

  const { predicted_mins, triage_level } = parsed as GeminiRawOutput;

  if (predicted_mins === undefined || predicted_mins === null) {
    throw new Error("Gemini response missing predicted_mins");
  }

  if (
    typeof predicted_mins !== "number" ||
    !Number.isInteger(predicted_mins) ||
    predicted_mins < 1 ||
    predicted_mins > 60
  ) {
    throw new Error(
      `Gemini predicted_mins must be an integer number between 1 and 60 (strings or non-integers are rejected), got: ${typeof predicted_mins} (${predicted_mins})`
    );
  }

  if (typeof triage_level !== "string" || !VALID_TRIAGE_LEVELS.has(triage_level as TriageLevel)) {
    throw new Error(`Gemini triage_level must be routine, priority, or express, got: ${triage_level}`);
  }

  return {
    predicted_mins,
    triage_level: triage_level as TriageLevel,
    source: "gemini-3.6-flash",
  };
}

export async function predictWaitDuration(
  complaint: string,
  customApiKey?: string,
  clientOverride?: any // eslint-disable-line @typescript-eslint/no-explicit-any
): Promise<GeminiPredictionResponse> {
  const apiKey = customApiKey || process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === "") {
    throw new Error("Missing GEMINI_API_KEY environment variable");
  }

  const ai = clientOverride || new GoogleGenAI({ apiKey });

  const prompt = `You are an expert hospital Outpatient Department (OPD) operational flow analyzer.
Your ONLY task is to estimate expected consultation duration in minutes and assign an operational triage level based on the patient's presenting chief complaint.

CRITICAL INSTRUCTIONS:
- You are NOT diagnosing the patient.
- Do NOT provide medical advice or treatment instructions.
- ONLY classify the complaint for queue management prediction.
- Respond STRICTLY with valid JSON.
- predicted_mins must be a reasonable integer (between 1 and 60).
- triage_level must be strictly one of: "routine", "priority", "express".

Patient Chief Complaint: "${complaint}"`;

  const response = await ai.models.generateContent({
    model: GEMINI_MODEL_NAME,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          predicted_mins: {
            type: Type.INTEGER,
            description: "Expected consultation duration in integer minutes (1 to 60)",
          },
          triage_level: {
            type: Type.STRING,
            enum: ["routine", "priority", "express"],
            description: "Operational queue triage category",
          },
        },
        required: ["predicted_mins", "triage_level"],
      },
    },
  });

  const text = response?.text;
  if (!text) {
    throw new Error("Empty response from Gemini API");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch (err: unknown) {
    throw new Error(`Failed to parse Gemini JSON response: ${err.message}`);
  }

  return validateGeminiResponse(parsed);
}
