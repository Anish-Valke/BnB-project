"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  FileText,
  Pill,
  User,
  LogOut,
  Stethoscope,
  Activity,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Sparkles,
  RefreshCw,
  Building2,
  Clock,
  PlusCircle,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import PhoneOtpModal from "@/components/PhoneOtpModal";
import PatientCheckInForm from "@/components/PatientCheckInForm";
import StatusBadge from "@/components/StatusBadge";
import HindiVoiceButton from "@/components/HindiVoiceButton";
import {
  getPatientPhoneSession,
  setPatientPhoneSession,
  clearPatientSession,
  getCachedPatientProfile,
} from "@/lib/patient-session";
import { PatientProfile, Prescription, Token, QueueItemCalculation, Doctor } from "@/lib/types";

type SidebarTab = "dashboard" | "opd-registration" | "prescriptions" | "profile";

export default function PatientDashboardPage() {
  const [activeTab, setActiveTab] = useState<SidebarTab>("dashboard");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const [phone, setPhone] = useState<string | null>(null);
  const [patient, setPatient] = useState<PatientProfile | null>(null);
  const [activeToken, setActiveToken] = useState<Token | null>(null);
  const [metrics, setMetrics] = useState<QueueItemCalculation | null>(null);
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);

  // Profile Form Edit State
  const [profileName, setProfileName] = useState("");
  const [profileAge, setProfileAge] = useState("");
  const [profileGender, setProfileGender] = useState("Male");
  const [profileHistory, setProfileHistory] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaveSuccess, setProfileSaveSuccess] = useState(false);

  // Load persistent session & tab query param
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const tabParam = urlParams.get("tab") as SidebarTab;
      if (tabParam && ["dashboard", "opd-registration", "prescriptions", "profile"].includes(tabParam)) {
        setActiveTab(tabParam);
      }
    }

    const sessionPhone = getPatientPhoneSession();
    if (sessionPhone) {
      setPhone(sessionPhone);
      const cached = getCachedPatientProfile();
      if (cached) {
        setPatient(cached);
        setProfileName(cached.name || "");
        setProfileAge(cached.age ? String(cached.age) : "35");
        setProfileGender(cached.gender || "Male");
        setProfileHistory(cached.prior_history || "");
      }
      fetchDashboardData(sessionPhone);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchDashboardData = async (userPhone: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/patient/dashboard?phone=${userPhone}`);
      const data = await res.json();

      if (data.patient) {
        setPatient(data.patient);
        setPatientPhoneSession(userPhone, data.patient);
        setProfileName(data.patient.name || "");
        setProfileAge(data.patient.age ? String(data.patient.age) : "35");
        setProfileGender(data.patient.gender || "Male");
        setProfileHistory(data.patient.prior_history || "");
      }
      if (data.active_token) setActiveToken(data.active_token);
      if (data.calculated_metrics) setMetrics(data.calculated_metrics);
      if (data.doctor) setDoctor(data.doctor);
      if (data.prescriptions) setPrescriptions(data.prescriptions);
    } catch (err) {
      console.warn("Failed to fetch patient dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !profileName.trim()) return;
    setSavingProfile(true);
    setProfileSaveSuccess(false);

    try {
      const res = await fetch("/api/patient/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          name: profileName.trim(),
          age: profileAge ? Number(profileAge) : 35,
          gender: profileGender,
          prior_history: profileHistory.trim(),
        }),
      });
      const data = await res.json();
      if (data.patient) {
        setPatient(data.patient);
        setPatientPhoneSession(phone, data.patient);
        setProfileSaveSuccess(true);
        setTimeout(() => setProfileSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.warn("Failed to save profile:", err);
    } finally {
      setSavingProfile(false);
    }
  };


  const handlePhoneVerified = (verifiedPhone: string) => {
    setPhone(verifiedPhone);
    setPatientPhoneSession(verifiedPhone);
    fetchDashboardData(verifiedPhone);
  };

  const handleLogout = () => {
    clearPatientSession();
    setPhone(null);
    setPatient(null);
    setActiveToken(null);
    setMetrics(null);
    setPrescriptions([]);
  };

  // Unauthenticated Login Screen
  if (!phone) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex p-3 bg-teal-500/10 text-teal-400 rounded-3xl mb-1 shadow-inner">
              <Stethoscope className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black tracking-tight">ArogyaFlow Patient Portal</h1>
            <p className="text-xs text-zinc-400">
              Verify mobile number with Fast2SMS OTP to access your patient dashboard.
            </p>
          </div>

          <PhoneOtpModal onVerified={handlePhoneVerified} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col md:flex-row font-sans">
      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-zinc-950 border-b border-zinc-900">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-teal-500 text-black flex items-center justify-center font-bold">
            <Activity className="w-4 h-4" />
          </div>
          <span className="font-extrabold text-sm text-white">ArogyaFlow</span>
        </div>
        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="p-2 rounded-xl bg-zinc-900 text-zinc-300"
        >
          {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* LEFT SIDEBAR NAVIGATION */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-zinc-950 border-r border-zinc-900 p-5 flex flex-col justify-between transition-transform duration-300 ${
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="space-y-6">
          {/* Logo */}
          <div className="flex items-center gap-3 pb-4 border-b border-zinc-900">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-500 to-indigo-500 flex items-center justify-center font-black text-black shadow-lg shadow-teal-500/20">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-black text-base text-white">ArogyaFlow</h2>
              <span className="text-[10px] text-teal-400 font-mono">Patient Portal v2.0</span>
            </div>
          </div>

          {/* Patient Quick Profile Box */}
          <div className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-2xl flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold">
              <User className="w-5 h-5" />
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-white truncate">{patient?.name || "Ramesh Kumar"}</p>
              <p className="text-[10px] text-zinc-500 font-mono">{phone}</p>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1 text-xs font-semibold">
            <button
              onClick={() => {
                setActiveTab("dashboard");
                setMobileSidebarOpen(false);
              }}
              className={`w-full p-3 rounded-2xl flex items-center justify-between transition-all ${
                activeTab === "dashboard"
                  ? "bg-teal-600 text-white shadow-lg shadow-teal-600/20 font-bold"
                  : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-60" />
            </button>

            <button
              onClick={() => {
                setActiveTab("opd-registration");
                setMobileSidebarOpen(false);
              }}
              className={`w-full p-3 rounded-2xl flex items-center justify-between transition-all ${
                activeTab === "opd-registration"
                  ? "bg-teal-600 text-white shadow-lg shadow-teal-600/20 font-bold"
                  : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4" />
                <span>OPD Registration</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-60" />
            </button>

            <button
              onClick={() => {
                setActiveTab("prescriptions");
                setMobileSidebarOpen(false);
              }}
              className={`w-full p-3 rounded-2xl flex items-center justify-between transition-all ${
                activeTab === "prescriptions"
                  ? "bg-teal-600 text-white shadow-lg shadow-teal-600/20 font-bold"
                  : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Pill className="w-4 h-4" />
                <span>Prescriptions History</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-60" />
            </button>

            <button
              onClick={() => {
                setActiveTab("profile");
                setMobileSidebarOpen(false);
              }}
              className={`w-full p-3 rounded-2xl flex items-center justify-between transition-all ${
                activeTab === "profile"
                  ? "bg-teal-600 text-white shadow-lg shadow-teal-600/20 font-bold"
                  : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <User className="w-4 h-4" />
                <span>My Profile</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-60" />
            </button>
          </nav>
        </div>

        {/* Sidebar Footer Logout */}
        <div className="pt-4 border-t border-zinc-900 space-y-2">
          <button
            onClick={() => fetchDashboardData(phone)}
            className="w-full p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh Data</span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full p-2.5 rounded-xl bg-red-950/60 hover:bg-red-900/80 border border-red-800 text-red-400 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout Session</span>
          </button>
        </div>
      </aside>

      {/* RIGHT MAIN CONTENT DISPLAY AREA */}
      <main className="flex-1 p-4 sm:p-8 overflow-y-auto max-w-5xl">
        {/* TAB 1: DASHBOARD OVERVIEW & ACTIVE TOKEN */}
        {activeTab === "dashboard" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Top Welcome Banner */}
            <div className="p-6 bg-gradient-to-r from-zinc-900 via-zinc-900 to-indigo-950/60 border border-zinc-800 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
              <div>
                <h1 className="text-xl font-extrabold text-white">
                  Welcome back, {patient?.name || "Ramesh Kumar"} 👋
                </h1>
                <p className="text-xs text-zinc-400 mt-1">
                  Manage your active OPD queue token, view past prescriptions, or register for consultation.
                </p>
              </div>

              <button
                onClick={() => setActiveTab("opd-registration")}
                className="px-4 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs flex items-center gap-2 transition-all shadow-lg shadow-teal-600/20 shrink-0"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Book OPD Token</span>
              </button>
            </div>

            {/* Active Live Token Banner */}
            {activeToken && metrics ? (
              <div className="p-6 bg-zinc-900 border-2 border-teal-500/40 rounded-3xl shadow-2xl space-y-4 relative overflow-hidden">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="flex h-3 w-3 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-teal-500"></span>
                    </span>
                    <h3 className="font-bold text-white text-base">Active Live OPD Token Status</h3>
                  </div>

                  <StatusBadge
                    myToken={activeToken.token_number}
                    currentToken={doctor?.current_token || 60}
                    estimatedWaitMins={metrics.estimated_wait_mins}
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-2">
                  <div className="p-3.5 bg-black/50 border border-zinc-800 rounded-2xl text-center">
                    <span className="text-[10px] text-zinc-500 uppercase font-semibold">Your Token</span>
                    <p className="text-2xl font-black text-teal-400">#{activeToken.token_number}</p>
                  </div>

                  <div className="p-3.5 bg-black/50 border border-zinc-800 rounded-2xl text-center">
                    <span className="text-[10px] text-zinc-500 uppercase font-semibold">Patients Ahead</span>
                    <p className="text-2xl font-black text-white">{metrics.patients_ahead}</p>
                  </div>

                  <div className="p-3.5 bg-black/50 border border-zinc-800 rounded-2xl text-center">
                    <span className="text-[10px] text-zinc-500 uppercase font-semibold">Estimated Wait</span>
                    <p className="text-2xl font-black text-amber-400">{metrics.estimated_wait_mins} mins</p>
                  </div>

                  <div className="p-3.5 bg-black/50 border border-zinc-800 rounded-2xl text-center">
                    <span className="text-[10px] text-zinc-500 uppercase font-semibold">Expected Turn</span>
                    <p className="text-base font-bold text-indigo-400 mt-1">{metrics.expected_turn_time}</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-zinc-950 rounded-2xl border border-zinc-800 text-xs text-zinc-300 gap-2">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-teal-400" />
                    <span>
                      Doctor: <strong>{doctor?.name || "Dr. Anjali Sharma"}</strong> ({doctor?.room_number || "Room 104"})
                    </span>
                  </div>
                  <button
                    onClick={async () => {
                      if (confirm("Are you sure you want to cancel your token?")) {
                        await fetch(`/api/tokens/${activeToken.id}/cancel`, { method: 'POST' });
                        if (phone) fetchDashboardData(phone);
                      }
                    }}
                    className="text-red-400 hover:text-red-500 font-semibold text-xs underline"
                  >
                    Cancel My Token
                  </button>
                </div>

                {/* Floating Hindi Audio Announcement Button */}
                <HindiVoiceButton
                  myToken={activeToken.token_number}
                  estimatedWaitMins={metrics.estimated_wait_mins}
                  patientsAhead={metrics.patients_ahead}
                />
              </div>
            ) : (
              <div className="p-8 bg-zinc-900 border border-zinc-800 rounded-3xl text-center space-y-3">
                <Clock className="w-8 h-8 text-zinc-600 mx-auto" />
                <h3 className="text-sm font-semibold text-white">No Active Token Currently</h3>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                  Select &quot;OPD Registration&quot; from the sidebar to register and issue a new consultation token.
                </p>
                <button
                  onClick={() => setActiveTab("opd-registration")}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs rounded-xl transition-all"
                >
                  Go to OPD Registration Form
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: PATIENT OPD REGISTRATION FORM */}
        {activeTab === "opd-registration" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-900">
              <div>
                <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-teal-400" />
                  Patient OPD Registration
                </h2>
                <p className="text-xs text-zinc-400">Fill form or use AI Chat with Gemini triage</p>
              </div>
            </div>

            <PatientCheckInForm
              initialPhone={phone || undefined}
              initialPatientName={patient?.name || undefined}
              initialAge={patient?.age || undefined}
              initialGender={patient?.gender || undefined}
              initialPriorHistory={patient?.prior_history || undefined}
            />
          </div>
        )}

        {/* TAB 3: PREVIOUS PRESCRIPTIONS HISTORY */}
        {activeTab === "prescriptions" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-900">
              <div>
                <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                  <Pill className="w-5 h-5 text-indigo-400" />
                  Prescriptions & Medical History
                </h2>
                <p className="text-xs text-zinc-400">View past doctor consultations, clinical notes, and medicines</p>
              </div>
              <span className="text-xs font-mono text-zinc-500">{prescriptions.length} Records</span>
            </div>

            {prescriptions.length === 0 ? (
              <div className="p-8 bg-zinc-900 border border-zinc-800 rounded-3xl text-center text-xs text-zinc-500">
                No past prescription records found.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {prescriptions.map((pres) => (
                  <div
                    key={pres.id}
                    className="p-5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-3xl space-y-3 transition-all"
                  >
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                      <div>
                        <h4 className="font-bold text-white text-sm">{pres.doctor_name}</h4>
                        <p className="text-[11px] text-zinc-400">{pres.department}</p>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-300 text-[10px] font-mono flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-teal-400" />
                        {pres.date}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-zinc-500 uppercase font-semibold">Chief Complaint</span>
                      <p className="text-xs text-zinc-300 font-medium">{pres.chief_complaint}</p>
                    </div>

                    {pres.doctor_notes && (
                      <div>
                        <span className="text-[10px] text-zinc-500 uppercase font-semibold">Doctor Clinical Notes</span>
                        <p className="text-xs text-zinc-400 italic bg-black/40 p-2 rounded-xl border border-zinc-800">
                          &quot;{pres.doctor_notes}&quot;
                        </p>
                      </div>
                    )}

                    <div>
                      <span className="text-[10px] text-teal-400 uppercase font-semibold flex items-center gap-1 mb-1">
                        <Pill className="w-3 h-3" />
                        Prescription Medicines
                      </span>
                      <pre className="text-xs text-zinc-200 font-sans whitespace-pre-wrap bg-zinc-950 p-3 rounded-xl border border-zinc-800/80 leading-relaxed">
                        {pres.prescription_text}
                      </pre>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: PATIENT PROFILE */}
        {activeTab === "profile" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-900">
              <div>
                <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                  <User className="w-5 h-5 text-teal-400" />
                  My Registered Profile
                </h2>
                <p className="text-xs text-zinc-400">Personal details stored in hospital database</p>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="p-6 bg-zinc-900 border border-zinc-800 rounded-3xl space-y-4 max-w-xl">
              {profileSaveSuccess && (
                <div className="p-3.5 rounded-2xl bg-teal-950/60 border border-teal-800 text-teal-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-400" />
                  <span>Profile updated and registered successfully in hospital database!</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-[10px] text-zinc-400 uppercase font-semibold mb-1">
                    Registered Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-zinc-400 uppercase font-semibold mb-1">
                    Verified Mobile Phone (OTP)
                  </label>
                  <input
                    type="text"
                    disabled
                    value={phone || ""}
                    className="w-full px-3 py-2.5 bg-zinc-950/50 border border-zinc-800/80 rounded-xl text-xs text-teal-400 font-mono cursor-not-allowed opacity-80"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-zinc-400 uppercase font-semibold mb-1">
                    Age (Years)
                  </label>
                  <input
                    type="number"
                    value={profileAge}
                    onChange={(e) => setProfileAge(e.target.value)}
                    className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-zinc-400 uppercase font-semibold mb-1">
                    Gender
                  </label>
                  <select
                    value={profileGender}
                    onChange={(e) => setProfileGender(e.target.value)}
                    className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 border-t border-zinc-800">
                <label className="block text-[10px] text-zinc-400 uppercase font-semibold mb-1">
                  Prior Medical History / Chronic Conditions
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Hypertension (5 yrs), Type 2 Diabetes, Asthma"
                  value={profileHistory}
                  onChange={(e) => setProfileHistory(e.target.value)}
                  className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <button
                type="submit"
                disabled={savingProfile}
                className="w-full py-3 px-4 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white font-semibold text-xs rounded-2xl transition-all shadow-lg shadow-teal-600/20 flex items-center justify-center gap-2"
              >
                {savingProfile ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Save Patient Profile to Database</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}

      </main>
    </div>
  );
}
