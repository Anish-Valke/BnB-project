import { PatientProfile } from "./types";

const SESSION_KEY = "arogya_patient_phone";
const PROFILE_KEY = "arogya_patient_profile";

/**
 * Gets currently logged-in patient phone number from localStorage
 */
export function getPatientPhoneSession(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(SESSION_KEY);
}

/**
 * Sets patient phone session into localStorage
 */
export function setPatientPhoneSession(phone: string, profile?: PatientProfile): void {
  if (typeof window === "undefined") return;
  const cleanPhone = phone.replace(/\D/g, "");
  localStorage.setItem(SESSION_KEY, cleanPhone);
  if (profile) {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  }
}

/**
 * Gets cached patient profile from localStorage
 */
export function getCachedPatientProfile(): PatientProfile | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(PROFILE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Clears patient session
 */
export function clearPatientSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(PROFILE_KEY);
}
