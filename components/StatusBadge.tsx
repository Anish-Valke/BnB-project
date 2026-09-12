import React from "react";
import { CheckCircle2, Clock, MapPin } from "lucide-react";

interface StatusBadgeProps {
  status: "Now Serving" | "Buffer" | "Relax" | "Inside";
  size?: "sm" | "md" | "lg";
}

export default function StatusBadge({
  status,
  size = "md",
}: StatusBadgeProps) {
  
  const config = {
    Relax: {
      bg: "bg-emerald-50 text-emerald-800 border-emerald-200",
      icon: <Clock className="w-4 h-4" />,
    },
    Buffer: {
      bg: "bg-amber-50 text-amber-700 border-amber-200",
      icon: <MapPin className="w-4 h-4" />,
    },
    "Now Serving": {
      bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: <CheckCircle2 className="w-4 h-4" />,
    },
    Inside: {
      bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: <CheckCircle2 className="w-4 h-4" />,
    }
  };

  const activeConfig = config[status] || config["Relax"];
  
  const sizes = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1.5 text-sm",
    lg: "px-4 py-2 text-base",
  };

  return (
    <div className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${activeConfig.bg} ${sizes[size]}`}>
      {activeConfig.icon}
      <span>{status}</span>
    </div>
  );
}
