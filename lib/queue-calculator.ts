import { Doctor, Token, QueueItemCalculation, SpatialBufferStatus } from "./types";

export interface CalculateQueueOptions {
  doctor: Doctor;
  tokens: Token[];
  targetTokenNumber?: number;
  now?: Date;
}

/**
 * Calculates remaining active time (mins) for current in-consultation token
 */
export function getRemainingActiveTime(activeToken: Token | undefined, now: Date = new Date()): number {
  if (!activeToken || activeToken.status !== "in-consultation") {
    return 0;
  }

  const predicted = activeToken.predicted_mins || 8;
  if (!activeToken.consultation_started_at) {
    return predicted;
  }

  const startTime = new Date(activeToken.consultation_started_at).getTime();
  const elapsedMins = Math.floor((now.getTime() - startTime) / (1000 * 60));

  return Math.max(1, predicted - elapsedMins);
}

/**
 * Calculates estimated turn timestamp string formatted cleanly (e.g., "11:45 AM")
 */
export function formatExpectedTurnTime(estimatedWaitMins: number, baseDate: Date = new Date()): string {
  const turnDate = new Date(baseDate.getTime() + estimatedWaitMins * 60 * 1000);
  return turnDate.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

/**
 * Determines 3-Tier Spatial Buffer Status (Green, Yellow, Red) based on wait time & position ahead
 */
export function determineSpatialBufferStatus(
  isCurrentServing: boolean,
  patientsAhead: number,
  estimatedWaitMins: number
): {
  buffer_status: SpatialBufferStatus;
  buffer_label: string;
  buffer_description: string;
} {
  if (isCurrentServing) {
    return {
      buffer_status: "red",
      buffer_label: "INSIDE ROOM NOW",
      buffer_description: "Please enter the doctor's room immediately. The doctor is calling you.",
    };
  }

  // Dual-Condition Threshold:
  // Green: Wait > 15m AND Ahead > 3
  // Yellow: Wait <= 15m OR Ahead <= 3
  if (estimatedWaitMins > 15 && patientsAhead > 3) {
    return {
      buffer_status: "green",
      buffer_label: "RELAX / OUTSIDE",
      buffer_description: "You can comfortably wait outside in the garden or cafeteria. We will alert you as your turn nears.",
    };
  }

  return {
    buffer_status: "yellow",
    buffer_label: "BUFFER ZONE",
    buffer_description: "Move toward the consultation room now. Prepare your documents.",
  };
}

/**
 * Core Mathematical Calculation Engine for a Target Patient Token
 */
export function calculateTokenWaitTime(
  targetToken: Token,
  doctor: Doctor,
  allDoctorTokens: Token[],
  now: Date = new Date()
): QueueItemCalculation {
  const isCurrentServing = targetToken.token_number === doctor.current_token || targetToken.status === "in-consultation";

  if (isCurrentServing) {
    const buffer = determineSpatialBufferStatus(true, 0, 0);
    return {
      token: targetToken,
      patients_ahead: 0,
      estimated_wait_mins: 0,
      expected_turn_time: formatExpectedTurnTime(0, now),
      ...buffer,
    };
  }

  // Find active token in consultation
  const activeToken = allDoctorTokens.find((t) => t.status === "in-consultation");
  const remainingActiveMins = getRemainingActiveTime(activeToken, now);

  // Find all waiting tokens ahead of target token
  const waitingAhead = allDoctorTokens.filter(
    (t) => t.status === "waiting" && t.token_number < targetToken.token_number
  );

  const patientsAhead = waitingAhead.length;

  // Sum predicted minutes of all waiting tokens ahead
  const sumAheadPredicted = waitingAhead.reduce((acc, t) => acc + (t.predicted_mins || 8), 0);

  // Base raw wait time
  const baseWaitMins = remainingActiveMins + sumAheadPredicted;

  // Apply doctor velocity factor and accumulated emergency delay
  const velocityFactor = doctor.velocity_factor || 1.0;
  const emergencyDelay = doctor.emergency_delay || 0;

  const adjustedWaitMins = Math.round(baseWaitMins * velocityFactor + emergencyDelay);
  const estimatedWaitMins = Math.max(0, adjustedWaitMins);

  const buffer = determineSpatialBufferStatus(false, patientsAhead, estimatedWaitMins);

  return {
    token: targetToken,
    patients_ahead: patientsAhead,
    estimated_wait_mins: estimatedWaitMins,
    expected_turn_time: formatExpectedTurnTime(estimatedWaitMins, now),
    ...buffer,
  };
}

/**
 * Calculates rolling average doctor velocity factor based on last N completed patients
 */
export function calculateDoctorVelocity(completedTokens: Token[], fallbackFactor: number = 1.0): number {
  const validCompleted = completedTokens
    .filter((t) => t.consultation_started_at && t.consultation_completed_at)
    .slice(-3); // Last 3 completed patients

  if (validCompleted.length === 0) {
    return fallbackFactor;
  }

  let totalActualMins = 0;
  let totalPredictedMins = 0;

  for (const t of validCompleted) {
    const start = new Date(t.consultation_started_at!).getTime();
    const end = new Date(t.consultation_completed_at!).getTime();
    const actualMins = Math.max(1, (end - start) / (1000 * 60));
    totalActualMins += actualMins;
    totalPredictedMins += t.predicted_mins || 8;
  }

  if (totalPredictedMins === 0) return 1.0;

  const rawVelocity = totalActualMins / totalPredictedMins;
  // Clamp between 0.75 and 1.5
  return Math.min(1.5, Math.max(0.75, Math.round(rawVelocity * 100) / 100));
}
