"use client";

import React, { useState, useEffect } from "react";
import { MapPin, ShieldCheck, AlertTriangle, RefreshCw, SlidersHorizontal } from "lucide-react";
import { checkHospitalProximity } from "@/lib/location";
import { LocationVerification } from "@/lib/types";

interface LocationCheckCardProps {
  onVerified: (loc: LocationVerification) => void;
}

export default function LocationCheckCard({ onVerified }: LocationCheckCardProps) {
  const [dummyMode, setDummyMode] = useState(true);
  const [loading, setLoading] = useState(false);
  const [locationResult, setLocationResult] = useState<LocationVerification | null>(null);

  const verifyLocation = (isDummy: boolean) => {
    setLoading(true);
    if (isDummy) {
      setTimeout(() => {
        const res = checkHospitalProximity(undefined, undefined, true);
        setLocationResult(res);
        onVerified(res);
        setLoading(false);
      }, 500);
    } else {
      if (typeof window !== "undefined" && "geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const res = checkHospitalProximity(pos.coords.latitude, pos.coords.longitude, false);
            setLocationResult(res);
            onVerified(res);
            setLoading(false);
          },
          (err) => {
            console.warn("Geolocation error, using dummy location:", err.message);
            const res = checkHospitalProximity(undefined, undefined, true);
            setLocationResult(res);
            onVerified(res);
            setLoading(false);
          },
          { timeout: 5000 }
        );
      } else {
        const res = checkHospitalProximity(undefined, undefined, true);
        setLocationResult(res);
        onVerified(res);
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    verifyLocation(dummyMode);
  }, []);

  const handleToggleDummy = (checked: boolean) => {
    setDummyMode(checked);
    verifyLocation(checked);
  };

  return (
    <div className="w-full max-w-md mx-auto p-5 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-md">
      <div className="flex items-center justify-between mb-3 pb-3 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400 font-semibold shadow-inner">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-semibold text-zinc-900 dark:text-white text-xs">
              Hospital Geolocation Check
            </h4>
            <p className="text-[10px] text-zinc-500">Must be within 10 km hospital radius</p>
          </div>
        </div>

        <label className="flex items-center gap-1.5 cursor-pointer bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-full text-[10px] font-medium text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
          <SlidersHorizontal className="w-3 h-3 text-blue-500" />
          <span>Dummy Mode</span>
          <input
            type="checkbox"
            checked={dummyMode}
            onChange={(e) => handleToggleDummy(e.target.checked)}
            className="w-3 h-3 accent-blue-600 rounded cursor-pointer"
          />
        </label>
      </div>

      {loading ? (
        <div className="py-4 flex items-center justify-center gap-2 text-xs text-zinc-500">
          <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
          <span>Checking location proximity...</span>
        </div>
      ) : locationResult ? (
        <div
          className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs ${
            locationResult.isWithinRange
              ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300"
              : "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-300"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {locationResult.isWithinRange ? (
              <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
            )}
            <div>
              <p className="font-semibold">
                {locationResult.isWithinRange
                  ? `Location Verified (${locationResult.distanceKm} km away)`
                  : `Outside 10 km limit (${locationResult.distanceKm} km away)`}
              </p>
              <p className="text-[10px] opacity-80">
                {locationResult.hospitalName} {locationResult.isDummyMode ? "(Dummy Override Active)" : ""}
              </p>
            </div>
          </div>
          <button
            onClick={() => verifyLocation(dummyMode)}
            className="p-1.5 hover:bg-black/5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-white transition-all"
            title="Re-check Location"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : null}
    </div>
  );
}
