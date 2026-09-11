import { TriageLevel } from "../types";

export type { TriageLevel };

export type PredictionSource =
  | "gemini-3.6-flash"
  | "safety-override"
  | "deterministic-fallback";

export interface PredictWaitResult {
  predicted_mins: number;
  triage_level: TriageLevel;
  source: PredictionSource;
  reasoning?: string;
}

export interface GeminiPredictionRequest {
  complaint: string;
}

export interface GeminiPredictionResponse extends PredictWaitResult {
  source: "gemini-3.6-flash";
}

export interface GeminiRawOutput {
  predicted_mins?: unknown;
  triage_level?: unknown;
}
