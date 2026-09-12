"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Stethoscope,
  Activity,
  FileText,
  Sparkles,
  Bot,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
} from "lucide-react";
import PhoneOtpModal from "./PhoneOtpModal";
import AiChatModal from "./AiChatModal";
import { Doctor, PatientIntakeData, GeminiValidationResult } from "@/lib/types";
import { getPatientPhoneSession, setPatientPhoneSession } from "@/lib/patient-session";
import { parseAge } from "@/lib/age-parser";
import GlassCard from "./ui/GlassCard";
import Button from "./ui/Button";

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

  // Form intake state
  const [patientName, setPatientName] = useState(initialPatientName || "");
  const [age, setAge] = useState(initialAge ? String(initialAge) : "");
  const [gender, setGender] = useState(initialGender || "Male");
  const [chiefComplaint, setChiefComplaint] = useState("");
  const [priorHistory, setPriorHistory] = useState(initialPriorHistory || "");

  // Update states if props update dynamically
  useEffect(() => {
    if (initialPhone) {
      setVerifiedPhone(initialPhone.replace(/\D/g, "")); // eslint-disable-line react-hooks/set-state-in-effect
      setPhoneVerified(true);
    }
    if (initialPatientName) setPatientName(initialPatientName); // eslint-disable-line react-hooks/set-state-in-effect
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
  }, [doctors]);

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
    } catch (err: unknown) {
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

    const parsedAge = age ? parseAge(age) : null;
    if (age && parsedAge === null) {
      setErrorMsg("Please enter a valid age between 0 and 120 (e.g. 35).");
      return;
    }

    const payload: PatientIntakeData = {
      patient_name: patientName.trim(),
      phone: verifiedPhone || "9876543210",
      age: parsedAge !== null ? parsedAge : 35,
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

      // 4. Redirect to dashboard
      router.push(`/patient/dashboard?tab=dashboard`);
    } catch (err: unknown) {
      setErrorMsg((err as Error).message || "An unexpected error occurred during check-in.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-6">

      {/* Fast2SMS Phone OTP Verification Step */}
      {!phoneVerified ? (
        <PhoneOtpModal onVerified={handlePhoneVerified} />
      ) : (
        <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-3xl flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-emerald-800">
                Fast2SMS Verified Mobile
              </p>
              <p className="text-xs font-mono text-emerald-600">{verifiedPhone}</p>
            </div>
          </div>
          <button
            onClick={() => setPhoneVerified(false)}
            className="text-xs font-medium text-emerald-700 hover:underline"
          >
            Change Phone
          </button>
        </div>
      )}

      {/* Main Patient Intake Form / Voice Call Container */}
      <GlassCard className="space-y-8 p-8">
        <div className="flex items-center justify-between pb-6 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <span>OPD Details</span>
              <span className="px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold rounded-full bg-primary/10 text-primary">
                Step 2 of 2
              </span>
            </h2>
            <p className="text-sm text-gray-500 mt-1">Provide details for Gemini AI triage & token generation</p>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center p-1 bg-surface rounded-2xl border border-gray-100 text-xs font-medium">
            <button
              type="button"
              onClick={() => setIntakeMode("form")}
              className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 ${
                intakeMode === "form"
                  ? "bg-white text-foreground shadow-sm font-semibold border border-gray-100"
                  : "text-gray-500 hover:text-foreground"
              }`}
            >
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Manual Form</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setIntakeMode("voice");
                setShowVoiceCallModal(true);
              }}
              className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 ${
                intakeMode === "voice"
                  ? "bg-primary text-white shadow-sm font-semibold"
                  : "text-primary hover:bg-primary/5"
              }`}
            >
              <Bot className="w-4 h-4" />
              <span className="hidden sm:inline">AI Chat</span>
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-xs flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Doctor Selection */}
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Stethoscope className="w-4 h-4 text-primary" />
            Select Doctor / Department
          </label>
          <select
            value={selectedDoctorId}
            onChange={(e) => setSelectedDoctorId(e.target.value)}
            className="w-full px-4 py-3 bg-surface border border-gray-200 rounded-2xl text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all cursor-pointer"
          >
            {doctors.map((doc) => (
              <option key={doc.id} value={doc.id}>
                {doc.name} — {doc.department} ({doc.room_number})
              </option>
            ))}
          </select>
        </div>

        {/* Form Intake View */}
        <form onSubmit={handleSubmitCheckIn} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <User className="w-4 h-4 text-gray-400" />
                Patient Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Ramesh Kumar"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                className="w-full px-4 py-3 bg-surface border border-gray-200 rounded-2xl text-sm font-medium text-foreground placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Age
                </label>
                <input
                  type="number"
                  placeholder="e.g. 42"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full px-4 py-3 bg-surface border border-gray-200 rounded-2xl text-sm font-medium text-foreground placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Gender
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-4 py-3 bg-surface border border-gray-200 rounded-2xl text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-primary" />
                Symptoms / Chief Complaint *
              </label>
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
                className="text-xs text-secondary hover:text-primary transition-colors flex items-center gap-1 font-bold disabled:opacity-40"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Verify with Gemini AI
              </button>
            </div>
            <textarea
              required
              rows={3}
              placeholder="Describe your health symptoms in detail (e.g., High fever for 2 days, severe body pain, and sore throat)"
              value={chiefComplaint}
              onChange={(e) => setChiefComplaint(e.target.value)}
              className="w-full px-4 py-3 bg-surface border border-gray-200 rounded-2xl text-sm font-medium text-foreground placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              Prior Medical History / Allergies (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Hypertension, Diabetes, Asthma"
              value={priorHistory}
              onChange={(e) => setPriorHistory(e.target.value)}
              className="w-full px-4 py-3 bg-surface border border-gray-200 rounded-2xl text-sm font-medium text-foreground placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>

          {/* Gemini Validation Feedback Banner */}
          {isValidatingGemini && (
            <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-700 text-sm flex items-center gap-3 font-medium">
              <RefreshCw className="w-5 h-5 animate-spin text-indigo-600" />
              <span>Gemini 3.6 Flash AI is analyzing data sanity & triaging complaint...</span>
            </div>
          )}

          {geminiResult && !isValidatingGemini && (
            <div
              className={`p-5 rounded-2xl border text-sm space-y-2 ${
                geminiResult.isValid
                  ? "bg-emerald-50 border-emerald-100 text-emerald-900"
                  : "bg-red-50 border-red-100 text-red-900"
              }`}
            >
              <div className="flex items-center justify-between font-bold">
                <span className="flex items-center gap-2">
                  <Sparkles className={`w-5 h-5 ${geminiResult.isValid ? "text-emerald-500" : "text-red-500"}`} />
                  Gemini AI Verification
                </span>
                <span
                  className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${
                    geminiResult.triageLevel === "express"
                      ? "bg-red-100 text-red-700"
                      : geminiResult.triageLevel === "priority"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-emerald-100 text-emerald-800"
                  }`}
                >
                  Triage: {geminiResult.triageLevel || "routine"}
                </span>
              </div>
              <p className="text-xs opacity-90 leading-relaxed font-medium">{geminiResult.reasoning}</p>
              {geminiResult.sanitizedSummary && (
                <p className="text-xs font-mono text-gray-600 mt-2 p-3 bg-white/50 rounded-xl border border-white/20">
                  Doctor Summary: &quot;{geminiResult.sanitizedSummary}&quot; ({geminiResult.predictedMins} mins predicted)
                </p>
              )}
            </div>
          )}

          <div className="pt-4 border-t border-gray-100">
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting || !phoneVerified}
              className="w-full py-4 text-sm"
            >
              {isSubmitting ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5 mr-2" />
                  <span>Verify & Issue Token</span>
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </div>
        </form>
      </GlassCard>

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
