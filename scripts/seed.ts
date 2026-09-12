import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });
dotenv.config({ path: ".env.local" });
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://gregihjbvimwbuyngysa.supabase.co";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

if (!serviceRoleKey || serviceRoleKey === "your-service-role-key-here") {
  console.warn("⚠️ Warning: SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY is not configured in .env.local.");
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

export async function seedDatabase() {
  console.log("🌱 Starting ArogyaFlow Seed Script...");
  console.log(`Connecting to: ${supabaseUrl}`);

  const doctorId = "doc_general_medicine_104";

  // 1. Delete existing tokens and doctor for clean demo reset
  console.log("Cleaning up previous demo records...");
  const { error: delTokensErr } = await supabase.from("tokens").delete().eq("doctor_id", doctorId);
  if (delTokensErr) console.warn("Notice deleting tokens:", delTokensErr.message);

  const { error: delDocErr } = await supabase.from("doctors").delete().eq("id", doctorId);
  if (delDocErr) console.warn("Notice deleting doctor:", delDocErr.message);

  // 2. Insert Doctor Dr. Anjali Sharma
  console.log("Inserting Doctor: Dr. Anjali Sharma (Room 104)...");
  const { data: doctor, error: docErr } = await supabase
    .from("doctors")
    .insert([
      {
        id: doctorId,
        name: "Dr. Anjali Sharma",
        department: "General Medicine",
        room_number: "Room 104",
        current_token: 61,
        velocity_factor: 1.0,
        emergency_delay: 0,
      },
    ])
    .select()
    .single();

  if (docErr) {
    console.error("❌ Error inserting doctor:", docErr);
    throw docErr;
  }
  console.log("✅ Doctor created successfully:", doctor.id);

  // 3. Insert 15 Deterministic Patients (#61 - #75)
  const now = new Date();
  const sixMinsAgo = new Date(now.getTime() - 6 * 60 * 1000).toISOString();

  const seedTokens = [
    {
      token_number: 61,
      doctor_id: doctorId,
      patient_name: "Suresh Gupta",
      chief_complaint: "Acute migraine headache",
      triage_level: "routine",
      predicted_mins: 12,
      status: "in-consultation",
      consultation_started_at: sixMinsAgo,
    },
    {
      token_number: 62,
      doctor_id: doctorId,
      patient_name: "Pooja Verma",
      chief_complaint: "Routine BP check",
      triage_level: "express",
      predicted_mins: 4,
      status: "waiting",
    },
    {
      token_number: 63,
      doctor_id: doctorId,
      patient_name: "Vikram Singh",
      chief_complaint: "Follow-up blood test review",
      triage_level: "express",
      predicted_mins: 5,
      status: "waiting",
    },
    {
      token_number: 64,
      doctor_id: doctorId,
      patient_name: "Anita Roy",
      chief_complaint: "Persistent fever and sore throat",
      triage_level: "routine",
      predicted_mins: 8,
      status: "waiting",
    },
    {
      token_number: 65,
      doctor_id: doctorId,
      patient_name: "Mohd. Rafiq",
      chief_complaint: "Abdominal pain and nausea",
      triage_level: "priority",
      predicted_mins: 15,
      status: "waiting",
    },
    {
      token_number: 66,
      doctor_id: doctorId,
      patient_name: "Sunita Devi",
      chief_complaint: "Knee joint pain & arthritis evaluation",
      triage_level: "routine",
      predicted_mins: 10,
      status: "waiting",
    },
    {
      token_number: 67,
      doctor_id: doctorId,
      patient_name: "Amitabh Das",
      chief_complaint: "Diabetes follow-up & sugar log",
      triage_level: "express",
      predicted_mins: 5,
      status: "waiting",
    },
    {
      token_number: 68,
      doctor_id: doctorId,
      patient_name: "Kavita Patel",
      chief_complaint: "Chronic back ache review",
      triage_level: "routine",
      predicted_mins: 8,
      status: "waiting",
    },
    {
      token_number: 69,
      doctor_id: doctorId,
      patient_name: "Rajesh Mehra",
      chief_complaint: "Skin rash & allergy check",
      triage_level: "routine",
      predicted_mins: 7,
      status: "waiting",
    },
    {
      token_number: 70,
      doctor_id: doctorId,
      patient_name: "Priya Sharma",
      chief_complaint: "Thyroid report consultation",
      triage_level: "express",
      predicted_mins: 5,
      status: "waiting",
    },
    {
      token_number: 71,
      doctor_id: doctorId,
      patient_name: "Harpreet Singh",
      chief_complaint: "Post-viral fatigue checkup",
      triage_level: "routine",
      predicted_mins: 8,
      status: "waiting",
    },
    {
      token_number: 72,
      doctor_id: doctorId,
      patient_name: "Meena Kumari",
      chief_complaint: "Eye strain & dizziness",
      triage_level: "routine",
      predicted_mins: 7,
      status: "waiting",
    },
    {
      token_number: 73,
      doctor_id: doctorId,
      patient_name: "Deepak Kumar",
      chief_complaint: "Asthma refill & peak flow check",
      triage_level: "priority",
      predicted_mins: 12,
      status: "waiting",
    },
    {
      token_number: 74,
      doctor_id: doctorId,
      patient_name: "Lata Joshi",
      chief_complaint: "General weakness & anemia evaluation",
      triage_level: "routine",
      predicted_mins: 8,
      status: "waiting",
    },
    {
      token_number: 75,
      doctor_id: doctorId,
      patient_name: "Ramesh Kumar",
      chief_complaint: "Blood pressure review",
      triage_level: "express",
      predicted_mins: 6,
      status: "waiting",
    },
  ];

  console.log("Inserting 15 demo tokens (#61 - #75)...");
  const { data: insertedTokens, error: tokensErr } = await supabase.from("tokens").insert(seedTokens).select();

  if (tokensErr) {
    console.error("❌ Error inserting tokens:", tokensErr);
    throw tokensErr;
  }

  console.log(`✅ Successfully seeded ${insertedTokens.length} tokens into demo queue (#61–#75).`);
  console.log("🎉 Seed completion finished successfully.");
}

// Execute if run directly via CLI
if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("Fatal seed error:", err);
      process.exit(1);
    });
}
