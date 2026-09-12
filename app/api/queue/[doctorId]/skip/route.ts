import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";
import { Doctor, Token } from "@/lib/types";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ doctorId: string }> }
) {
  try {
    const { doctorId } = await params;
    const body = await request.json().catch(() => ({}));
    const targetTokenNum = typeof body.token_number === "number" ? body.token_number : null;

    const supabase = getServiceSupabase();
    const nowIso = new Date().toISOString();

    // Fetch Doctor
    const { data: doctor, error: docErr } = await supabase
      .from("doctors")
      .select("*")
      .eq("id", doctorId)
      .single();

    if (docErr || !doctor) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
    }

    const doctorTyped = doctor as Doctor;

    // Find token to skip
    let tokenToSkip: Token | null = null;

    if (targetTokenNum) {
      const { data } = await supabase
        .from("tokens")
        .select("*")
        .eq("doctor_id", doctorId)
        .eq("token_number", targetTokenNum)
        .single();
      tokenToSkip = data as Token | null;
    } else {
      // Default to current active token or lowest waiting token
      const { data } = await supabase
        .from("tokens")
        .select("*")
        .eq("doctor_id", doctorId)
        .in("status", ["in-consultation", "waiting"])
        .order("token_number", { ascending: true })
        .limit(1);
      if (data && data.length > 0) {
        tokenToSkip = data[0] as Token;
      }
    }

    if (!tokenToSkip) {
      return NextResponse.json({ error: "No token found to skip" }, { status: 404 });
    }

    // Find current max token number
    const { data: maxTokenData } = await supabase
      .from("tokens")
      .select("token_number")
      .eq("doctor_id", doctorId)
      .order("token_number", { ascending: false })
      .limit(1);
      
    const newMaxToken = (maxTokenData && maxTokenData.length > 0) 
      ? maxTokenData[0].token_number + 1 
      : tokenToSkip.token_number + 1;

    // Push to the back of the queue instead of skipping entirely
    await supabase
      .from("tokens")
      .update({ 
        status: "waiting",
        token_number: newMaxToken
      })
      .eq("id", tokenToSkip.id);

    // Call next waiting token
    const { data: nextWaiting } = await supabase
      .from("tokens")
      .select("*")
      .eq("doctor_id", doctorId)
      .eq("status", "waiting")
      .order("token_number", { ascending: true })
      .limit(1);

    const newActiveToken = nextWaiting && nextWaiting.length > 0 ? (nextWaiting[0] as Token) : null;
    const newCurrentTokenNum = newActiveToken ? newActiveToken.token_number : doctorTyped.current_token;

    if (newActiveToken) {
      await supabase
        .from("tokens")
        .update({
          status: "in-consultation",
          consultation_started_at: nowIso,
        })
        .eq("id", newActiveToken.id);

      await supabase
        .from("doctors")
        .update({
          current_token: newCurrentTokenNum,
          updated_at: nowIso,
        })
        .eq("id", doctorId);
    }

    return NextResponse.json({
      success: true,
      skipped_token: tokenToSkip.token_number,
      new_active_token: newCurrentTokenNum,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
