import React from "react";
import GlassCard from "../ui/GlassCard";
import { Clock, Users, Activity } from "lucide-react";
import HindiVoiceButton from "../HindiVoiceButton";
import StatusBadge from "../StatusBadge";

interface ActiveQueueCardProps {
  tokenNumber: number;
  currentServing: number;
  patientsAhead: number;
  estimatedWaitTime: number;
  expectedTime: string;
  doctorName: string;
  department: string;
  roomNumber: string;
  status: "Now Serving" | "Buffer" | "Relax";
  statusMessage: string;
  onRefresh?: () => void;
}

export default function ActiveQueueCard({
  tokenNumber,
  currentServing,
  patientsAhead,
  estimatedWaitTime,
  expectedTime,
  doctorName,
  department,
  roomNumber,
  status,
  statusMessage,
  onRefresh
}: ActiveQueueCardProps) {
  return (
    <GlassCard className="relative overflow-hidden w-full max-w-3xl mx-auto">
      {/* Background Gradient Accent */}
      <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pb-6 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="flex h-3 w-3 rounded-full bg-red-500 animate-pulse"></span>
            <span className="text-sm font-semibold tracking-wider text-gray-500 uppercase">Live Now</span>
          </div>
          <h2 className="text-xl font-bold text-foreground">{doctorName}</h2>
          <p className="text-sm text-gray-500">{department} &bull; Room {roomNumber}</p>
        </div>
        
        <div className="mt-4 md:mt-0 flex items-center gap-3">
          <HindiVoiceButton
            text={`आपका टोकन नंबर ${tokenNumber} है। वर्तमान में टोकन नंबर ${currentServing} चल रहा है। ${statusMessage}`}
          />
          {onRefresh && (
            <button onClick={onRefresh} className="p-2 rounded-full bg-surface-hover hover:bg-gray-200 transition-colors">
              <Activity className="w-5 h-5 text-gray-600" />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 text-center md:text-left">
        <div className="col-span-2 md:col-span-1">
          <p className="text-sm text-gray-500 mb-1">Your Token</p>
          <div className="text-6xl font-bold gradient-text">#{tokenNumber}</div>
        </div>
        
        <div>
          <p className="text-sm text-gray-500 mb-1">Currently Serving</p>
          <div className="text-3xl font-semibold text-foreground">#{currentServing}</div>
        </div>
        
        <div>
          <p className="text-sm text-gray-500 mb-1">Patients Ahead</p>
          <div className="flex items-center justify-center md:justify-start gap-2">
            <Users className="w-5 h-5 text-gray-400" />
            <span className="text-3xl font-semibold text-foreground">{patientsAhead}</span>
          </div>
        </div>
        
        <div>
          <p className="text-sm text-gray-500 mb-1">Est. Wait Time</p>
          <div className="flex items-center justify-center md:justify-start gap-2">
            <Clock className="w-5 h-5 text-gray-400" />
            <span className="text-2xl font-semibold text-foreground">~{estimatedWaitTime} min</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">Est. Turn: {expectedTime}</p>
        </div>
      </div>

      <div className="flex items-center justify-between bg-surface-hover rounded-xl p-4">
        <div className="flex items-center gap-3">
          <StatusBadge status={status} size="lg" />
          <span className="font-medium text-foreground hidden sm:block">{statusMessage}</span>
        </div>
      </div>
    </GlassCard>
  );
}
