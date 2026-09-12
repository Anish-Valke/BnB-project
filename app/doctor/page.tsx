"use client";

import React, { useState, useEffect } from "react";
import { Activity, Users, AlertTriangle, Loader2, CheckCircle } from "lucide-react";
import { Doctor, Token, QueueResponse } from "@/lib/types";
import DoctorPatientCard from "@/components/doctor/DoctorPatientCard";
import QueueControls from "@/components/doctor/QueueControls";
import PrescriptionEditor from "@/components/doctor/PrescriptionEditor";
import GlassCard from "@/components/ui/GlassCard";

export default function DoctorConsolePage() {
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [queue, setQueue] = useState<Token[]>([]);
  const [currentServing, setCurrentServing] = useState<Token | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [doctorNotes, setDoctorNotes] = useState("");
  const [prescriptionText, setPrescriptionText] = useState("");
  const [patientHistory, setPatientHistory] = useState<any[]>([]);

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

  useEffect(() => {
    if (currentServing?.patient_phone) {
      fetch(`/api/prescriptions/${currentServing.patient_phone}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.prescriptions) {
            setPatientHistory(data.prescriptions);
          } else {
            setPatientHistory([]);
          }
        })
        .catch(() => setPatientHistory([]));
    } else {
      setPatientHistory([]);
    }
  }, [currentServing]);

  const handleAction = async (action: "next" | "skip" | "emergency", delayMins?: number) => {
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
    } else if (action === "emergency" && doctor && delayMins) {
      setDoctor({ ...doctor, emergency_delay: doctor.emergency_delay + delayMins });
    }

    try {
      const res = await fetch(`/api/queue/${DOCTOR_ID}/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctor_notes: doctorNotes,
          prescription_text: prescriptionText,
          delay_mins: delayMins,
        }),
      });
      if (res.ok) {
        setDoctorNotes("");
        setPrescriptionText("");
        await fetchQueue();
      } else {
        console.error(`Action ${action} failed`);
        await fetchQueue();
      }
    } catch (err) {
      console.error(err);
      await fetchQueue();
    } finally {
      setActionLoading(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Top Navigation / Header */}
      <header className="bg-white border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 gap-4">
            <div className="flex items-center gap-4">
              <img
                src="/logo.jpg"
                alt="ArogyaFlow Logo"
                className="w-12 h-12 rounded-2xl shadow-md shadow-emerald-600/25 object-cover border border-emerald-100"
              />
              <div>
                <h1 className="text-xl font-black text-foreground">
                  {doctor?.name || "Dr. Anjali Sharma"}
                </h1>
                <p className="text-sm text-secondary font-medium flex items-center">
                  {doctor?.department || "General Medicine"} &bull; {doctor?.room_number || "Room 104"}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {doctor?.emergency_delay ? (
                <div className="flex items-center space-x-2 bg-red-50 text-red-700 px-4 py-2 rounded-xl border border-red-100 font-medium text-sm">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Emergency Delay: +{doctor.emergency_delay}m</span>
                </div>
              ) : null}
              <div className="flex items-center space-x-3 bg-surface px-4 py-2 rounded-xl border border-gray-100">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <span className="block text-xs text-gray-500 font-bold uppercase tracking-wider">Queue</span>
                  <span className="block text-sm text-foreground font-black">{queue.length} Waiting</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Left Column: Active Patient & Actions */}
          <div className="lg:col-span-7 space-y-6">

            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-foreground">Consultation Room</h2>
            </div>

            {currentServing ? (
              <>
                <DoctorPatientCard
                  tokenNumber={currentServing.token_number}
                  patientName={currentServing.patient_name}
                  age={currentServing.age || 35}
                  gender={currentServing.gender || "Unknown"}
                  phone={currentServing.patient_phone || "No phone"}
                  complaint={currentServing.chief_complaint}
                  priorHistory={currentServing.prior_history || ""}
                  predictedMins={currentServing.predicted_mins}
                />

                <PrescriptionEditor
                  doctorNotes={doctorNotes}
                  setDoctorNotes={setDoctorNotes}
                  prescriptionText={prescriptionText}
                  setPrescriptionText={setPrescriptionText}
                  patientHistory={patientHistory}
                />
              </>
            ) : (
              <GlassCard className="flex flex-col items-center justify-center py-24 text-center border-dashed border-2">
                <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="w-8 h-8 text-gray-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-500 mb-2">Room is Empty</h3>
                <p className="text-sm text-gray-400 max-w-md">
                  There is no patient currently in the consultation room. Call the next patient to begin.
                </p>
              </GlassCard>
            )}

            {/* Sticky bottom controls for the room */}
            <div className="sticky bottom-6 z-40 bg-white/80 backdrop-blur-md p-4 rounded-3xl border border-gray-200/50 shadow-2xl">
              <QueueControls
                onNextPatient={() => handleAction("next")}
                onWaitPatient={() => handleAction("skip")}
                onAddDelay={(mins) => handleAction("emergency", mins)}
                isLoading={!!actionLoading}
              />
            </div>

          </div>

          {/* Right Column: Waiting Queue list */}
          <div className="lg:col-span-5 space-y-6">
            <h2 className="text-2xl font-black text-foreground">Waiting Queue</h2>

            <GlassCard className="p-0 overflow-hidden">
              <div className="bg-surface-hover px-5 py-4 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-foreground">Next Up</h3>
                <span className="text-xs font-bold px-2.5 py-1 bg-white rounded-full border border-gray-200 shadow-sm">
                  {queue.length} Total
                </span>
              </div>

              <div className="max-h-[800px] overflow-y-auto">
                {queue.length > 0 ? (
                  <div className="divide-y divide-gray-100">
                    {queue.map((item) => (
                      <div key={item.id} className="p-5 hover:bg-surface-hover transition-colors flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-surface border border-gray-100 flex items-center justify-center shrink-0">
                          <span className="text-lg font-black text-primary">#{item.token_number}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-bold text-foreground truncate">{item.patient_name}</h4>
                            <span className="text-xs font-semibold text-gray-500 shrink-0">
                              ~{item.predicted_mins}m
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 truncate">{item.chief_complaint}</p>

                          {/* Triage badges */}
                          <div className="mt-2 flex gap-2">
                            {item.triage_level === "priority" && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700">
                                Priority
                              </span>
                            )}
                            {item.triage_level === "express" && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-700">
                                Express
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-12 text-center text-gray-400">
                    <p className="font-semibold text-gray-500">Queue is empty</p>
                    <p className="text-sm mt-1">All patients have been seen.</p>
                  </div>
                )}
              </div>
            </GlassCard>
          </div>

        </div>
      </main>
    </div>
  );
}
