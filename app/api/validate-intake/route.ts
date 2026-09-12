import { NextRequest, NextResponse } from "next/server";
import { validateAndTriageIntake } from "@/lib/ai/intake-validator";
import { PatientIntakeData } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const intake: PatientIntakeData = await request.json();

    if (!intake.patient_name || !intake.chief_complaint) {
      return NextResponse.json(
        { error: "Missing required patient fields: patient_name and chief_complaint" },
        { status: 400 }
      );
    }

    const validationResult = await validateAndTriageIntake(intake);

    return NextResponse.json(validationResult);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Intake validation failed" }, { status: 500 });
  }
}
