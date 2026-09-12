import Link from "next/link";
import { QrCode, Stethoscope, Activity, Sparkles, PhoneCall, ShieldCheck, ArrowRight, Clock } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col justify-between selection:bg-teal-500 selection:text-black">
      {/* Top Header Navigation */}
      <header className="w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between border-b border-zinc-900">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-teal-500/20">
            <Activity className="w-6 h-6 text-black" />
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-zinc-200 to-teal-400 bg-clip-text text-transparent">
              ArogyaFlow
            </span>
            <span className="ml-2 px-2 py-0.5 text-[10px] uppercase font-bold tracking-widest bg-teal-500/10 text-teal-400 border border-teal-500/20 rounded-full">
              OPD Engine v2.0
            </span>
          </div>
        </div>

        <nav className="flex items-center gap-4 text-xs font-semibold">
          <Link
            href="/check-in"
            className="px-4 py-2 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white transition-all shadow-lg shadow-teal-600/20 flex items-center gap-1.5"
          >
            <QrCode className="w-4 h-4" />
            <span>Patient Check-in</span>
          </Link>
          <Link
            href="/doctor"
            className="px-4 py-2 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 transition-all flex items-center gap-1.5"
          >
            <Stethoscope className="w-4 h-4 text-indigo-400" />
            <span>Doctor Console</span>
          </Link>
        </nav>
      </header>

      {/* Main Hero Showcase */}
      <main className="w-full max-w-5xl mx-auto px-6 py-16 flex-1 flex flex-col items-center text-center space-y-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-medium text-teal-400 shadow-inner">
          <Sparkles className="w-4 h-4 text-teal-400 animate-pulse" />
          <span>Next-Gen AI OPD Queue & Spatial Buffer System</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.15] max-w-3xl">
          Zero-Wait OPD Queue with{" "}
          <span className="bg-gradient-to-r from-teal-400 via-emerald-400 to-indigo-400 bg-clip-text text-transparent">
            AI Triage & Voice Bot
          </span>
        </h1>

        <p className="text-sm sm:text-base text-zinc-400 max-w-xl leading-relaxed">
          Scan hospital QR code, verify mobile with Fast2SMS OTP, choose manual or voice bot intake, and let Gemini 3.6 Flash sanitize & triage your consultation in real-time.
        </p>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full pt-8">
          {/* Card 1: Patient Check-in */}
          <Link
            href="/check-in"
            className="group p-6 bg-gradient-to-b from-zinc-900 to-zinc-950 border border-zinc-800/80 hover:border-teal-500/50 rounded-3xl text-left space-y-4 transition-all duration-300 hover:shadow-2xl hover:shadow-teal-500/10"
          >
            <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <QrCode className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white group-hover:text-teal-400 transition-colors flex items-center justify-between">
              <span>Patient Check-in</span>
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              QR Code scan, Fast2SMS OTP verification, hospital geolocation check, and dual-mode (Voice Bot / Form) intake.
            </p>
          </Link>

          {/* Card 2: AI Gemini Triage */}
          <div className="p-6 bg-gradient-to-b from-zinc-900 to-zinc-950 border border-zinc-800/80 rounded-3xl text-left space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <PhoneCall className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white flex items-center justify-between">
              <span>AI Voice Bot & Triage</span>
              <span className="px-2 py-0.5 text-[9px] font-bold tracking-widest uppercase bg-indigo-500/20 text-indigo-300 rounded-md">
                Gemini 3.6
              </span>
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Interactive voice assistant calls patient, verifies data sanity, eliminates spam/gibberish, and calculates precise wait ETA.
            </p>
          </div>

          {/* Card 3: Doctor Console */}
          <Link
            href="/doctor"
            className="group p-6 bg-gradient-to-b from-zinc-900 to-zinc-950 border border-zinc-800/80 hover:border-indigo-500/50 rounded-3xl text-left space-y-4 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Stethoscope className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors flex items-center justify-between">
              <span>Doctor Console</span>
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Real-time patient queue caller, one-click Next/Skip token controls, and emergency delay management.
            </p>
          </Link>
        </div>

        {/* Quick Demo Tracker Link */}
        <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-2xl flex items-center justify-between w-full max-w-xl text-xs">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-teal-400" />
            <div className="text-left">
              <span className="font-semibold text-white">Live Patient Queue Tracker</span>
              <p className="text-zinc-500 text-[11px]">View real-time token tracking screen</p>
            </div>
          </div>
          <Link
            href="/patient/61"
            className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-teal-300 font-semibold rounded-xl transition-all border border-zinc-700"
          >
            View Token #61 →
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-6xl mx-auto px-6 py-6 border-t border-zinc-900 flex items-center justify-between text-xs text-zinc-600">
        <span>© 2026 ArogyaFlow OPD Queue Engine</span>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Fast2SMS OTP & Gemini 3.6 Flash Verified</span>
        </div>
      </footer>
    </div>
  );
}
