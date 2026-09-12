import React from "react";
import GlassCard from "../ui/GlassCard";
import { Calendar, User, Pill } from "lucide-react";

interface VisitHistoryCardProps {
  date: string;
  doctorName: string;
  department: string;
  complaint: string;
  doctorNotes?: string | null;
  prescriptionText?: string | null;
}

export default function VisitHistoryCard({
  date,
  doctorName,
  department,
  complaint,
  doctorNotes,
  prescriptionText
}: VisitHistoryCardProps) {
  return (
    <GlassCard className="mb-4 hover:border-primary/20 transition-colors">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <User className="w-4 h-4 text-gray-400" />
              {doctorName}
            </h3>
            <p className="text-sm text-gray-500">{department}</p>
          </div>
          <div className="flex items-center gap-2 text-sm font-medium text-gray-500 bg-surface px-3 py-1 rounded-full border border-gray-100">
            <Calendar className="w-4 h-4 text-primary" />
            {date}
          </div>
        </div>
        
        <div className="bg-surface-hover rounded-xl p-4">
          <p className="text-sm text-gray-500 mb-1 font-semibold uppercase tracking-wider text-[10px]">Chief Complaint</p>
          <p className="text-sm font-medium text-foreground">{complaint}</p>
        </div>

        {doctorNotes && (
          <div className="bg-surface-hover rounded-xl p-4 border border-gray-100">
            <p className="text-sm text-gray-500 mb-1 font-semibold uppercase tracking-wider text-[10px]">Doctor Notes</p>
            <p className="text-sm text-foreground italic">{doctorNotes}</p>
          </div>
        )}

        {prescriptionText && (
          <div className="bg-primary/5 rounded-xl p-4 border border-primary/10">
            <p className="text-sm text-primary mb-2 font-semibold uppercase tracking-wider text-[10px] flex items-center gap-1">
              <Pill className="w-3 h-3" />
              Prescription
            </p>
            <pre className="text-sm font-medium text-foreground whitespace-pre-wrap font-sans leading-relaxed">
              {prescriptionText}
            </pre>
          </div>
        )}
      </div>
    </GlassCard>
  );
}
