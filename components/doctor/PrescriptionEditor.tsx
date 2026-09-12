import React from "react";
import GlassCard from "../ui/GlassCard";
import { Stethoscope, ClipboardList } from "lucide-react";

interface PrescriptionEditorProps {
  doctorNotes: string;
  setDoctorNotes: (val: string) => void;
  prescriptionText: string;
  setPrescriptionText: (val: string) => void;
  patientHistory?: any[];
}

export default function PrescriptionEditor({
  doctorNotes,
  setDoctorNotes,
  prescriptionText,
  setPrescriptionText,
  patientHistory = []
}: PrescriptionEditorProps) {
  return (
    <div className="space-y-6">
      <GlassCard className="p-0 overflow-hidden">
        <div className="bg-surface-hover px-5 py-3 border-b border-gray-100 flex items-center gap-2">
          <Stethoscope className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-foreground">Consultation Notes</h3>
        </div>
        <div className="p-5 space-y-4 bg-white">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Internal Doctor Notes</label>
            <textarea
              value={doctorNotes}
              onChange={(e) => setDoctorNotes(e.target.value)}
              className="w-full bg-surface-hover border border-gray-200 rounded-xl p-3 text-sm text-foreground placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              placeholder="Internal notes (optional)..."
              rows={2}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Prescription & Advice</label>
            <textarea
              value={prescriptionText}
              onChange={(e) => setPrescriptionText(e.target.value)}
              className="w-full bg-surface-hover border border-gray-200 rounded-xl p-3 text-sm text-foreground placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              placeholder="Write prescription medicines, tests, or advice here..."
              rows={4}
            />
          </div>
        </div>
      </GlassCard>

      {patientHistory.length > 0 && (
        <GlassCard className="p-0 overflow-hidden">
          <div className="bg-surface-hover px-5 py-3 border-b border-gray-100 flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-secondary" />
            <h3 className="font-semibold text-foreground">Past History & Visits</h3>
          </div>
          <div className="p-5 bg-white max-h-64 overflow-y-auto space-y-3">
            {patientHistory.map((hist) => (
              <div key={hist.id} className="bg-surface-hover rounded-xl p-4 border border-gray-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-bold text-foreground">{hist.date}</span>
                  <span className="text-[10px] bg-secondary/10 text-secondary px-2 py-0.5 rounded-full font-semibold tracking-wider uppercase">{hist.department}</span>
                </div>
                <p className="text-sm text-gray-500 mb-3"><span className="font-medium text-gray-700">Complaint:</span> {hist.chief_complaint}</p>
                {hist.prescription_text && (
                  <div className="bg-white p-3 border border-gray-100 rounded-lg">
                    <p className="text-sm font-medium text-foreground whitespace-pre-wrap leading-relaxed">
                      {hist.prescription_text}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
}
