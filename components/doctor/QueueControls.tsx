import React from "react";
import Button from "../ui/Button";
import { Play, Pause, Clock } from "lucide-react";

interface QueueControlsProps {
  onNextPatient: () => void;
  onWaitPatient: () => void;
  onAddDelay: (minutes: number) => void;
  isLoading?: boolean;
}

export default function QueueControls({
  onNextPatient,
  onWaitPatient,
  onAddDelay,
  isLoading = false
}: QueueControlsProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 w-full">
      <div className="flex-1 flex gap-3">
        <Button 
          variant="primary" 
          className="flex-1" 
          onClick={onNextPatient} 
          disabled={isLoading}
        >
          <Play className="w-5 h-5 mr-2" />
          Call Next Patient
        </Button>
        <Button 
          variant="secondary" 
          className="flex-1" 
          onClick={onWaitPatient} 
          disabled={isLoading}
        >
          <Pause className="w-5 h-5 mr-2" />
          Wait
        </Button>
      </div>

      <div className="flex items-center gap-2 bg-surface-hover p-1.5 rounded-full border border-gray-100">
        <span className="pl-3 pr-1 text-xs font-semibold text-gray-500 flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          Delay:
        </span>
        <Button variant="ghost" size="sm" onClick={() => onAddDelay(2)} disabled={isLoading} className="rounded-full text-xs py-1.5 px-3">
          +2m
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onAddDelay(5)} disabled={isLoading} className="rounded-full text-xs py-1.5 px-3">
          +5m
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onAddDelay(10)} disabled={isLoading} className="rounded-full text-xs py-1.5 px-3">
          +10m
        </Button>
      </div>
    </div>
  );
}
