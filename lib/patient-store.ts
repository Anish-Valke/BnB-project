import { getServiceSupabase } from "@/lib/supabase";
import { PatientProfile } from "@/lib/types";
import { parseAge } from "@/lib/age-parser";

// In-memory fallback database for patient profiles
const memoryPatients = new Map<string, PatientProfile>([
  [
    "9876543210",
    {
      id: "pat_1",
      phone: "9876543210",
      name: "Ramesh Kumar",
      age: 42,
      gender: "Male",
      prior_history: "Hypertension (5 years), Type 2 Diabetes",
      created_at: new Date().toISOString(),
    },
  ],
  [
    "9998887770",
    {
      id: "pat_2",
      phone: "9998887770",
      name: "Aniket Sharma",
      age: 28,
      gender: "Male",
      prior_history: "No known allergies or chronic conditions",
      created_at: new Date().toISOString(),
    },
  ],
  [
    "9876500000",
    {
      id: "pat_3",
      phone: "9876500000",
      name: "Priya Verma",
      age: 35,
      gender: "Female",
      prior_history: "Asthma (Mild), Penicillin Allergy",
      created_at: new Date().toISOString(),
    },
  ],
]);

/**
 * Upserts a patient profile record into both Supabase `patients` table and in-memory fallback.
 */
export async function upsertPatientProfile(data: {
  phone: string;
  name: string;
  age?: number | string;
  gender?: string;
  prior_history?: string;
}): Promise<PatientProfile> {
  const cleanPhone = (data.phone || "").replace(/\D/g, "");
  if (!cleanPhone || cleanPhone.length < 10) {
    throw new Error("Valid 10-digit mobile phone number required");
  }

  const existingMem = memoryPatients.get(cleanPhone);
  const parsedAgeVal = data.age !== undefined && data.age !== null ? parseAge(data.age) : null;
  const profile: PatientProfile = {
    id: existingMem?.id || `pat_${Date.now()}`,
    phone: cleanPhone,
    name: data.name.trim(),
    age: parsedAgeVal !== null ? parsedAgeVal : existingMem?.age || 35,
    gender: data.gender || existingMem?.gender || "Male",
    prior_history: data.prior_history || existingMem?.prior_history || "None recorded",
    created_at: existingMem?.created_at || new Date().toISOString(),
  };

  // 1. Save to in-memory store
  memoryPatients.set(cleanPhone, profile);

  // 2. Save to Supabase `patients` table
  try {
    const supabase = getServiceSupabase();
    await supabase.from("patients").upsert(
      [
        {
          phone: profile.phone,
          name: profile.name,
          age: profile.age,
          gender: profile.gender,
          prior_history: profile.prior_history,
          updated_at: new Date().toISOString(),
        },
      ],
      { onConflict: "phone" }
    );
  } catch (err) {
    console.warn("Supabase `patients` upsert notice:", err);
  }

  return profile;
}

/**
 * Gets a patient profile by phone number from Supabase or fallback store.
 */
export async function getPatientByPhone(phone: string): Promise<PatientProfile | null> {
  const cleanPhone = (phone || "").replace(/\D/g, "");
  if (!cleanPhone) return null;

  // 1. Try fetching from Supabase DB
  try {
    const supabase = getServiceSupabase();
    const { data: patient, error } = await supabase
      .from("patients")
      .select("*")
      .eq("phone", cleanPhone)
      .maybeSingle();

    if (!error && patient) {
      return patient as PatientProfile;
    }
  } catch {
    // Ignore DB error
  }

  // 2. Fallback to in-memory store
  return memoryPatients.get(cleanPhone) || null;
}

// In-memory token store indexed by phone number
const memoryTokensByPhone = new Map<string, any[]>();

/**
 * Saves a token record associated with a specific patient phone number
 */
export function saveTokenForPhone(phone: string, token: unknown): void {
  const cleanPhone = (phone || "").replace(/\D/g, "");
  if (!cleanPhone) return;
  const list = memoryTokensByPhone.get(cleanPhone) || [];
  // Ensure no duplicate tokens by id
  const existingIdx = list.findIndex((t) => t.id === token.id || t.token_number === token.token_number);
  if (existingIdx >= 0) {
    list[existingIdx] = token;
  } else {
    list.unshift(token);
  }
  memoryTokensByPhone.set(cleanPhone, list);
}

/**
 * Gets all tokens associated with a patient phone number
 */
export function getTokensForPhone(phone: string): unknown[] {
  const cleanPhone = (phone || "").replace(/\D/g, "");
  if (!cleanPhone) return [];
  return memoryTokensByPhone.get(cleanPhone) || [];
}

/**
 * Clears in-memory tokens
 */
export function clearMemoryTokens(): void {
  memoryTokensByPhone.clear();
}


