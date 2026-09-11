"use client";

import React, { useState, useEffect } from "react";
import { User, Clock, AlertTriangle, CheckCircle, SkipForward, ArrowRight, Activity, Users, Loader2 } from "lucide-react";
import { Doctor, Token, QueueResponse } from "@/lib/types";

export default function DoctorConsolePage() {
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [queue, setQueue] = useState<Token[]>([]);
  const [currentServing, setCurrentServing] = useState<Token | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const DOCTOR_ID = "doc_general_medicine_104";

  const fetchQueue = async () => {
    try {
      const res = await fetch(`/api/queue/${DOCTOR_ID}`);
      if (res.ok) {
        const data: QueueResponse = await res.json();
        setDoctor(data.doctor);
        setQueue(data.queue.filter((t) => t.status === "waiting"));
        setCurrentServing(data.current_serving || null);
      }
    } catch (err) {
      console.error("Failed to fetch queue", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleAction = async (action: "next" | "skip" | "emergency") => {
    if (actionLoading) return;
    setActionLoading(action);
    
    // Optimistic UI updates
    if (action === "next" && queue.length > 0) {
      const nextToken = queue[0];
      setCurrentServing(nextToken);
      setQueue(queue.slice(1));
    } else if (action === "skip" && queue.length > 0) {
      const nextToken = queue[0];
      setCurrentServing(nextToken);
      setQueue(queue.slice(1));
    } else if (action === "emergency" && doctor) {
      setDoctor({ ...doctor, emergency_delay: doctor.emergency_delay + 15 });
    }

    try {
      const res = await fetch(`/api/queue/${DOCTOR_ID}/${action}`, {
        method: "POST",
      });
      if (res.ok) {
        // Fetch to ensure true state alignment
        await fetchQueue();
      } else {
        console.error(`Action ${action} failed`);
        await fetchQueue(); // Revert on failure
      }
    } catch (err) {
      console.error(err);
      await fetchQueue(); // Revert on failure
    } finally {
      setActionLoading(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 lg:p-10 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              {doctor?.name || "Dr. Anjali Sharma"}
            </h1>
            <p className="text-slate-500 font-medium flex items-center mt-1">
              <Activity className="w-4 h-4 mr-1.5 text-emerald-500" />
              {doctor?.department || "General Medicine (Room 104)"}
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row gap-3">
            {doctor?.emergency_delay ? (
              <div className="flex items-center space-x-2 bg-red-50 text-red-700 px-4 py-2 rounded-xl border border-red-200 font-medium text-sm">
                <AlertTriangle className="w-4 h-4" />
                <span>Emergency Delay: +{doctor.emergency_delay}m</span>
              </div>
            ) : null}
            <div className="flex items-center space-x-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
              <Users className="w-5 h-5 text-slate-400" />
              <div className="text-sm">
                <span className="block text-slate-500 font-semibold">Queue Status</span>
                <span className="block text-slate-900 font-bold">{queue.length} Patients Waiting</span>
              </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Active Patient & Controls */}
          <div className="lg:col-span-1 space-y-6">
            {/* Active Patient Card */}
            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100 relative min-h-[300px]">
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-emerald-50 rounded-full blur-3xl"></div>

              <div className="p-6 sm:p-8 relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      Now Serving
                    </p>
                    <div className="text-5xl font-black text-emerald-600">
                      {currentServing ? `#${currentServing.token_number}` : "--"}
                    </div>
                  </div>
                  {currentServing?.triage_level && (
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        currentServing.triage_level === "express"
                          ? "bg-red-100 text-red-700"
                          : currentServing.triage_level === "priority"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {currentServing.triage_level}
                    </span>
                  )}
                </div>

                <div className="space-y-4">
                  {currentServing ? (
                    <>
                      <div>
                        <h2 className="text-xl font-bold text-slate-900 flex items-center">
                          <User className="w-5 h-5 mr-2 text-slate-400" />
                          {currentServing.patient_name}
                        </h2>
                      </div>

                      <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                          Chief Complaint
                        </p>
                        <p className="text-slate-700 font-medium">{currentServing.chief_complaint}</p>
                      </div>

                      <div className="flex items-center text-slate-600 font-medium">
                        <Clock className="w-5 h-5 mr-2 text-amber-500" />
                        AI Predicted: {currentServing.predicted_mins} mins
                      </div>
                    </>
                  ) : (
                    <div className="text-slate-500 flex flex-col items-center justify-center pt-8">
                      <p>No patient currently being served.</p>
                      <p className="text-sm">Call the next token to begin.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Control Actions */}
            <div className="space-y-3">
              <button
                onClick={() => handleAction("next")}
                disabled={!!actionLoading || queue.length === 0}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white font-bold py-4 px-6 rounded-2xl shadow-lg shadow-emerald-600/20 transition-all active:scale-95 flex items-center justify-center text-lg disabled:cursor-not-allowed"
              >
                {actionLoading === "next" ? (
                  <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="w-6 h-6 mr-2" />
                )}
                Call Next Token
              </button>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleAction("skip")}
                  disabled={!!actionLoading || !currentServing}
                  className="bg-white hover:bg-slate-50 disabled:bg-slate-100 disabled:text-slate-400 border border-slate-200 text-slate-700 font-semibold py-3 px-4 rounded-2xl transition-all active:scale-95 flex items-center justify-center disabled:cursor-not-allowed"
                >
                  {actionLoading === "skip" ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin text-slate-400" />
                  ) : (
                    <SkipForward className="w-4 h-4 mr-2 text-slate-400" />
                  )}
                  Skip / No-Show
                </button>
                <button
                  onClick={() => handleAction("emergency")}
                  disabled={!!actionLoading}
                  className="bg-red-50 hover:bg-red-100 disabled:bg-red-50/50 disabled:text-red-400 border border-red-200 text-red-700 font-semibold py-3 px-4 rounded-2xl transition-all active:scale-95 flex items-center justify-center disabled:cursor-not-allowed"
                >
                  {actionLoading === "emergency" ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 mr-2" />
                  )}
                  +15m Delay
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Queue Table */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden h-full flex flex-col">
              <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-800">Incoming Queue</h2>
                <div className="text-sm text-slate-500 font-medium">Next {queue.length} Patients</div>
              </div>

              <div className="overflow-x-auto flex-1">
                {queue.length > 0 ? (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold border-b border-slate-100">
                        <th className="p-4 pl-6 whitespace-nowrap">Token</th>
                        <th className="p-4 whitespace-nowrap">Patient</th>
                        <th className="p-4 whitespace-nowrap">Complaint</th>
                        <th className="p-4 whitespace-nowrap">Duration</th>
                        <th className="p-4 pr-6 text-right whitespace-nowrap">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {queue.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="p-4 pl-6">
                            <span className="font-bold text-slate-900 text-lg">#{item.token_number}</span>
                          </td>
                          <td className="p-4">
                            <div className="font-medium text-slate-900">{item.patient_name}</div>
                            <div className="mt-1">
                              {item.triage_level === "routine" && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600">
                                  Routine
                                </span>
                              )}
                              {item.triage_level === "priority" && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-700">
                                  Priority
                                </span>
                              )}
                              {item.triage_level === "express" && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">
                                  Express
                                </span>
                              )}
                            </div>
                          </td>
                          <td
                            className="p-4 text-slate-600 text-sm max-w-[200px] truncate"
                            title={item.chief_complaint}
                          >
                            {item.chief_complaint}
                          </td>
                          <td className="p-4">
                            <span className="inline-flex items-center text-sm font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md">
                              ~{item.predicted_mins}m
                            </span>
                          </td>
                          <td className="p-4 pr-6 text-right">
                            <button
                              disabled={!!actionLoading}
                              onClick={() => {
                                // Currently acts the same as calling next globally 
                                // To make this work optimally we could create a /call specific endpoint
                                // but for now, we leave the action icon visual.
                                handleAction("next");
                              }}
                              className="text-emerald-600 hover:text-emerald-700 disabled:opacity-50 opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-emerald-50 rounded-full"
                              title="Call Next"
                            >
                              <ArrowRight className="w-5 h-5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center p-12 text-slate-400">
                    <CheckCircle className="w-12 h-12 mb-4 text-slate-200" />
                    <p className="text-lg font-medium text-slate-600">The queue is empty.</p>
                    <p className="text-sm">All patients have been attended to.</p>
                  </div>
                )}
              </div>

              {/* Empty State / End of Queue */}
              {queue.length > 0 && (
                <div className="p-6 text-center text-slate-500 text-sm border-t border-slate-100 mt-auto bg-slate-50/30">
                  End of visible queue
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
