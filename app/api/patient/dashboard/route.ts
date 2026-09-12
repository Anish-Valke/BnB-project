import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";
import { Doctor, Token } from "@/lib/types";
import { calculateTokenWaitTime } from "@/lib/queue-calculator";
import { getPatientByPhone, getTokensForPhone } from "@/lib/patient-store";

const MOCK_PRESCRIPTIONS = [
  {
    id: "pres_1",
    token_number: 45,
    doctor_name: "Dr. Anjali Sharma",
    department: "General Medicine",
    date: "10 Sep 2026",
    chief_complaint: "High fever (102°F) and severe body ache",
    doctor_notes: "Fever settled. Patient advised complete rest and hydration.",
    prescription_text: "1. Tab Paracetamol 650mg - 1-0-1 (3 days)\n2. Tab Vitamin C 500mg - 1-0-0 (5 days)\n3. Drink 3L warm water daily.",
  },
  {
    id: "pres_2",
    token_number: 32,
    doctor_name: "Dr. Vikram Mehta",
    department: "Cardiology",
    date: "24 Aug 2026",
    chief_complaint: "Routine Blood Pressure Follow-up",
    doctor_notes: "BP stable at 125/80 mmHg. ECG normal.",
    prescription_text: "1. Tab Telmisartan 40mg - 1-0-0 (30 days)\n2. Low sodium diet.",
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get("phone")?.replace(/\D/g, "");

    if (!phone) {
      return NextResponse.json({ error: "Phone parameter is required" }, { status: 400 });
    }

    const supabase = getServiceSupabase();

    // 1. Fetch Patient Profile
    let patient = await getPatientByPhone(phone);
    if (!patient) {
      patient = {
        id: `pat_${Date.now()}`,
        phone,
        name: "Registered Patient",
        age: 35,
        gender: "Male",
        prior_history: "None recorded",
      };
    }

    // 2. Fetch Active Token for Patient (Linked by phone)
    let activeToken: any = null;
    let calculatedMetrics = null;
    let doctorInfo: Doctor | null = null;
    let dbActiveSuccess = false;

    try {
      const { data: activeTokens, error: actErr } = await supabase
        .from("tokens")
        .select("*, doctors(*)")
        .eq("patient_phone", phone)
        .in("status", ["waiting", "in-consultation"])
        .order("created_at", { ascending: false })
        .limit(1);

      if (!actErr) {
        dbActiveSuccess = true;
        if (activeTokens && activeTokens.length > 0) {
          activeToken = activeTokens[0];
          doctorInfo = activeToken.doctors as Doctor;
        }
      }
    } catch {
      // Fallback DB error
    }

    // Check memory store fallback ONLY if DB query failed completely
    if (!activeToken && !dbActiveSuccess) {
      const memTokens = getTokensForPhone(phone);
      const activeMem = memTokens.find((t: any) => t.status === "waiting" || t.status === "in-consultation");
      if (activeMem) {
        activeToken = activeMem;
      }
    }

    if (activeToken) {
      if (!doctorInfo) {
        doctorInfo = {
          id: activeToken.doctor_id || "doc_general_medicine_104",
          name: "Dr. Anjali Sharma",
          department: "General Medicine",
          room_number: "Room 104",
          current_token: 60,
          velocity_factor: 1.0,
          emergency_delay: 0,
        };
      }

      try {
        const { data: allActiveTokens } = await supabase
          .from("tokens")
          .select("*")
          .eq("doctor_id", activeToken.doctor_id)
          .in("status", ["in-consultation", "waiting"]);

        calculatedMetrics = calculateTokenWaitTime(
          activeToken as Token,
          doctorInfo,
          (allActiveTokens || []) as Token[]
        );
      } catch {
        calculatedMetrics = calculateTokenWaitTime(activeToken as Token, doctorInfo, [activeToken as Token]);
      }
    }

    // 3. Prescriptions & Completed History (Linked by phone)
    let prescriptions: any[] = [];
    let dbPresSuccess = false;

    try {
      const { data: completedTokens, error: compErr } = await supabase
        .from("tokens")
        .select("*, doctors(*)")
        .eq("patient_phone", phone)
        .eq("status", "completed")
        .order("created_at", { ascending: false });

      if (!compErr) {
        dbPresSuccess = true;
        if (completedTokens && completedTokens.length > 0) {
          prescriptions = completedTokens.map((t: any) => ({
            id: t.id,
            token_number: t.token_number,
            doctor_name: t.doctors?.name || "Dr. Anjali Sharma",
            department: t.doctors?.department || "General Medicine",
            date: new Date(t.consultation_completed_at || t.created_at).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            }),
            chief_complaint: t.chief_complaint,
            doctor_notes: t.doctor_notes || "Patient consulted. Recovery on track.",
            prescription_text:
              t.prescription_text ||
              "1. Tab Paracetamol 500mg - 1-0-1 (3 days)\n2. Tab Cetirizine 10mg - 0-0-1 (5 days)\n3. Drink warm fluids.",
          }));
        }
      }
    } catch {
      // Ignore
    }

    if (prescriptions.length === 0 && !dbPresSuccess) {
      const memTokens = getTokensForPhone(phone);
      const completedMem = memTokens.filter((t: any) => t.status === "completed");
      if (completedMem.length > 0) {
        prescriptions = completedMem.map((t: any) => ({
          id: t.id,
          token_number: t.token_number,
          doctor_name: "Dr. Anjali Sharma",
          department: "General Medicine",
          date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
          chief_complaint: t.chief_complaint,
          doctor_notes: t.doctor_notes || "Consultation completed.",
          prescription_text: t.prescription_text || "1. Tab Paracetamol 500mg\n2. Hydration & Rest",
        }));
      } else {
        prescriptions = MOCK_PRESCRIPTIONS;
      }
    }



    return NextResponse.json({
      patient,
      active_token: activeToken,
      calculated_metrics: calculatedMetrics,
      doctor: doctorInfo,
      prescriptions,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch patient dashboard" }, { status: 500 });
  }
}
