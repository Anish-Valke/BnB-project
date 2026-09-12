export type TokenStatus = 'waiting' | 'in-consultation' | 'completed' | 'skipped';
export type TriageLevel = 'routine' | 'priority' | 'express';
export type SpatialBufferStatus = 'green' | 'yellow' | 'red';

export interface Doctor {
  id: string;
  name: string;
  department: string;
  room_number: string;
  current_token: number;
  velocity_factor: number;
  emergency_delay: number;
  updated_at?: string;
}

export interface Token {
  id: string;
  token_number: number;
  doctor_id: string;
  patient_name: string;
  patient_phone?: string;
  age?: number;
  gender?: string;
  prior_history?: string;
  chief_complaint: string;
  triage_level: TriageLevel;
  predicted_mins: number;
  status: TokenStatus;
  created_at: string;
  consultation_started_at?: string | null;
  consultation_completed_at?: string | null;
  doctor_notes?: string | null;
  prescription_text?: string | null;
}

export interface PatientProfile {
  id?: string;
  phone: string;
  name: string;
  age: number;
  gender: string;
  prior_history?: string;
  created_at?: string;
}

export interface Prescription {
  id: string;
  token_id?: string;
  doctor_name: string;
  department: string;
  date: string;
  chief_complaint: string;
  doctor_notes?: string;
  prescription_text: string;
}

export interface QueueItemCalculation {
  token: Token;
  patients_ahead: number;
  estimated_wait_mins: number;
  expected_turn_time: string; // ISO string or formatted time e.g. "11:45 AM"
  buffer_status: SpatialBufferStatus;
  buffer_label: string;
  buffer_description: string;
}

export interface QueueResponse {
  doctor: Doctor;
  queue: Token[];
  current_serving?: Token | null;
  calculated_hero_token?: QueueItemCalculation | null;
}

export interface PredictWaitRequest {
  complaint: string;
}

export interface PredictWaitResponse {
  predicted_mins: number;
  triage_level: TriageLevel;
  source: 'gemini-3.6-flash' | 'safety-override' | 'deterministic-fallback';
  reasoning?: string;
}

export interface PatientIntakeData {
  patient_name: string;
  phone: string;
  age?: number | string;
  gender?: string;
  doctor_id: string;
  chief_complaint: string;
  prior_history?: string;
}

export interface GeminiValidationResult {
  isValid: boolean;
  reasoning: string;
  validationError?: string;
  sanitizedSummary?: string;
  triageLevel?: TriageLevel;
  predictedMins?: number;
  recommendedDepartment?: string;
}

export interface LocationVerification {
  isWithinRange: boolean;
  distanceKm: number;
  userLat?: number;
  userLng?: number;
  hospitalName: string;
  isDummyMode: boolean;
}

