import { PredictWaitResult } from "./types";

export interface SafetyOverrideResult extends PredictWaitResult {
  source: "safety-override";
}

const PRIORITY_KEYWORDS = [
  "chest pain",
  "bleeding",
  "unconscious",
  "acute breathlessness",
];

const EXPRESS_KEYWORDS = [
  "follow-up",
  "follow up",
  "report check",
  "bp check",
  "refill",
];

export function checkSafetyRules(complaint: string): SafetyOverrideResult | null {
  if (!complaint || typeof complaint !== "string") {
    return null;
  }

  const normalized = complaint.toLowerCase();

  // Priority keywords take precedence over express keywords
  for (const keyword of PRIORITY_KEYWORDS) {
    if (normalized.includes(keyword)) {
      return {
        predicted_mins: 20,
        triage_level: "priority",
        source: "safety-override",
      };
    }
  }

  for (const keyword of EXPRESS_KEYWORDS) {
    if (normalized.includes(keyword)) {
      return {
        predicted_mins: 5,
        triage_level: "express",
        source: "safety-override",
      };
    }
  }

  return null;
}
