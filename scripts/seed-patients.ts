import dotenv from "dotenv";
dotenv.config({ path: ".env" });
dotenv.config({ path: ".env.local" });
dotenv.config();

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase configuration");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedPatients() {
  console.log("=== Seeding Patients & Prescriptions Database ===");

  const patientsData = [
    {
      phone: "9876543210",
      name: "Ramesh Kumar",
      age: 42,
      gender: "Male",
      prior_history: "Hypertension (5 years), Type 2 Diabetes",
    },
    {
      phone: "9998887770",
      name: "Aniket Sharma",
      age: 28,
      gender: "Male",
      prior_history: "No known allergies or chronic conditions",
    },
    {
      phone: "9876500000",
      name: "Priya Verma",
      age: 35,
      gender: "Female",
      prior_history: "Asthma (Mild), Penicillin Allergy",
    },
  ];

  const { data: upsertedPatients, error: patientErr } = await supabase
    .from("patients")
    .upsert(patientsData, { onConflict: "phone" })
    .select();

  if (patientErr) {
    console.error("Failed to seed patients:", patientErr.message);
  } else {
    console.log("Successfully seeded patients:", upsertedPatients.length);
  }

  // Seed Completed Prescription Tokens for testing history
  const completedTokensData = [
    {
      token_number: 45,
      doctor_id: "doc_general_medicine_104",
      patient_name: "Ramesh Kumar",
      patient_phone: "9876543210",
      chief_complaint: "High blood pressure follow-up and mild fever",
      triage_level: "priority",
      predicted_mins: 8,
      status: "completed",
      consultation_started_at: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
      consultation_completed_at: new Date(Date.now() - 7 * 24 * 3600 * 1000 + 10 * 60000).toISOString(),
      doctor_notes: "Blood pressure 130/85. Patient responding well to Telmisartan.",
      prescription_text: "1. Tab Telmisartan 40mg - 1-0-0 (30 days)\n2. Tab Paracetamol 500mg - 1-0-1 (3 days)",
    },
    {
      token_number: 52,
      doctor_id: "doc_cardiology_201",
      patient_name: "Ramesh Kumar",
      patient_phone: "9876543210",
      chief_complaint: "Routine ECG & Cardiology Follow-up",
      triage_level: "routine",
      predicted_mins: 10,
      status: "completed",
      consultation_started_at: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
      consultation_completed_at: new Date(Date.now() - 3 * 24 * 3600 * 1000 + 12 * 60000).toISOString(),
      doctor_notes: "ECG normal sinus rhythm. Continue current lipid management.",
      prescription_text: "1. Tab Atorvastatin 10mg - 0-0-1 (30 days)\n2. Low salt diet recommended.",
    },
  ];

  const { data: upsertedTokens, error: tokenErr } = await supabase
    .from("tokens")
    .upsert(completedTokensData, { onConflict: "id" })
    .select();

  if (tokenErr) {
    console.warn("Completed tokens notice:", tokenErr.message);
  } else {
    console.log("Successfully seeded completed prescription tokens.");
  }

  console.log("=== Seeding Completed Successfully ===");
}

seedPatients().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
