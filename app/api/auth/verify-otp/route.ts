import { NextRequest, NextResponse } from "next/server";
import { verifyFast2SMSOtp } from "@/lib/fast2sms";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, otp } = body;

    if (!phone || !otp) {
      return NextResponse.json({ error: "Phone number and OTP code are required" }, { status: 400 });
    }

    const result = verifyFast2SMSOtp(phone, otp);

    if (!result.valid) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: result.message });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "OTP verification failed" }, { status: 500 });
  }
}
