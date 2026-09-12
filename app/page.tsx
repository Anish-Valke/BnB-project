import Link from "next/link";
import { QrCode, Stethoscope, Activity, Sparkles, PhoneCall, ShieldCheck, ArrowRight, User } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import Button from "@/components/ui/Button";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between selection:bg-primary/20 selection:text-primary">
      {/* Top Header Navigation */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between border-b border-gray-100/50 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight text-primary">
              ArogyaFlow
            </span>
            <span className="ml-2 px-2 py-0.5 text-[10px] uppercase font-bold tracking-widest bg-secondary/10 text-secondary border border-secondary/20 rounded-full">
              OPD Engine v2.0
            </span>
          </div>
        </div>

        <nav className="flex items-center gap-3 text-sm font-semibold">
          <Link href="/patient/dashboard">
            <Button variant="primary" className="rounded-full shadow-lg shadow-primary/20 px-6">
              <User className="w-4 h-4 mr-2" />
              Patient Portal
            </Button>
          </Link>
          <Link href="/doctor">
            <Button variant="outline" className="rounded-full px-6 bg-white border-gray-200">
              <Stethoscope className="w-4 h-4 mr-2 text-secondary" />
              Doctor Console
            </Button>
          </Link>
        </nav>
      </header>

      {/* Main Hero Showcase */}
      <main className="w-full max-w-6xl mx-auto px-6 py-20 flex-1 flex flex-col items-center text-center space-y-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface border border-gray-200 text-xs font-semibold text-primary shadow-sm">
          <Sparkles className="w-4 h-4 animate-pulse" />
          <span>Next-Gen AI OPD Queue System</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight max-w-4xl text-foreground">
          Zero-Wait OPD Queue with{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
            AI Triage & Live Tracking
          </span>
        </h1>

        <p className="text-base sm:text-lg text-gray-500 max-w-2xl leading-relaxed">
          Verify mobile with Fast2SMS OTP, choose manual or voice bot intake, and let Gemini 3.6 Flash sanitize & triage your consultation in real-time. Experience a modern, premium healthcare workflow.
        </p>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full pt-10">
          {/* Card 1: Patient Check-in */}
          <Link href="/patient/dashboard" className="group">
            <GlassCard className="h-full border border-gray-100 hover:border-primary/50 text-left space-y-5 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                <QrCode className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors flex items-center justify-between">
                <span>Patient Portal</span>
                <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0" />
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Fast2SMS OTP login, live token tracking, visit history, prescription access, and dual-mode AI intake.
              </p>
            </GlassCard>
          </Link>

          {/* Card 2: AI Gemini Triage */}
          <GlassCard className="h-full border border-gray-100 text-left space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center">
              <PhoneCall className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-foreground flex items-center justify-between">
              <span>AI Voice Bot Triage</span>
              <span className="px-2 py-1 text-[10px] font-black tracking-widest uppercase bg-secondary/10 text-secondary rounded-lg">
                Gemini 3.6
              </span>
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Interactive voice assistant verifies data sanity, eliminates spam/gibberish, and accurately predicts consultation duration.
            </p>
          </GlassCard>

          {/* Card 3: Doctor Console */}
          <Link href="/doctor" className="group">
            <GlassCard className="h-full border border-gray-100 hover:border-emerald-500/50 text-left space-y-5 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/10 hover:-translate-y-1">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Stethoscope className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-foreground group-hover:text-emerald-600 transition-colors flex items-center justify-between">
                <span>Doctor Console</span>
                <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0" />
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Real-time queue management, unified patient history, clinical note taking, and emergency delay controls.
              </p>
            </GlassCard>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500 font-medium">
          <span>© 2026 ArogyaFlow OPD Queue Engine</span>
          <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="text-emerald-700 text-xs font-bold">Fast2SMS & Gemini 3.6 Flash Verified</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
