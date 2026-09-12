"use client";

import React, { useState, useEffect } from "react";
import { Phone, Lock, CheckCircle2, ShieldCheck, ArrowRight, RefreshCw, AlertCircle } from "lucide-react";
import GlassCard from "./ui/GlassCard";

interface PhoneOtpModalProps {
  onVerified: (phoneNumber: string) => void;
  initialPhone?: string;
}

export default function PhoneOtpModal({ onVerified, initialPhone = "" }: PhoneOtpModalProps) {
  const [phone, setPhone] = useState(initialPhone);
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp" | "verified">(initialPhone ? "phone" : "phone");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [otpForDev, setOtpForDev] = useState<string | null>(null);
  const [timer, setTimer] = useState(60);

  useEffect(() => {
    let interval: any;
    if (step === "otp" && timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoMessage(null);
    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: cleanPhone }),
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error || "Failed to send OTP.");
      } else {
        setStep("otp");
        setTimer(60);
        if (data.otpForTesting) {
          setOtpForDev(data.otpForTesting);
          setInfoMessage(`Fast2SMS Dev Mode: Use OTP code ${data.otpForTesting}`);
        } else {
          setInfoMessage(data.message || "OTP sent to your mobile number via Fast2SMS.");
        }
      }
    } catch (err: any) {
      setError(err.message || "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!otp || otp.length < 6) {
      setError("Please enter the 6-digit OTP code.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.replace(/\D/g, ""), otp }),
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error || "Invalid OTP code.");
      } else {
        setStep("verified");
        setTimeout(() => {
          onVerified(phone);
        }, 800);
      }
    } catch (err: any) {
      setError(err.message || "Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <GlassCard className="w-full max-w-md mx-auto bg-white border border-slate-200 shadow-2xl p-6 sm:p-8 rounded-3xl">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-600/30">
            <Phone className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">
              ArogyaFlow Mobile Login
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Verify mobile number for token & notifications
            </p>
          </div>
        </div>
        <span className="px-3 py-1 text-[10px] font-extrabold tracking-wider uppercase rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-sm">
          OTP SECURE
        </span>
      </div>

      {error && (
        <div className="mb-5 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {infoMessage && (
        <div className="mb-5 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in">
          <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{infoMessage}</span>
        </div>
      )}

      {step === "phone" && (
        <form onSubmit={handleSendOtp} className="space-y-5">
          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
              Mobile Phone Number
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-black text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-xl">
                +91
              </span>
              <input
                type="tel"
                maxLength={10}
                placeholder="9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                className="w-full pl-16 pr-4 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-2xl text-base font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/15 focus:bg-white focus:border-emerald-600 transition-all shadow-inner"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || phone.length < 10}
            className="w-full py-4 text-sm font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl shadow-lg shadow-emerald-600/30 hover:shadow-xl hover:shadow-emerald-600/40 transition-all hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin text-white" />
            ) : (
              <>
                <span>Send Verification OTP</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      )}

      {step === "otp" && (
        <form onSubmit={handleVerifyOtp} className="space-y-5 animate-in fade-in duration-300">
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                Enter 6-Digit OTP Code
              </label>
              <button
                type="button"
                onClick={() => setStep("phone")}
                className="text-xs text-emerald-700 hover:underline font-bold"
              >
                Change Number
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                maxLength={6}
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-2xl text-center font-mono text-xl font-bold tracking-widest text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-4 focus:ring-emerald-500/15 focus:bg-white focus:border-emerald-600 transition-all shadow-inner"
                required
              />
            </div>
          </div>

          {otpForDev && (
            <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs text-center font-mono font-bold shadow-sm">
              Dev OTP Code: <strong className="text-amber-950 underline">{otpForDev}</strong> (or enter 123456)
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Resend OTP in: <strong className="text-slate-800">{timer}s</strong></span>
            <button
              type="button"
              disabled={timer > 0 || loading}
              onClick={handleSendOtp}
              className="text-emerald-700 disabled:opacity-40 font-bold hover:underline"
            >
              Resend Code
            </button>
          </div>

          <button
            type="submit"
            disabled={loading || otp.length < 6}
            className="w-full py-4 text-sm font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl shadow-lg shadow-emerald-600/30 hover:shadow-xl hover:shadow-emerald-600/40 transition-all hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin text-white" />
            ) : (
              <>
                <span>Verify OTP & Login</span>
                <CheckCircle2 className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      )}

      {step === "verified" && (
        <div className="py-8 text-center space-y-3 animate-in zoom-in duration-300">
          <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h4 className="text-lg font-black text-slate-900">Mobile Verified!</h4>
          <p className="text-xs text-slate-500 font-medium">Redirecting to your patient dashboard...</p>
        </div>
      )}
    </GlassCard>
  );
}
