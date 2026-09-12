import React from "react";
import GlassCard from "../ui/GlassCard";
import Button from "../ui/Button";
import { PlusCircle } from "lucide-react";

interface EmptyQueueStateProps {
  onGetToken: () => void;
  patientName: string;
}

export default function EmptyQueueState({ onGetToken, patientName }: EmptyQueueStateProps) {
  return (
    <GlassCard className="text-center py-16 px-6">
      <div className="w-24 h-24 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-6">
        <PlusCircle className="w-12 h-12 text-primary" />
      </div>
      
      <h2 className="text-2xl font-bold text-foreground mb-3">
        Ready for your consultation, {patientName.split(' ')[0]}?
      </h2>
      
      <p className="text-gray-500 max-w-md mx-auto mb-8 leading-relaxed">
        Get an OPD token and track your position live from anywhere in the hospital. Avoid crowded waiting rooms.
      </p>
      
      <Button onClick={onGetToken} size="lg" className="px-8 shadow-primary/30">
        Get OPD Token
      </Button>
    </GlassCard>
  );
}
