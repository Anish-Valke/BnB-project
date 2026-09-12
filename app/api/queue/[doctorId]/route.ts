import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";
import { Doctor, Token } from "@/lib/types";
import { calculateTokenWaitTime } from "@/lib/queue-calculator";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ doctorId: string }> }
) {
  try {
    const { doctorId } = await params;
    const searchParams = request.nextUrl.searchParams;
    const targetTokenNumStr = searchParams.get("token");

    const supabase = getServiceSupabase();

    // 1. Fetch Doctor
    const { data: doctor, error: docErr } = await supabase
      .from("doctors")
      .select("*")
      .eq("id", doctorId)
      .single();

    if (docErr || !doctor) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
    }

    // 2. Fetch Doctor's active and waiting tokens
    const { data: tokens, error: tokensErr } = await supabase
      .from("tokens")
      .select("*")
      .eq("doctor_id", doctorId)
      .in("status", ["in-consultation", "waiting"])
      .order("token_number", { ascending: true });

    if (tokensErr) {
      return NextResponse.json({ error: tokensErr.message }, { status: 500 });
    }

    const doctorTyped = doctor as Doctor;
    const tokensTyped = (tokens || []) as Token[];

    const currentServing = tokensTyped.find(
      (t) => t.token_number === doctorTyped.current_token || t.status === "in-consultation"
    ) || null;

    let calculatedHeroToken = null;

    if (targetTokenNumStr) {
      const targetTokenNum = parseInt(targetTokenNumStr, 10);
      const targetToken = tokensTyped.find((t) => t.token_number === targetTokenNum);
      
      if (targetToken) {
        calculatedHeroToken = calculateTokenWaitTime(targetToken, doctorTyped, tokensTyped);
      }
    }

    return NextResponse.json({
      doctor: doctorTyped,
      queue: tokensTyped,
      current_serving: currentServing,
      calculated_hero_token: calculatedHeroToken,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
