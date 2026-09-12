import { calculateTokenWaitTime, calculateDoctorVelocity, determineSpatialBufferStatus } from "../lib/queue-calculator";
import { Doctor, Token } from "../lib/types";

function runTests() {
  console.log("🧪 Running Queue Calculator Unit Verification...");

  const mockDoctor: Doctor = {
    id: "doc_general_medicine_104",
    name: "Dr. Anjali Sharma",
    department: "General Medicine",
    room_number: "Room 104",
    current_token: 61,
    velocity_factor: 1.1,
    emergency_delay: 15,
  };

  const now = new Date();
  const sixMinsAgo = new Date(now.getTime() - 6 * 60 * 1000).toISOString();

  const mockTokens: Token[] = [
    {
      id: "t61",
      token_number: 61,
      doctor_id: mockDoctor.id,
      patient_name: "Suresh Gupta",
      chief_complaint: "Migraine headache",
      triage_level: "routine",
      predicted_mins: 10,
      status: "in-consultation",
      created_at: now.toISOString(),
      consultation_started_at: sixMinsAgo,
    },
    {
      id: "t62",
      token_number: 62,
      doctor_id: mockDoctor.id,
      patient_name: "Token 62 Patient",
      chief_complaint: "Routine cold/fever",
      triage_level: "routine",
      predicted_mins: 8,
      status: "waiting",
      created_at: now.toISOString(),
    },
    {
      id: "t63",
      token_number: 63,
      doctor_id: mockDoctor.id,
      patient_name: "Token 63 Patient",
      chief_complaint: "Suture removal",
      triage_level: "express",
      predicted_mins: 6,
      status: "waiting",
      created_at: now.toISOString(),
    },
    {
      id: "t64",
      token_number: 64,
      doctor_id: mockDoctor.id,
      patient_name: "Target Patient",
      chief_complaint: "General checkup",
      triage_level: "routine",
      predicted_mins: 8,
      status: "waiting",
      created_at: now.toISOString(),
    },
  ];

  const targetToken = mockTokens.find((t) => t.token_number === 64)!;
  const result = calculateTokenWaitTime(targetToken, mockDoctor, mockTokens, now);

  console.log("Calculated Result for Token #64:", result);

  // Assertions
  if (result.patients_ahead !== 2) {
    throw new Error(`Expected 2 patients ahead, got ${result.patients_ahead}`);
  }

  // Base raw wait = 4 (remaining active) + 8 + 6 = 18m.
  // Adjusted = (18 * 1.1) + 15 = 19.8 + 15 = 34.8 => 35m.
  if (result.estimated_wait_mins !== 35) {
    throw new Error(`Expected 35 mins wait time, got ${result.estimated_wait_mins}`);
  }

  // Dual condition: Wait > 15m AND Ahead > 3 => Green. Here patients_ahead is 2 <= 3, so Yellow.
  if (result.buffer_status !== "yellow") {
    throw new Error(`Expected 'yellow' spatial status for 2 patients ahead, got ${result.buffer_status}`);
  }

  console.log("✅ Math engine worked example test PASSED successfully!");

  // Test Green Buffer Threshold (Wait > 15m AND Ahead > 3)
  const greenBuffer = determineSpatialBufferStatus(false, 4, 25);
  if (greenBuffer.buffer_status !== "green") {
    throw new Error(`Expected 'green' status for 4 patients ahead & 25 mins wait, got ${greenBuffer.buffer_status}`);
  }
  console.log("✅ Green Buffer threshold test PASSED!");

  // Test Yellow Buffer Threshold (Wait <= 15m OR Ahead <= 3)
  const yellowBuffer = determineSpatialBufferStatus(false, 3, 12);
  if (yellowBuffer.buffer_status !== "yellow") {
    throw new Error(`Expected 'yellow' status for 3 patients ahead & 12 mins wait, got ${yellowBuffer.buffer_status}`);
  }
  console.log("✅ Yellow Buffer threshold test PASSED!");

  // Test Doctor Velocity recalculation
  const completedTokens: Token[] = [
    {
      id: "c1",
      token_number: 58,
      doctor_id: mockDoctor.id,
      patient_name: "P1",
      chief_complaint: "Routine",
      triage_level: "routine",
      predicted_mins: 10,
      status: "completed",
      created_at: now.toISOString(),
      consultation_started_at: new Date(now.getTime() - 25 * 60 * 1000).toISOString(),
      consultation_completed_at: new Date(now.getTime() - 10 * 60 * 1000).toISOString(), // Actual: 15m vs 10m predicted -> 1.5x
    },
  ];
  const velocity = calculateDoctorVelocity(completedTokens);
  console.log(`Calculated Doctor Velocity: ${velocity}x`);
  if (velocity !== 1.5) {
    throw new Error(`Expected velocity 1.5, got ${velocity}`);
  }
  console.log("✅ Velocity calculation test PASSED!");

  console.log("🎉 ALL CALCULATOR UNIT TESTS PASSED!");
}

runTests();
