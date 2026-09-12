"use client";

import React, { useState, useEffect } from "react";
import { Phone, Lock, CheckCircle2, ShieldCheck, ArrowRight, RefreshCw, AlertCircle } from "lucide-react";

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
    <div className="w-full max-w-md mx-auto p-6 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xl backdrop-blur-md">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-950/50 flex items-center justify-center text-teal-600 dark:text-teal-400 font-semibold shadow-inner">
            <Phone className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-zinc-900 dark:text-white text-base">
              Fast2SMS Mobile Login
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Verify mobile number for token & notifications
            </p>
          </div>
        </div>
        <span className="px-2.5 py-1 text-[10px] font-semibold tracking-wider uppercase rounded-full bg-teal-100 text-teal-700 dark:bg-teal-900/60 dark:text-teal-300">
          Fast2SMS API
        </span>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {infoMessage && (
        <div className="mb-4 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-500" />
          <span>{infoMessage}</span>
        </div>
      )}

      {step === "phone" && (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Mobile Phone Number
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-zinc-400">
                +91
              </span>
              <input
                type="tel"
                maxLength={10}
                placeholder="9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                className="w-full pl-12 pr-4 py-3 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-sm font-medium text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || phone.length < 10}
            className="w-full py-3.5 px-4 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-medium text-sm rounded-2xl transition-all shadow-lg shadow-teal-600/20 flex items-center justify-center gap-2"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Send OTP via Fast2SMS</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      )}

      {step === "otp" && (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Enter 6-Digit OTP Code
              </label>
              <button
                type="button"
                onClick={() => setStep("phone")}
                className="text-xs text-teal-600 dark:text-teal-400 hover:underline font-medium"
              >
                Change Number
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                maxLength={6}
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                className="w-full pl-10 pr-4 py-3 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-center font-mono text-lg tracking-widest text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                required
              />
            </div>
          </div>

          {otpForDev && (
            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs text-center font-mono">
              Dev OTP Code: <strong className="text-amber-900 dark:text-amber-200">{otpForDev}</strong> (or enter 123456)
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-zinc-500">
            <span>Resend OTP in: {timer}s</span>
            <button
              type="button"
              disabled={timer > 0 || loading}
              onClick={handleSendOtp}
              className="text-teal-600 dark:text-teal-400 disabled:opacity-40 font-medium hover:underline"
            >
              Resend Code
            </button>
          </div>

          <button
            type="submit"
            disabled={loading || otp.length < 6}
            className="w-full py-3.5 px-4 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-medium text-sm rounded-2xl transition-all shadow-lg shadow-teal-600/20 flex items-center justify-center gap-2"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Verify OTP & Continue</span>
              </>
            )}
          </button>
        </form>
      )}

      {step === "verified" && (
        <div className="py-6 flex flex-col items-center justify-center text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-600/20 animate-bounce">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h4 className="text-base font-semibold text-zinc-900 dark:text-white">
            Mobile Verified!
          </h4>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {phone} verified via Fast2SMS. Proceeding to intake...
          </p>
        </div>
      )}
    </div>
  );
}
