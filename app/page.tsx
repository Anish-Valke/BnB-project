"use client";

import React from "react";
import Link from "next/link";
import {
  QrCode,
  Stethoscope,
  Activity,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  User,
  Clock,
  Volume2,
  FileText,
  ChevronDown,
  Layers,
  Zap,
} from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import Button from "@/components/ui/Button";

export default function Home() {
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/60 via-slate-50 to-emerald-50/30 text-slate-900 flex flex-col justify-between selection:bg-emerald-500/20 selection:text-emerald-800 overflow-x-hidden font-sans relative">
      {/* Soft Ambient Healthcare Light Spotlight */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-emerald-400/15 via-emerald-200/10 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* Fixed Header Navigation */}
      <header className="fixed top-0 inset-x-0 z-50 backdrop-blur-xl bg-white/95 border-b border-emerald-100/80 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img
              src="/logo.jpg"
              alt="ArogyaFlow Logo"
              className="w-10 h-10 rounded-2xl shadow-md shadow-emerald-600/25 object-cover border border-emerald-100"
            />
            <div>
              <span className="font-black text-xl tracking-tight text-emerald-800">
                ArogyaFlow
              </span>
              <span className="ml-2 px-2.5 py-0.5 text-[10px] uppercase font-extrabold tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-full">
                OPD Engine v2.0
              </span>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="flex items-center gap-6 sm:gap-8 text-sm font-bold text-slate-700">
            <button
              onClick={() => scrollToSection("how-it-works")}
              className="hover:text-emerald-600 transition-colors"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection("features")}
              className="hover:text-emerald-600 transition-colors"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection("stats")}
              className="hover:text-emerald-600 transition-colors hidden sm:block"
            >
              Live Stats
            </button>
          </nav>
        </div>
      </header>

      {/* Main Hero Showcase */}
      <main className="w-full flex-1 pt-24 sm:pt-28">
        {/* HERO SECTION */}
        <section className="max-w-6xl mx-auto px-6 pt-16 pb-20 flex flex-col items-center text-center space-y-8 relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100/80 border border-emerald-200 text-xs font-extrabold text-emerald-800 shadow-sm animate-bounce duration-1000">
            <Sparkles className="w-4 h-4 text-emerald-600 animate-spin" />
            <span>AI-Powered Hospital OPD Queue Engine</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[1.1] max-w-5xl text-slate-900">
            Zero-Wait OPD Queueing with{" "}
            <span className="text-emerald-600">
              Real-Time AI Triage
            </span>
          </h1>

          <p className="text-base sm:text-xl text-slate-600 max-w-3xl leading-relaxed font-normal">
            Eliminate hospital queue congestion with instant OTP verification, live token position tracking, multi-lingual voice guidance, and automated Gemini AI symptom triage.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
            <Link href="/patient/dashboard">
              <Button
                variant="primary"
                className="rounded-full px-8 py-4 text-base font-bold shadow-xl shadow-emerald-600/30 group hover:scale-105 transition-all bg-emerald-600 hover:bg-emerald-700 text-white border-none"
              >
                <span>Access Patient Portal</span>
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/doctor">
              <Button
                variant="outline"
                className="rounded-full px-8 py-4 text-base font-extrabold bg-white border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50 shadow-sm"
              >
                <Stethoscope className="w-5 h-5 mr-2 text-emerald-600" />
                <span>Open Doctor Console</span>
              </Button>
            </Link>
          </div>

          {/* Floating Sample Live Token Preview Card */}
          <div className="w-full max-w-2xl mt-8 pt-4">
            <div className="p-6 bg-white/90 backdrop-blur-md rounded-3xl border border-emerald-100 shadow-2xl shadow-emerald-600/10 text-left relative overflow-hidden">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </span>
                  <span className="text-xs font-black text-emerald-800 uppercase tracking-wider bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    LIVE REAL-TIME SYNC
                  </span>
                </div>
                <span className="text-xs font-bold text-slate-500">Dr. Anjali Sharma &bull; Room 104</span>
              </div>
              <div className="grid grid-cols-3 gap-4 pt-4 text-center">
                <div>
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Your Token</span>
                  <span className="text-3xl font-black text-emerald-600">#68</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Serving Now</span>
                  <span className="text-3xl font-black text-slate-900">#66</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Est. Wait</span>
                  <span className="text-3xl font-black text-emerald-700">~24 min</span>
                </div>
              </div>
            </div>
          </div>

          {/* Scroll Down Indicator */}
          <div className="pt-10 flex flex-col items-center gap-2 text-slate-400 text-xs font-semibold cursor-pointer" onClick={() => scrollToSection("stats")}>
            <span>Scroll down to explore</span>
            <div className="p-2 rounded-full bg-white shadow-sm border border-emerald-200 animate-bounce">
              <ChevronDown className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
        </section>

        {/* STATS BAR */}
        <section id="stats" className="w-full bg-white border-y border-emerald-100 py-10 shadow-sm">
          <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-black text-emerald-600">Real-Time</div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Live OPD Sync</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-black text-emerald-700">~95%</div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Wait Reduction</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-black text-emerald-600">Gemini AI</div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Smart Triage</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-black text-emerald-800">100%</div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">OTP Mobile Verified</div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS SECTION */}
        <section id="how-it-works" className="max-w-6xl mx-auto px-6 py-24 space-y-16">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-extrabold uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5 text-emerald-700" />
              <span>Step-By-Step Process</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
              How ArogyaFlow Works
            </h2>
            <p className="text-slate-500 text-base font-medium">
              Seamlessly connecting patients with doctors through intelligent automation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Step 1 */}
            <GlassCard className="relative p-6 space-y-4 border-emerald-100 hover:border-emerald-400 transition-all hover:shadow-xl group bg-white">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-lg shadow-md shadow-emerald-600/30">
                1
              </div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                Mobile Verification
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Log in instantly via SMS OTP code to access your personal dashboard & OPD token status.
              </p>
            </GlassCard>

            {/* Step 2 */}
            <GlassCard className="relative p-6 space-y-4 border-emerald-100 hover:border-emerald-400 transition-all hover:shadow-xl group bg-white">
              <div className="w-12 h-12 rounded-2xl bg-emerald-700 text-white flex items-center justify-center font-black text-lg shadow-md shadow-emerald-700/30">
                2
              </div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                AI Symptom Triage
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Enter symptoms manually or via Voice Bot. Gemini AI predicts duration and verifies data.
              </p>
            </GlassCard>

            {/* Step 3 */}
            <GlassCard className="relative p-6 space-y-4 border-emerald-100 hover:border-emerald-400 transition-all hover:shadow-xl group bg-white">
              <div className="w-12 h-12 rounded-2xl bg-green-600 text-white flex items-center justify-center font-black text-lg shadow-md shadow-green-600/30">
                3
              </div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-green-600 transition-colors">
                Live Queue Tracking
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Monitor your token #, current serving token, patients ahead, and turn time updated live every 3s.
              </p>
            </GlassCard>

            {/* Step 4 */}
            <GlassCard className="relative p-6 space-y-4 border-emerald-100 hover:border-emerald-400 transition-all hover:shadow-xl group bg-white">
              <div className="w-12 h-12 rounded-2xl bg-emerald-800 text-white flex items-center justify-center font-black text-lg shadow-md shadow-emerald-800/30">
                4
              </div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">
                Doctor Consultation
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Consult with doctor, receive digital prescriptions, and access medical history anytime.
              </p>
            </GlassCard>
          </div>
        </section>

        {/* FEATURES GRID SECTION */}
        <section id="features" className="max-w-6xl mx-auto px-6 py-20 space-y-16">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-extrabold uppercase tracking-wider">
              <Layers className="w-3.5 h-3.5 text-emerald-700" />
              <span>Core Capabilities</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
              Engineered for Modern Healthcare
            </h2>
            <p className="text-slate-500 text-base font-medium">
              Everything required for smooth OPD queue management and patient care.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Feature 1 */}
            <GlassCard className="p-8 space-y-5 border-emerald-100 hover:border-emerald-400 transition-all hover:shadow-xl group bg-white">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Clock className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                Real-Time Live Queue Sync
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Background polling synchronizes patient tokens with doctor console actions in real-time. Know exactly when it's your turn without standing in crowded waiting rooms.
              </p>
            </GlassCard>

            {/* Feature 2 */}
            <GlassCard className="p-8 space-y-5 border-emerald-100 hover:border-emerald-400 transition-all hover:shadow-xl group bg-white">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Volume2 className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                Multi-Lingual Voice Assistant
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Listen to queue announcements in Hindi & English speech synthesis. Provides accessible audio updates for elderly patients and diverse communities.
              </p>
            </GlassCard>

            {/* Feature 3 */}
            <GlassCard className="p-8 space-y-5 border-emerald-100 hover:border-emerald-400 transition-all hover:shadow-xl group bg-white">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Stethoscope className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                Doctor OPD Control Console
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Single-tap controls for next patient, queue skipping, emergency delay adjustments, and clinical note writing during consultations.
              </p>
            </GlassCard>

            {/* Feature 4 */}
            <GlassCard className="p-8 space-y-5 border-emerald-100 hover:border-emerald-400 transition-all hover:shadow-xl group bg-white">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                <FileText className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">
                Digital Prescriptions & Records
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Access past consultation summaries, doctor notes, and digital prescriptions anytime securely stored in your patient dashboard vault.
              </p>
            </GlassCard>
          </div>
        </section>

        {/* CTA ROLE ACCESS CARDS */}
        <section className="max-w-6xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Patient Portal Card */}
            <Link href="/patient/dashboard" className="group">
              <GlassCard className="p-8 border-emerald-100 hover:border-emerald-500 text-left space-y-6 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-600/15 hover:-translate-y-1 bg-gradient-to-br from-white to-emerald-50/50">
                <div className="flex items-center justify-between">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30">
                    <User className="w-7 h-7" />
                  </div>
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold">
                    For Patients
                  </span>
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 group-hover:text-emerald-600 transition-colors flex items-center gap-2">
                    <span>Patient Portal</span>
                    <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                  </h3>
                  <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                    Check in with mobile OTP, track live token position, hear Hindi audio alerts, and view medical history.
                  </p>
                </div>
              </GlassCard>
            </Link>

            {/* Doctor Console Card */}
            <Link href="/doctor" className="group">
              <GlassCard className="p-8 border-emerald-100 hover:border-emerald-500 text-left space-y-6 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-600/15 hover:-translate-y-1 bg-gradient-to-br from-white to-emerald-50/50">
                <div className="flex items-center justify-between">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-700 text-white flex items-center justify-center shadow-lg shadow-emerald-700/30">
                    <Stethoscope className="w-7 h-7" />
                  </div>
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold">
                    For Doctors
                  </span>
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 group-hover:text-emerald-700 transition-colors flex items-center gap-2">
                    <span>Doctor Console</span>
                    <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                  </h3>
                  <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                    Manage active OPD room queue, call next patient, write e-prescriptions, and configure emergency delays.
                  </p>
                </div>
              </GlassCard>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-emerald-100 bg-white/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500 font-medium">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-600" />
            <span className="font-bold text-slate-900">ArogyaFlow OPD Queue Engine</span>
            <span>&bull; © 2026</span>
          </div>
          <div className="flex items-center gap-2 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-100">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="text-emerald-800 text-xs font-bold">ArogyaFlow & Gemini 3.6 Flash Verified</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
