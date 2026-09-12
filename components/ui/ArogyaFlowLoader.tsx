"use client";

import React from "react";
import { Activity, HeartPulse, Sparkles } from "lucide-react";

interface ArogyaFlowLoaderProps {
  message?: string;
  subtext?: string;
  fullScreen?: boolean;
}

export default function ArogyaFlowLoader({
  message = "Syncing OPD Queue Data...",
  subtext = "Connecting securely to ArogyaFlow Health Network",
  fullScreen = true,
}: ArogyaFlowLoaderProps) {
  const content = (
    <div className="flex flex-col items-center justify-center text-center p-8 relative z-10 max-w-sm mx-auto">
      {/* Outer Ambient Glowing Medical Aura */}
      <div className="absolute w-52 h-52 bg-teal-500/20 rounded-full blur-3xl animate-pulse pointer-events-none" />
      <div className="absolute w-44 h-44 bg-cyan-500/15 rounded-full blur-2xl animate-ping delay-500 pointer-events-none" />

      {/* Main Animated Healthcare Badge Icon */}
      <div className="relative mb-6">
        <div className="relative p-6 bg-gradient-to-tr from-teal-600 via-cyan-600 to-emerald-600 text-white rounded-3xl shadow-2xl shadow-teal-600/30 flex items-center justify-center animate-bounce duration-1000">
          <HeartPulse className="w-10 h-10 animate-pulse" />
          <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white" />
          </span>
        </div>

        {/* Orbiting Sparkle Element */}
        <div className="absolute -top-2 -left-2 p-1.5 bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-teal-100 text-teal-600 animate-spin duration-3000">
          <Sparkles className="w-4 h-4" />
        </div>
      </div>

      {/* Animated EKG Heartbeat Wave SVG */}
      <div className="w-48 h-10 mb-4 text-teal-600 relative overflow-hidden flex items-center justify-center">
        <svg
          viewBox="0 0 200 40"
          className="w-full h-full stroke-teal-600 fill-none stroke-[2.5] stroke-linecap-round stroke-linejoin-round"
        >
          <path
            d="M 0 20 L 40 20 L 50 10 L 60 30 L 75 0 L 90 40 L 105 15 L 115 25 L 125 20 L 200 20"
            style={{
              strokeDasharray: 300,
              strokeDashoffset: 300,
              animation: "ekgWave 1.8s cubic-bezier(0.4, 0, 0.6, 1) infinite",
            }}
          />
        </svg>
      </div>

      {/* CSS Keyframes inline style for EKG Wave */}
      <style jsx>{`
        @keyframes ekgWave {
          0% {
            stroke-dashoffset: 300;
            opacity: 0.2;
          }
          50% {
            stroke-dashoffset: 0;
            opacity: 1;
          }
          100% {
            stroke-dashoffset: -300;
            opacity: 0.2;
          }
        }
      `}</style>

      {/* Primary Message */}
      <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2 mb-1">
        <span>{message}</span>
      </h3>

      {/* Subtext */}
      <p className="text-xs font-medium text-slate-500 leading-relaxed">
        {subtext}
      </p>

      {/* Three Bouncing Dots Progress Bar */}
      <div className="flex items-center gap-1.5 mt-5">
        <span className="w-2.5 h-2.5 rounded-full bg-teal-600 animate-bounce [animation-delay:-0.3s]" />
        <span className="w-2.5 h-2.5 rounded-full bg-cyan-600 animate-bounce [animation-delay:-0.15s]" />
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-bounce" />
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 bg-white/95 backdrop-blur-md flex items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
}
