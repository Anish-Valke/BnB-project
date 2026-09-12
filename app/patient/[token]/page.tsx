import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import PatientTrackerClient from "@/components/PatientTrackerClient";

export default async function PatientPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const tokenNum = parseInt(token);

  if (isNaN(tokenNum)) {
    return notFound();
  }

  // 1. Fetch the target token to know which doctor they belong to
  const { data: heroToken, error: tokenError } = await supabase
    .from("tokens")
    .select("*")
    .eq("token_number", tokenNum)
    // In a real app we might need to filter by status or created_at to avoid old tokens.
    // Assuming the highest ID or latest created for this token number.
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (tokenError || !heroToken) {
    // If not found in DB, fallback to notFound() or show an error
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-800">Token Not Found</h2>
          <p className="text-slate-500 mt-2">Could not locate Token #{tokenNum} in the active queue.</p>
        </div>
      </div>
    );
  }

  // 2. Fetch the doctor
  const { data: doctor, error: doctorError } = await supabase
    .from("doctors")
    .select("*")
    .eq("id", heroToken.doctor_id)
    .single();

  if (doctorError || !doctor) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <h2 className="text-2xl font-bold text-slate-800">Doctor Not Found</h2>
      </div>
    );
  }

  // 3. Fetch all active tokens for this doctor to pass as initial state
  const { data: allTokens } = await supabase
    .from("tokens")
    .select("*")
    .eq("doctor_id", doctor.id);

  return (
    <PatientTrackerClient 
      initialDoctor={doctor} 
      initialTokens={allTokens || []} 
      heroToken={heroToken} 
    />
  );
}
