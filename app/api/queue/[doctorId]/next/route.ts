import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";
import { Doctor, Token } from "@/lib/types";
import { calculateDoctorVelocity } from "@/lib/queue-calculator";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ doctorId: string }> }
) {
  try {
    const { doctorId } = await params;
    const supabase = getServiceSupabase();
    const nowIso = new Date().toISOString();

    // 1. Fetch Doctor
    const { data: doctor, error: docErr } = await supabase
      .from("doctors")
      .select("*")
      .eq("id", doctorId)
      .single();

    if (docErr || !doctor) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
    }

    const doctorTyped = doctor as Doctor;

    let doctorNotes = null;
    let prescriptionText = null;
    try {
      const body = await request.json();
      if (body) {
        doctorNotes = body.doctor_notes || null;
        prescriptionText = body.prescription_text || null;
      }
    } catch (e) {
      // Body might be empty
    }

    // 2. Conclude currently active token (if any)
    const { data: activeTokens } = await supabase
      .from("tokens")
      .select("*")
      .eq("doctor_id", doctorId)
      .eq("status", "in-consultation");

    if (activeTokens && activeTokens.length > 0) {
      for (const t of activeTokens) {
        await supabase
          .from("tokens")
          .update({
            status: "completed",
            consultation_completed_at: nowIso,
            doctor_notes: doctorNotes,
            prescription_text: prescriptionText,
          })
          .eq("id", t.id);
      }
    }

    // 3. Auto-recalculate doctor velocity factor (AF-016)
    const { data: completedTokens } = await supabase
      .from("tokens")
      .select("*")
      .eq("doctor_id", doctorId)
      .eq("status", "completed")
      .order("consultation_completed_at", { ascending: true });

    const newVelocity = calculateDoctorVelocity(
      (completedTokens || []) as Token[],
      doctorTyped.velocity_factor
    );

    // 4. Find next waiting token
    const { data: waitingTokens } = await supabase
      .from("tokens")
      .select("*")
      .eq("doctor_id", doctorId)
      .eq("status", "waiting")
      .order("token_number", { ascending: true })
      .limit(1);

    const nextToken = waitingTokens && waitingTokens.length > 0 ? (waitingTokens[0] as Token) : null;
    const nextTokenNum = nextToken ? nextToken.token_number : doctorTyped.current_token + 1;

    // 5. Update Doctor current_token & velocity_factor
    const { error: updateDocErr } = await supabase
      .from("doctors")
      .update({
        current_token: nextTokenNum,
        velocity_factor: newVelocity,
        updated_at: nowIso,
      })
      .eq("id", doctorId);

    if (updateDocErr) {
      return NextResponse.json({ error: updateDocErr.message }, { status: 500 });
    }

    // 6. Set next token to 'in-consultation'
    if (nextToken) {
      await supabase
        .from("tokens")
        .update({
          status: "in-consultation",
          consultation_started_at: nowIso,
        })
        .eq("id", nextToken.id);
    }

    return NextResponse.json({
      success: true,
      current_token: nextTokenNum,
      active_token: nextToken,
      velocity_factor: newVelocity,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
