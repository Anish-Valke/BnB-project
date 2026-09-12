"use client";

import React, { useState } from "react";
import QRScannerModal from "@/components/QRScannerModal";
import PatientCheckInForm from "@/components/PatientCheckInForm";
import { QrCode, Stethoscope, Sparkles, Building2, ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function CheckInPage() {
  const [qrVerified, setQrVerified] = useState(false);
  const [hospitalInfo, setHospitalInfo] = useState<{ name: string; code: string } | null>(null);

  const handleQRScanSuccess = (info: { name: string; code: string }) => {
    setHospitalInfo(info);
    setQrVerified(true);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-50 py-10 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header Navigation */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Home
          </Link>

          <div className="flex items-center gap-2 text-xs font-medium text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-3 py-1.5 rounded-full border border-teal-200 dark:border-teal-800">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ArogyaFlow Smart Check-in</span>
          </div>
        </div>

        {/* Hero Header Banner */}
        <div className="text-center space-y-3">
          <div className="inline-flex p-3 bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-3xl mb-1 shadow-inner">
            <Stethoscope className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Hospital QR OPD Check-in
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 max-w-md mx-auto leading-relaxed">
            Scan hospital QR code, verify mobile via Fast2SMS OTP, choose Voice or Form intake, and let Gemini AI validate your registration.
          </p>
        </div>

        {/* QR Scanner Step or Check In Form */}
        {!qrVerified ? (
          <div className="space-y-4">
            <QRScannerModal onScanSuccess={handleQRScanSuccess} />
            <div className="text-center">
              <button
                onClick={() =>
                  handleQRScanSuccess({
                    name: "ArogyaFlow City General Hospital",
                    code: "HOSP-MUM-104",
                  })
                }
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
              >
                Skip QR Scan & Proceed to Check-in →
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-indigo-950 dark:text-indigo-100">
                    {hospitalInfo?.name || "ArogyaFlow City General Hospital"}
                  </h4>
                  <p className="text-[10px] text-indigo-600 dark:text-indigo-300 font-mono">
                    Facility Code: {hospitalInfo?.code || "HOSP-MUM-104"} • OPD Check-in Active
                  </p>
                </div>
              </div>
              <button
                onClick={() => setQrVerified(false)}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Re-scan QR
              </button>
            </div>

            <PatientCheckInForm />
          </div>
        )}
      </div>
    </div>
  );
}
