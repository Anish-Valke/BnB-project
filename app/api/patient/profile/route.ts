import { NextRequest, NextResponse } from "next/server";
import { getPatientByPhone, upsertPatientProfile } from "@/lib/patient-store";
import { parseAge } from "@/lib/age-parser";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rawPhone = searchParams.get("phone");

    if (!rawPhone) {
      return NextResponse.json({ error: "Phone parameter is required" }, { status: 400 });
    }

    const patient = await getPatientByPhone(rawPhone);
    if (patient) {
      return NextResponse.json({ found: true, patient }, { status: 200 });
    }

    return NextResponse.json({ found: false, phone: rawPhone }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch profile" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, name, age, gender, prior_history } = body;

    if (!phone || String(phone).replace(/\D/g, "").length < 10) {
      return NextResponse.json({ error: "Valid 10-digit mobile number is required" }, { status: 400 });
    }

    if (!name || name.trim() === "") {
      return NextResponse.json({ error: "Patient name is required" }, { status: 400 });
    }

    const parsedAge = age !== undefined && age !== null ? parseAge(age) : null;

    const patient = await upsertPatientProfile({
      phone: String(phone),
      name: String(name),
      age: parsedAge !== null ? parsedAge : undefined,
      gender: gender ? String(gender) : undefined,
      prior_history: prior_history ? String(prior_history) : undefined,
    });

    return NextResponse.json({ success: true, patient }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to save patient profile" }, { status: 500 });
  }
}

