"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function CheckInPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect directly to Patient Portal Sidebar Dashboard on OPD Registration tab
    router.replace("/patient/dashboard?tab=opd-registration");
  }, [router]);

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
      <div className="flex items-center gap-3 text-sm text-gray-500 font-medium">
        <Loader2 className="w-5 h-5 animate-spin text-primary" />
        <span>Loading Patient OPD Registration Portal...</span>
      </div>
    </div>
  );
}
