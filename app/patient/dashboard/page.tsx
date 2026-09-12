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
import ActiveQueueCard from "@/components/patient/ActiveQueueCard";
import EmptyQueueState from "@/components/patient/EmptyQueueState";
import VisitHistoryCard from "@/components/patient/VisitHistoryCard";
import PrescriptionCard from "@/components/patient/PrescriptionCard";
import GlassCard from "@/components/ui/GlassCard";
import Button from "@/components/ui/Button";

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
      else setActiveToken(null);
      if (data.calculated_metrics) setMetrics(data.calculated_metrics);
      else setMetrics(null);
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
      <div className="min-h-screen bg-background text-foreground flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-4">
            <div className="inline-flex p-4 bg-primary/10 text-primary rounded-[2rem] mb-2 shadow-inner">
              <Stethoscope className="w-10 h-10" />
            </div>
            <h1 className="text-3xl font-black tracking-tight text-primary">ArogyaFlow Patient</h1>
            <p className="text-sm text-gray-500">
              Verify mobile number with Fast2SMS OTP to access your patient dashboard.
            </p>
          </div>

          <PhoneOtpModal onVerified={handlePhoneVerified} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row font-sans">
      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center font-bold">
            <Activity className="w-4 h-4" />
          </div>
          <span className="font-extrabold text-sm text-foreground">ArogyaFlow</span>
        </div>
        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="p-2 rounded-xl bg-surface hover:bg-surface-hover text-gray-600 transition-colors"
        >
          {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* LEFT SIDEBAR NAVIGATION */}
      <aside
        className={`fixed md:sticky top-0 inset-y-0 left-0 z-40 w-64 bg-surface border-r border-gray-200/50 p-6 flex flex-col justify-between transition-transform duration-300 shadow-xl md:shadow-none h-screen ${
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="space-y-8">
          {/* Logo */}
          <div className="flex items-center gap-3 pb-6 border-b border-gray-200/50">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-black text-lg text-primary">ArogyaFlow</h2>
              <span className="text-xs text-secondary font-medium">Patient Portal</span>
            </div>
          </div>

          {/* Patient Quick Profile Box */}
          <GlassCard className="p-3 bg-white flex items-center gap-3 shadow-sm border-gray-100">
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
              <User className="w-5 h-5" />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-foreground truncate">{patient?.name || "Ramesh Kumar"}</p>
              <p className="text-xs text-gray-500 font-mono">{phone}</p>
            </div>
          </GlassCard>

          {/* Navigation Items */}
          <nav className="space-y-2 font-medium">
            {[
              { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
              { id: "opd-registration", icon: FileText, label: "OPD Registration" },
              { id: "prescriptions", icon: Pill, label: "Medical History" },
              { id: "profile", icon: User, label: "My Profile" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id as SidebarTab);
                  setMobileSidebarOpen(false);
                }}
                className={`w-full px-4 py-3 rounded-2xl flex items-center justify-between transition-all group ${
                  activeTab === item.id
                    ? "bg-primary text-white shadow-lg shadow-primary/25 font-bold"
                    : "text-gray-500 hover:bg-surface-hover hover:text-foreground"
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </div>
                <ChevronRight className={`w-4 h-4 transition-transform ${activeTab === item.id ? "opacity-100 translate-x-1" : "opacity-0 -translate-x-2 group-hover:opacity-50 group-hover:translate-x-0"}`} />
              </button>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer Logout */}
        <div className="pt-6 border-t border-gray-200/50 space-y-3">
          <Button
            variant="outline"
            onClick={() => fetchDashboardData(phone)}
            className="w-full justify-center text-gray-600 hover:text-primary"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin text-primary" : ""}`} />
            Refresh Data
          </Button>

          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full justify-center text-red-600 hover:bg-red-50 hover:text-red-700 border border-transparent hover:border-red-100"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout Session
          </Button>
        </div>
      </aside>

      {/* RIGHT MAIN CONTENT DISPLAY AREA */}
      <main className="flex-1 p-4 sm:p-8 lg:p-10 max-w-6xl mx-auto w-full pb-24">
        {/* TAB 1: DASHBOARD OVERVIEW & ACTIVE TOKEN */}
        {activeTab === "dashboard" && (
          <div className="space-y-8 animate-in fade-in duration-500 slide-in-from-bottom-4">
            {/* Top Welcome Banner */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-2">
              <div>
                <h1 className="text-3xl font-black text-foreground">
                  Hello, {patient?.name || "Ramesh Kumar"} 👋
                </h1>
                <p className="text-sm text-gray-500 mt-1.5">
                  Manage your active OPD queue token, view past prescriptions, or register for consultation.
                </p>
              </div>

              <Button
                variant="primary"
                onClick={() => setActiveTab("opd-registration")}
                className="shrink-0 rounded-full px-6 py-3 shadow-xl shadow-primary/20"
              >
                <PlusCircle className="w-5 h-5 mr-2" />
                Book OPD Token
              </Button>
            </div>

            {/* Active Live Token Banner or Empty State */}
            {activeToken && metrics && doctor ? (
              <ActiveQueueCard
                tokenNumber={activeToken.token_number}
                currentServing={doctor.current_token}
                patientsAhead={metrics.patients_ahead}
                estimatedWaitTime={metrics.estimated_wait_mins}
                expectedTime={metrics.expected_turn_time}
                doctorName={doctor.name}
                department={doctor.department}
                roomNumber={doctor.room_number || "OPD Room"}
                status={metrics.buffer_label as any || "Relax"}
                statusMessage={`Please wait, you have ${metrics.patients_ahead} patients ahead.`}
                onRefresh={() => {
                  if (phone) fetchDashboardData(phone);
                }}
              />
            ) : (
              <EmptyQueueState onGetToken={() => setActiveTab("opd-registration")} patientName={patient?.name || "Patient"} />
            )}
          </div>
        )}

        {/* TAB 2: PATIENT OPD REGISTRATION FORM */}
        {activeTab === "opd-registration" && (
          <div className="space-y-6 animate-in fade-in duration-500 slide-in-from-bottom-4 max-w-3xl">
            <div className="mb-8">
              <h2 className="text-2xl font-black text-foreground flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-xl">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                OPD Registration
              </h2>
              <p className="text-sm text-gray-500 mt-2">Fill the form below or use AI Chat with Gemini triage for automatic registration.</p>
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
          <div className="space-y-6 animate-in fade-in duration-500 slide-in-from-bottom-4">
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-foreground flex items-center gap-3">
                  <div className="p-2 bg-secondary/10 rounded-xl">
                    <Pill className="w-6 h-6 text-secondary" />
                  </div>
                  Medical History
                </h2>
                <p className="text-sm text-gray-500 mt-2">View past doctor consultations, clinical notes, and medicines</p>
              </div>
              <span className="px-4 py-2 bg-surface rounded-full text-sm font-semibold text-foreground border border-gray-100">
                {prescriptions.length} Records Found
              </span>
            </div>

            {prescriptions.length === 0 ? (
              <GlassCard className="text-center py-16">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-foreground">No History Found</h3>
                <p className="text-sm text-gray-500">You don't have any past prescription records yet.</p>
              </GlassCard>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {prescriptions.map((pres) => (
                  <VisitHistoryCard
                    key={pres.id}
                    date={pres.date || "Unknown Date"}
                    doctorName={pres.doctor_name || "Unknown Doctor"}
                    department={pres.department || "General"}
                    complaint={pres.chief_complaint || "No complaint recorded"}
                    doctorNotes={pres.doctor_notes}
                    prescriptionText={pres.prescription_text}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: PATIENT PROFILE */}
        {activeTab === "profile" && (
          <div className="space-y-6 animate-in fade-in duration-500 slide-in-from-bottom-4 max-w-2xl">
            <div className="mb-8">
              <h2 className="text-2xl font-black text-foreground flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-xl">
                  <User className="w-6 h-6 text-primary" />
                </div>
                My Profile
              </h2>
              <p className="text-sm text-gray-500 mt-2">Personal details stored securely in the hospital database</p>
            </div>

            <GlassCard className="p-8 space-y-6">
              {profileSaveSuccess && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm font-semibold flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <span>Profile updated successfully!</span>
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="w-full px-4 py-3 bg-surface border border-gray-200 rounded-2xl text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                      Verified Mobile
                    </label>
                    <input
                      type="text"
                      disabled
                      value={phone || ""}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-mono text-gray-500 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                      Age
                    </label>
                    <input
                      type="number"
                      value={profileAge}
                      onChange={(e) => setProfileAge(e.target.value)}
                      className="w-full px-4 py-3 bg-surface border border-gray-200 rounded-2xl text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                      Gender
                    </label>
                    <select
                      value={profileGender}
                      onChange={(e) => setProfileGender(e.target.value)}
                      className="w-full px-4 py-3 bg-surface border border-gray-200 rounded-2xl text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Prior Medical History / Allergies
                  </label>
                  <textarea
                    rows={4}
                    placeholder="e.g. Hypertension (5 yrs), Type 2 Diabetes, Asthma"
                    value={profileHistory}
                    onChange={(e) => setProfileHistory(e.target.value)}
                    className="w-full px-4 py-3 bg-surface border border-gray-200 rounded-2xl text-sm font-medium text-foreground placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                  />
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={savingProfile}
                    className="w-full sm:w-auto px-8"
                  >
                    {savingProfile ? (
                      <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                    ) : (
                      <ShieldCheck className="w-5 h-5 mr-2" />
                    )}
                    Save Profile Changes
                  </Button>
                </div>
              </form>
            </GlassCard>
          </div>
        )}

      </main>
    </div>
  );
}
