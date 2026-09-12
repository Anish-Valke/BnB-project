import dotenv from "dotenv";
dotenv.config({ path: ".env" });
dotenv.config({ path: ".env.local" });

import { getServiceSupabase } from "../lib/supabase";
import { saveTokenForPhone, getTokensForPhone } from "../lib/patient-store";

async function testTokenCreation() {
  console.log("=== Testing Token Route Schema Fallback ===");
  const testPhone = "9876543210";
  const supabase = getServiceSupabase();

  const insertPayload: any = {
    token_number: 99,
    doctor_id: "doc_general_medicine_104",
    patient_name: "Test Patient",
    patient_phone: testPhone,
    chief_complaint: "High fever and cough",
    triage_level: "priority",
    predicted_mins: 10,
    status: "waiting",
  };

  let { data: newToken, error: insertErr } = await supabase
    .from("tokens")
    .insert([insertPayload])
    .select()
    .single();

  if (insertErr && (insertErr.message.includes("patient_phone") || insertErr.code === "PGRST204" || insertErr.message.includes("schema cache"))) {
    console.log("Schema fallback triggered as expected for missing patient_phone column:", insertErr.message);
    delete insertPayload.patient_phone;
    const retry = await supabase.from("tokens").insert([insertPayload]).select().single();
    newToken = retry.data;
    insertErr = retry.error;
  }

  console.log("Token Insertion Error:", insertErr);
  console.log("Token Insertion Data:", newToken);

  if (newToken) {
    saveTokenForPhone(testPhone, { ...newToken, patient_phone: testPhone });
    console.log("Retrieved Tokens For Phone:", getTokensForPhone(testPhone));
  }
}

testTokenCreation().catch(console.error);
