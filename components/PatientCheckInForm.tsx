"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Phone,
  Stethoscope,
  Activity,
  FileText,
  Sparkles,
  Bot,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  PhoneCall,
  CheckCircle2,
} from "lucide-react";
import LocationCheckCard from "./LocationCheckCard";
import PhoneOtpModal from "./PhoneOtpModal";
import AiChatModal from "./AiChatModal";
import { Doctor, LocationVerification, PatientIntakeData, GeminiValidationResult } from "@/lib/types";
import { getPatientPhoneSession, setPatientPhoneSession } from "@/lib/patient-session";

interface PatientCheckInFormProps {
  initialDoctors?: Doctor[];
  initialPhone?: string;
  initialPatientName?: string;
  initialAge?: number;
  initialGender?: string;
  initialPriorHistory?: string;
}

const DEFAULT_DOCTORS: Doctor[] = [
  {
    id: "doc_general_medicine_104",
    name: "Dr. Anjali Sharma",
    department: "General Medicine",
    room_number: "Room 104",
    current_token: 60,
    velocity_factor: 1.0,
    emergency_delay: 0,
  },
  {
    id: "doc_cardiology_201",
    name: "Dr. Vikram Mehta",
    department: "Cardiology",
    room_number: "Room 201",
    current_token: 25,
    velocity_factor: 1.1,
    emergency_delay: 5,
  },
  {
    id: "doc_orthopedics_108",
    name: "Dr. Rajesh Iyer",
    department: "Orthopedics",
    room_number: "Room 108",
    current_token: 15,
    velocity_factor: 0.9,
    emergency_delay: 0,
  },
];

export default function PatientCheckInForm({
  initialDoctors,
  initialPhone,
  initialPatientName,
  initialAge,
  initialGender,
  initialPriorHistory,
}: PatientCheckInFormProps) {
  const router = useRouter();

  const activeSessionPhone = initialPhone || (typeof window !== "undefined" ? getPatientPhoneSession() : null);

  const [doctors, setDoctors] = useState<Doctor[]>(initialDoctors && initialDoctors.length > 0 ? initialDoctors : DEFAULT_DOCTORS);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>(doctors[0]?.id || "");
  const [phoneVerified, setPhoneVerified] = useState<boolean>(() => !!(activeSessionPhone && activeSessionPhone.replace(/\D/g, "").length >= 10));
  const [verifiedPhone, setVerifiedPhone] = useState<string>(() => (activeSessionPhone ? activeSessionPhone.replace(/\D/g, "") : ""));
  const [locationVerification, setLocationVerification] = useState<LocationVerification | null>(null);

  // Form intake state
  const [patientName, setPatientName] = useState(initialPatientName || "");
  const [age, setAge] = useState(initialAge ? String(initialAge) : "");
  const [gender, setGender] = useState(initialGender || "Male");
  const [chiefComplaint, setChiefComplaint] = useState("");
  const [priorHistory, setPriorHistory] = useState(initialPriorHistory || "");

  // Update states if props update dynamically
  useEffect(() => {
    if (initialPhone) {
      setVerifiedPhone(initialPhone.replace(/\D/g, ""));
      setPhoneVerified(true);
    }
    if (initialPatientName) setPatientName(initialPatientName);
    if (initialAge) setAge(String(initialAge));
    if (initialGender) setGender(initialGender);
    if (initialPriorHistory) setPriorHistory(initialPriorHistory);
  }, [initialPhone, initialPatientName, initialAge, initialGender, initialPriorHistory]);


  // UI state
  const [intakeMode, setIntakeMode] = useState<"form" | "voice">("form");
  const [showVoiceCallModal, setShowVoiceCallModal] = useState(false);
  const [isValidatingGemini, setIsValidatingGemini] = useState(false);
  const [geminiResult, setGeminiResult] = useState<GeminiValidationResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    // Attempt fetching live doctors from queue route
    fetch(`/api/queue/${doctors[0]?.id || "doc_general_medicine_104"}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.doctor) {
          setDoctors((prev) => {
            if (!prev.some((d) => d.id === data.doctor.id)) {
              return [data.doctor, ...prev];
            }
            return prev;
          });
        }
      })
      .catch(() => {});
  }, []);

  const handlePhoneVerified = (phone: string) => {
    setVerifiedPhone(phone);
    setPhoneVerified(true);
  };

  const handleVoiceBotCompleted = (voiceData: PatientIntakeData) => {
    setShowVoiceCallModal(false);
    setPatientName(voiceData.patient_name);
    setAge(voiceData.age ? String(voiceData.age) : "35");
    setChiefComplaint(voiceData.chief_complaint);
    if (voiceData.prior_history) setPriorHistory(voiceData.prior_history);
    if (voiceData.doctor_id) setSelectedDoctorId(voiceData.doctor_id);

    // Auto trigger Gemini validation
    triggerGeminiValidation({
      patient_name: voiceData.patient_name,
      phone: verifiedPhone || voiceData.phone,
      age: voiceData.age,
      chief_complaint: voiceData.chief_complaint,
      doctor_id: voiceData.doctor_id || selectedDoctorId,
      prior_history: voiceData.prior_history,
    });
  };

  const triggerGeminiValidation = async (payload: PatientIntakeData): Promise<GeminiValidationResult | null> => {
    setIsValidatingGemini(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/validate-intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data: GeminiValidationResult = await res.json();
      setGeminiResult(data);
      return data;
    } catch (err: any) {
      console.warn("Gemini validation call error:", err);
      return null;
    } finally {
      setIsValidatingGemini(false);
    }
  };

  const handleSubmitCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!patientName.trim()) {
      setErrorMsg("Please enter your full name.");
      return;
    }
    if (!chiefComplaint.trim()) {
      setErrorMsg("Please enter your medical symptoms / chief complaint.");
      return;
    }

    const payload: PatientIntakeData = {
      patient_name: patientName.trim(),
      phone: verifiedPhone || "9876543210",
      age: age ? Number(age) : 35,
      gender,
      doctor_id: selectedDoctorId,
      chief_complaint: chiefComplaint.trim(),
      prior_history: priorHistory.trim(),
    };

    setIsSubmitting(true);

    try {
      // 1. Run Gemini AI Verification
      const validation = geminiResult || (await triggerGeminiValidation(payload));

      if (validation && validation.isValid === false) {
        setErrorMsg(validation.validationError || "Gemini AI flagged the input data as invalid. Please revise.");
        setIsSubmitting(false);
        return;
      }

      // 2. Register / Upsert Patient Profile in Database & Local Session
      try {
        const profRes = await fetch("/api/patient/profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phone: payload.phone,
            name: payload.patient_name,
            age: payload.age,
            gender: payload.gender,
            prior_history: payload.prior_history,
          }),
        });
        const profData = await profRes.json();
        if (profData.patient) {
          setPatientPhoneSession(payload.phone, profData.patient);
        }
      } catch (profErr) {
        console.warn("Profile save notice:", profErr);
      }

      // 3. Issue Token via API with full patient details
      const tokenRes = await fetch("/api/tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctor_id: selectedDoctorId,
          patient_name: payload.patient_name,
          patient_phone: payload.phone,
          age: payload.age,
          gender: payload.gender,
          prior_history: payload.prior_history,
          chief_complaint: validation?.sanitizedSummary || payload.chief_complaint,
          triage_level: validation?.triageLevel || "routine",
          predicted_mins: validation?.predictedMins || 8,
        }),
      });

      const tokenData = await tokenRes.json();

      if (!tokenRes.ok || tokenData.error) {
        throw new Error(tokenData.error || "Failed to generate token");
      }

      const tokenNum = tokenData.token_number || tokenData.token?.token_number;

      // 4. Redirect to live patient queue tracker
      router.push(`/patient/${tokenNum}?doctorId=${selectedDoctorId}`);
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred during check-in.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-6">
      {/* 1. Hospital Location Proximity Check */}
      <LocationCheckCard onVerified={(loc) => setLocationVerification(loc)} />

      {/* 2. Fast2SMS Phone OTP Verification Step */}
      {!phoneVerified ? (
        <PhoneOtpModal onVerified={handlePhoneVerified} />
      ) : (
        <div className="p-4 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 rounded-3xl flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-teal-500 text-white flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-teal-950 dark:text-teal-200">
                Fast2SMS Verified Mobile
              </p>
              <p className="text-xs font-mono text-teal-700 dark:text-teal-400">{verifiedPhone}</p>
            </div>
          </div>
          <button
            onClick={() => setPhoneVerified(false)}
            className="text-xs font-medium text-teal-700 dark:text-teal-300 hover:underline"
          >
            Change Phone
          </button>
        </div>
      )}

      {/* 3. Main Patient Intake Form / Voice Call Container */}
      <div className="p-6 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xl space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <span>Patient OPD Registration</span>
              <span className="px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold rounded-full bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300">
                Step 2 of 2
              </span>
            </h2>
            <p className="text-xs text-zinc-500">Provide details for Gemini AI triage & token generation</p>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center p-1 bg-zinc-100 dark:bg-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-700 text-xs font-medium">
            <button
              type="button"
              onClick={() => setIntakeMode("form")}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                intakeMode === "form"
                  ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm font-semibold"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Manual Form</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setIntakeMode("voice");
                setShowVoiceCallModal(true);
              }}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                intakeMode === "voice"
                  ? "bg-teal-600 text-white shadow-sm font-semibold"
                  : "text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/40"
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              <span>AI Chat</span>
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Doctor Selection */}
        <div>
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 flex items-center gap-1.5">
            <Stethoscope className="w-4 h-4 text-teal-600" />
            Select Doctor / Department
          </label>
          <select
            value={selectedDoctorId}
            onChange={(e) => setSelectedDoctorId(e.target.value)}
            className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-xs font-medium text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all cursor-pointer"
          >
            {doctors.map((doc) => (
              <option key={doc.id} value={doc.id}>
                {doc.name} — {doc.department} ({doc.room_number})
              </option>
            ))}
          </select>
        </div>

        {/* Form Intake View */}
        <form onSubmit={handleSubmitCheckIn} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-zinc-400" />
                Patient Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Ramesh Kumar"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Age
                </label>
                <input
                  type="number"
                  placeholder="e.g. 42"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full px-3 py-3 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Gender
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-2 py-3 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-teal-600" />
                Symptoms / Chief Complaint *
              </span>
              <button
                type="button"
                onClick={() => {
                  if (patientName && chiefComplaint) {
                    triggerGeminiValidation({
                      patient_name: patientName,
                      phone: verifiedPhone || "9876543210",
                      chief_complaint: chiefComplaint,
                      doctor_id: selectedDoctorId,
                    });
                  }
                }}
                disabled={!chiefComplaint || isValidatingGemini}
                className="text-[11px] text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 font-medium disabled:opacity-40"
              >
                <Sparkles className="w-3 h-3" />
                Verify with Gemini AI
              </button>
            </label>
            <textarea
              required
              rows={3}
              placeholder="Describe your health symptoms in detail (e.g., High fever for 2 days, severe body pain, and sore throat)"
              value={chiefComplaint}
              onChange={(e) => setChiefComplaint(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Prior Medical History / Allergies (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Hypertension, Diabetes, Asthma"
              value={priorHistory}
              onChange={(e) => setPriorHistory(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Gemini Validation Feedback Banner */}
          {isValidatingGemini && (
            <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs flex items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
              <span>Gemini 3.6 Flash AI is analyzing data sanity & triaging complaint...</span>
            </div>
          )}

          {geminiResult && !isValidatingGemini && (
            <div
              className={`p-4 rounded-2xl border text-xs space-y-1.5 ${
                geminiResult.isValid
                  ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200"
                  : "bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800 text-red-900 dark:text-red-200"
              }`}
            >
              <div className="flex items-center justify-between font-semibold">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  Gemini AI Verification & Triage
                </span>
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                    geminiResult.triageLevel === "express"
                      ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200"
                      : geminiResult.triageLevel === "priority"
                      ? "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
                      : "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200"
                  }`}
                >
                  Triage: {geminiResult.triageLevel || "routine"}
                </span>
              </div>
              <p className="text-[11px] opacity-90">{geminiResult.reasoning}</p>
              {geminiResult.sanitizedSummary && (
                <p className="text-[11px] font-mono text-zinc-600 dark:text-zinc-400">
                  Doctor Summary: &quot;{geminiResult.sanitizedSummary}&quot; ({geminiResult.predictedMins} mins predicted)
                </p>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || !phoneVerified}
            className="w-full py-4 px-6 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-semibold text-sm rounded-2xl transition-all shadow-xl shadow-teal-600/25 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <ShieldCheck className="w-5 h-5" />
                <span>Verify & Issue Token</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* AI Chat Modal Trigger */}
      {showVoiceCallModal && (
        <AiChatModal
          phone={verifiedPhone || "9876543210"}
          doctors={doctors}
          onCompleted={handleVoiceBotCompleted}
          onCancel={() => setShowVoiceCallModal(false)}
        />
      )}
    </div>
  );
}
