"use client";

import React, { useEffect, useState } from "react";
import { Clock, User, Stethoscope, MapPin } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import HindiVoiceButton from "@/components/HindiVoiceButton";
import { supabase } from "@/lib/supabase";
import { Doctor, Token } from "@/lib/types";
import { calculateTokenWaitTime } from "@/lib/queue-calculator";

interface PatientTrackerClientProps {
  initialDoctor: Doctor;
  initialTokens: Token[];
  heroToken: Token;
}

export default function PatientTrackerClient({
  initialDoctor,
  initialTokens,
  heroToken,
}: PatientTrackerClientProps) {
  const [doctor, setDoctor] = useState<Doctor>(initialDoctor);
  const [tokens, setTokens] = useState<Token[]>(initialTokens);

  // Calculate current state based on latest doctor and tokens
  const queueCalculation = calculateTokenWaitTime(heroToken, doctor, tokens);
  const currentToken = doctor.current_token || 0;
  const myToken = heroToken.token_number;
  const patientsAhead = queueCalculation.patients_ahead;
  const estimatedWaitMins = queueCalculation.estimated_wait_mins;
  const estimatedTime = queueCalculation.expected_turn_time;

  useEffect(() => {
    // Subscribe to changes in the 'doctors' table for this specific doctor
    const doctorSubscription = supabase
      .channel(`doctor-changes-${doctor.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "doctors",
          filter: `id=eq.${doctor.id}`,
        },
        (payload) => {
          setDoctor(payload.new as Doctor);
        }
      )
      .subscribe();

    // Subscribe to changes in the 'tokens' table for this specific doctor
    const tokensSubscription = supabase
      .channel(`token-changes-${doctor.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tokens",
          filter: `doctor_id=eq.${doctor.id}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setTokens((prev) => [...prev, payload.new as Token].sort((a, b) => a.token_number - b.token_number));
          } else if (payload.eventType === "UPDATE") {
            setTokens((prev) =>
              prev.map((t) => (t.id === payload.new.id ? (payload.new as Token) : t))
            );
          } else if (payload.eventType === "DELETE") {
            setTokens((prev) => prev.filter((t) => t.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      doctorSubscription.unsubscribe();
      tokensSubscription.unsubscribe();
    };
  }, [doctor.id]);

  return (
    <div className="min-h-full bg-slate-50 flex flex-col p-4 sm:p-6 lg:p-8 overflow-x-hidden font-sans">
      {/* Header Section */}
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Arogya<span className="text-emerald-600">Flow</span>
          </h1>
          <p className="text-sm text-slate-500 font-medium flex items-center mt-1">
            <Stethoscope className="w-4 h-4 mr-1 text-slate-400" />
            {doctor.department}
          </p>
        </div>
        <div className="flex items-center text-xs font-semibold text-slate-600 bg-white px-3 py-1.5 rounded-full shadow-sm border border-slate-100">
          <MapPin className="w-3.5 h-3.5 mr-1 text-emerald-500" />
          {doctor.room_number || "Room 104"}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col space-y-6 max-w-md w-full mx-auto">
        <StatusBadge
          myToken={myToken}
          currentToken={currentToken}
          estimatedWaitMins={estimatedWaitMins}
        />

        {/* Giant Card for Tokens */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-6 sm:p-8 border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-emerald-50 rounded-full blur-3xl"></div>

          <div className="relative z-10 flex flex-col space-y-8">
            <div className="flex justify-between items-end border-b border-slate-100 pb-6">
              <div>
                <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Your Token
                </p>
                <div className="text-5xl font-black text-slate-900">
                  #{myToken}
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Now Serving
                </p>
                <div className="text-3xl font-bold text-slate-400">
                  #{currentToken}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <div className="flex items-center space-x-2 text-slate-500 mb-2">
                  <User className="w-4 h-4" />
                  <span className="text-sm font-medium">Patients Ahead</span>
                </div>
                <div className="text-2xl font-bold text-slate-800">
                  {patientsAhead}
                </div>
              </div>

              <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100">
                <div className="flex items-center space-x-2 text-emerald-600 mb-2">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-medium">Est. Wait</span>
                </div>
                <div className="text-2xl font-bold text-emerald-700">
                  ~{estimatedWaitMins}m
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Expected Time Note */}
        <div className="text-center mt-2">
          <p className="text-sm text-slate-500 font-medium">
            Expected consultation at{" "}
            <span className="font-bold text-slate-800">{estimatedTime}</span>
          </p>
        </div>
      </main>

      <HindiVoiceButton
        myToken={myToken}
        estimatedWaitMins={estimatedWaitMins}
        patientsAhead={patientsAhead}
      />
    </div>
  );
}
