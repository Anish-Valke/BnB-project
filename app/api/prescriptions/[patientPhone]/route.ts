import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ patientPhone: string }> }
) {
  try {
    const { patientPhone } = await params;
    
    if (!patientPhone) {
      return NextResponse.json({ error: "Patient phone is required" }, { status: 400 });
    }

    const supabase = getServiceSupabase();

    // Fetch past completed tokens for this patient phone
    const { data: pastTokens, error } = await supabase
      .from("tokens")
      .select(`
        id,
        created_at,
        chief_complaint,
        doctor_notes,
        prescription_text,
        doctors (
          name,
          department
        )
      `)
      .eq("patient_phone", patientPhone)
      .eq("status", "completed")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching prescriptions:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const formattedPrescriptions = (pastTokens || []).map((t: any) => ({
      id: t.id,
      token_id: t.id,
      doctor_name: t.doctors?.name || "Unknown Doctor",
      department: t.doctors?.department || "General",
      date: new Date(t.created_at).toLocaleDateString(),
      chief_complaint: t.chief_complaint,
      doctor_notes: t.doctor_notes,
      prescription_text: t.prescription_text,
    }));

    return NextResponse.json({ prescriptions: formattedPrescriptions });
  } catch (error: any) {
    console.error("Internal API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
