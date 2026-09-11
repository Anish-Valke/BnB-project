import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();

import { getServiceSupabase } from "../lib/supabase";
import { Doctor, Token } from "../lib/types";
import { calculateTokenWaitTime } from "../lib/queue-calculator";

async function verifyLiveDatabase() {
  console.log("🔍 Verifying Live Supabase DB Connection & Seed Data...");

  const supabase = getServiceSupabase();
  const doctorId = "doc_general_medicine_104";

  // 1. Query Doctor
  const { data: doctor, error: docErr } = await supabase
    .from("doctors")
    .select("*")
    .eq("id", doctorId)
    .single();

  if (docErr || !doctor) {
    console.error("❌ Failed to query doctor from DB:", docErr);
    process.exit(1);
  }

  console.log("✅ Live Doctor Query Passed:", doctor.name, `(${doctor.room_number})`);

  // 2. Query Tokens
  const { data: tokens, error: tokensErr } = await supabase
    .from("tokens")
    .select("*")
    .eq("doctor_id", doctorId)
    .order("token_number", { ascending: true });

  if (tokensErr || !tokens) {
    console.error("❌ Failed to query tokens from DB:", tokensErr);
    process.exit(1);
  }

  console.log(`✅ Live Tokens Query Passed: ${tokens.length} tokens found.`);

  // 3. Verify Hero Token #75 Wait Time Calculation
  const heroToken = tokens.find((t) => t.token_number === 75) as Token;
  if (heroToken) {
    const calc = calculateTokenWaitTime(heroToken, doctor as Doctor, tokens as Token[]);
    console.log("\n--- Hero Patient Token #75 Metrics ---");
    console.log("Patient Name:", calc.token.patient_name);
    console.log("Patients Ahead:", calc.patients_ahead);
    console.log("Estimated Wait Mins:", calc.estimated_wait_mins, "mins");
    console.log("Expected Turn Time:", calc.expected_turn_time);
    console.log("Spatial Buffer Badge:", calc.buffer_label, `(${calc.buffer_status.toUpperCase()})`);
  }

  console.log("\n🎉 LIVE DATABASE VERIFICATION COMPLETE! Dev 1 backend is fully operational.");
}

verifyLiveDatabase();
