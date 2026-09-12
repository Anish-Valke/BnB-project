import React from "react";
import GlassCard from "../ui/GlassCard";
import { User, Activity, Clock, FileText } from "lucide-react";

interface DoctorPatientCardProps {
  tokenNumber: number;
  patientName: string;
  age: number;
  gender: string;
  phone: string;
  complaint: string;
  priorHistory: string;
  expectedTurnTime?: string;
  predictedMins?: number;
}

export default function DoctorPatientCard({
  tokenNumber,
  patientName,
  age,
  gender,
  phone,
  complaint,
  priorHistory,
  expectedTurnTime,
  predictedMins = 8
}: DoctorPatientCardProps) {
  return (
    <GlassCard className="relative overflow-hidden w-full mb-6 border-l-4 border-l-primary">
      <div className="flex flex-col md:flex-row justify-between gap-6">
        
        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-3">
            <span className="flex h-3 w-3 rounded-full bg-red-500 animate-pulse"></span>
            <span className="text-sm font-bold tracking-wider text-primary uppercase">Current Patient</span>
          </div>
          
          <div className="flex items-end gap-4">
            <div className="text-6xl font-bold gradient-text">#{tokenNumber}</div>
            <div className="pb-2">
              <h2 className="text-2xl font-bold text-foreground">{patientName}</h2>
              <div className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                <span>{age} yrs</span>
                <span>&bull;</span>
                <span>{gender}</span>
                <span>&bull;</span>
                <span className="font-mono">{phone}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full md:w-1/3 bg-surface-hover rounded-xl p-4 flex flex-col justify-center border border-gray-100">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Turn Status</p>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Expected Time</p>
              <p className="text-lg font-bold text-foreground flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                {expectedTurnTime || "Now"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Est. Duration</p>
              <p className="text-lg font-bold text-foreground">{predictedMins} min</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-gray-100 grid md:grid-cols-2 gap-6">
        <div>
          <h4 className="text-sm font-semibold text-gray-500 mb-2 flex items-center gap-2">
            <Activity className="w-4 h-4 text-secondary" />
            Chief Complaint
          </h4>
          <p className="text-foreground bg-white p-3 rounded-xl border border-gray-100 min-h-[80px]">
            {complaint || "No complaint provided."}
          </p>
        </div>
        
        <div>
          <h4 className="text-sm font-semibold text-gray-500 mb-2 flex items-center gap-2">
            <FileText className="w-4 h-4 text-secondary" />
            Medical History
          </h4>
          <p className="text-gray-600 bg-white p-3 rounded-xl border border-gray-100 min-h-[80px]">
            {priorHistory || "No prior medical history reported."}
          </p>
        </div>
      </div>
    </GlassCard>
  );
}
