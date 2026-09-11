import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ doctorId: string }> }
) {
  try {
    const { doctorId } = await params;
    const body = await request.json().catch(() => ({}));
    const delayMins = typeof body.delay_mins === "number" ? body.delay_mins : 15;
    const isReset = Boolean(body.reset);

    const supabase = getServiceSupabase();

    // 1. Fetch current doctor
    const { data: doctor, error: docErr } = await supabase
      .from("doctors")
      .select("emergency_delay")
      .eq("id", doctorId)
      .single();

    if (docErr || !doctor) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
    }

    const newDelay = isReset ? 0 : (doctor.emergency_delay || 0) + delayMins;

    // 2. Update emergency delay
    const { error: updateErr } = await supabase
      .from("doctors")
      .update({
        emergency_delay: newDelay,
        updated_at: new Date().toISOString(),
      })
      .eq("id", doctorId);

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      total_emergency_delay: newDelay,
      added_delay_mins: isReset ? 0 : delayMins,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
