import { PredictWaitResult, TriageLevel } from "./types";

export interface FallbackResult extends PredictWaitResult {
  source: "deterministic-fallback";
}

export function getDeterministicFallback(complaint: string): FallbackResult {
  if (!complaint || typeof complaint !== "string") {
    return {
      predicted_mins: 8,
      triage_level: "routine",
      source: "deterministic-fallback",
    };
  }

  const normalized = complaint.toLowerCase();

  // 1. Chronic multi-symptom / abdominal pain -> 15 minutes / priority
  if (
    normalized.includes("chronic") ||
    normalized.includes("abdominal") ||
    normalized.includes("stomach pain") ||
    normalized.includes("multi-symptom")
  ) {
    return {
      predicted_mins: 15,
      triage_level: "priority",
      source: "deterministic-fallback",
    };
  }

  // 2. Follow-up / reports -> 5 minutes / express
  if (
    normalized.includes("follow-up") ||
    normalized.includes("follow up") ||
    normalized.includes("report") ||
    normalized.includes("reports") ||
    normalized.includes("bp check") ||
    normalized.includes("refill")
  ) {
    return {
      predicted_mins: 5,
      triage_level: "express",
      source: "deterministic-fallback",
    };
  }

  // 3. Fever / cough / general ache -> 8 minutes / routine
  if (
    normalized.includes("fever") ||
    normalized.includes("cough") ||
    normalized.includes("cold") ||
    normalized.includes("ache") ||
    normalized.includes("sore throat")
  ) {
    return {
      predicted_mins: 8,
      triage_level: "routine",
      source: "deterministic-fallback",
    };
  }

  // 4. Default / Unknown / Unmatched -> 8 minutes / routine
  return {
    predicted_mins: 8,
    triage_level: "routine",
    source: "deterministic-fallback",
  };
}
