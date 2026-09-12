import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";
import { Doctor, Token } from "@/lib/types";
import { calculateTokenWaitTime } from "@/lib/queue-calculator";
import { checkSafetyRules } from "@/lib/ai/safety-rules";
import { predictWaitDuration } from "@/lib/ai/gemini";
import { getDeterministicFallback } from "@/lib/ai/fallback";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { doctor_id, patient_name, patient_phone, chief_complaint, triage_level, predicted_mins } = body;

    if (!doctor_id || !patient_name || !chief_complaint || !patient_phone) {
      return NextResponse.json(
        { error: "Missing required fields: doctor_id, patient_name, chief_complaint" },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    // 1. Fetch Doctor
    const { data: doctor, error: docErr } = await supabase
      .from("doctors")
      .select("*")
      .eq("id", doctor_id)
      .single();

    if (docErr || !doctor) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
    }

    const doctorTyped = doctor as Doctor;

    // 2. Determine highest current token number for doctor
    const { data: maxTokenData } = await supabase
      .from("tokens")
      .select("token_number")
      .eq("doctor_id", doctor_id)
      .order("token_number", { ascending: false })
      .limit(1);

    const highestTokenNum = maxTokenData && maxTokenData.length > 0 ? maxTokenData[0].token_number : doctorTyped.current_token || 60;
    const newTokenNum = highestTokenNum + 1;

    // 3. Resolve duration prediction and triage level via AI / Fallback Pipeline
    let finalPredictedMins = predicted_mins;
    let finalTriageLevel = triage_level;
    let predictionSource = "provided";

    if (typeof finalPredictedMins !== "number" || !finalTriageLevel) {
      const trimmedComplaint = chief_complaint.trim();
      const safetyOverride = checkSafetyRules(trimmedComplaint);

      if (safetyOverride) {
        finalPredictedMins = safetyOverride.predicted_mins;
        finalTriageLevel = safetyOverride.triage_level;
        predictionSource = safetyOverride.source;
      } else {
        try {
          if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.trim() === "") {
            throw new Error("GEMINI_API_KEY missing");
          }
          const aiPrediction = await predictWaitDuration(trimmedComplaint);
          finalPredictedMins = aiPrediction.predicted_mins;
          finalTriageLevel = aiPrediction.triage_level;
          predictionSource = aiPrediction.source;
        } catch {
          const fallback = getDeterministicFallback(trimmedComplaint);
          finalPredictedMins = fallback.predicted_mins;
          finalTriageLevel = fallback.triage_level;
          predictionSource = fallback.source;
        }
      }
    }

    // 3. Create new token record
    const { data: newToken, error: insertErr } = await supabase
      .from("tokens")
      .insert([
        {
          token_number: newTokenNum,
          doctor_id: doctor_id,
          patient_name: patient_name,
          patient_phone: patient_phone,
          chief_complaint: chief_complaint,
          triage_level: finalTriageLevel,
          predicted_mins: finalPredictedMins,
          status: "waiting",
        },
      ])
      .select()
      .single();

    if (insertErr) {
      return NextResponse.json({ error: insertErr.message }, { status: 500 });
    }

    // 4. Calculate initial wait metrics
    const { data: allActiveTokens } = await supabase
      .from("tokens")
      .select("*")
      .eq("doctor_id", doctor_id)
      .in("status", ["in-consultation", "waiting"]);

    const calculatedMetrics = calculateTokenWaitTime(
      newToken as Token,
      doctorTyped,
      (allActiveTokens || []) as Token[]
    );

    return NextResponse.json(
      {
        token: newToken,
        token_number: newToken.token_number,
        predicted_mins: newToken.predicted_mins,
        triage_level: newToken.triage_level,
        prediction_source: predictionSource,
        estimated_wait_mins: calculatedMetrics.estimated_wait_mins,
        expected_turn_time: calculatedMetrics.expected_turn_time,
        buffer_status: calculatedMetrics.buffer_status,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
