import React from "react";
import GlassCard from "../ui/GlassCard";
import { Pill, Calendar, User, Download } from "lucide-react";
import Button from "../ui/Button";

interface Medicine {
  name: string;
  dosage: string;
  duration: string;
  instructions: string;
}

interface PrescriptionCardProps {
  doctorName: string;
  date: string;
  medicines: Medicine[];
  generalInstructions?: string;
  onDownload?: () => void;
}

export default function PrescriptionCard({
  doctorName,
  date,
  medicines,
  generalInstructions,
  onDownload
}: PrescriptionCardProps) {
  return (
    <GlassCard className="mb-6 border border-primary/10 relative overflow-hidden">
      {/* Decorative top border */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary"></div>
      
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-xl font-bold text-foreground flex items-center gap-2 mb-1">
            <User className="w-5 h-5 text-primary" />
            {doctorName}
          </h3>
          <p className="text-sm text-gray-500 flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {date}
          </p>
        </div>
        
        {onDownload && (
          <button 
            onClick={onDownload}
            className="p-2 text-primary hover:bg-primary/10 rounded-full transition-colors"
            title="Download PDF"
          >
            <Download className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="space-y-4">
        <h4 className="font-semibold text-foreground text-sm uppercase tracking-wider mb-2">Medicines</h4>
        
        {medicines.map((med, idx) => (
          <div key={idx} className="bg-surface-hover rounded-xl p-4 border border-gray-100 flex items-start gap-4">
            <div className="bg-white p-2 rounded-lg shadow-sm mt-1">
              <Pill className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <div className="flex flex-wrap items-baseline gap-2 mb-1">
                <span className="font-bold text-lg text-foreground">{med.name}</span>
                <span className="text-sm font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">{med.dosage}</span>
                <span className="text-sm text-gray-500">{med.duration}</span>
              </div>
              <p className="text-gray-600 text-sm mt-1">{med.instructions}</p>
            </div>
          </div>
        ))}
      </div>

      {generalInstructions && (
        <div className="mt-6 pt-4 border-t border-gray-100">
          <h4 className="font-semibold text-foreground text-sm uppercase tracking-wider mb-2">Doctor's Note</h4>
          <p className="text-gray-600 bg-yellow-50/50 p-4 rounded-xl border border-yellow-100/50 italic">
            "{generalInstructions}"
          </p>
        </div>
      )}
    </GlassCard>
  );
}
