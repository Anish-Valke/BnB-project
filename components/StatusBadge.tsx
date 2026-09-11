import React from "react";

interface StatusBadgeProps {
  myToken: number;
  currentToken: number;
  estimatedWaitMins: number;
}

export default function StatusBadge({
  myToken,
  currentToken,
  estimatedWaitMins,
}: StatusBadgeProps) {
  const patientsAhead = myToken - currentToken;

  // Determine status based on PRD requirements
  let status: "relax" | "buffer" | "inside";
  if (patientsAhead <= 0) {
    status = "inside";
  } else if (patientsAhead <= 3 || estimatedWaitMins <= 15) {
    status = "buffer";
  } else {
    status = "relax";
  }

  // Visual and textual configuration for each state
  const config = {
    relax: {
      bg: "bg-rose-50",
      border: "border-rose-200",
      iconBg: "bg-rose-100",
      iconColor: "bg-rose-500",
      titleText: "text-rose-800",
      descText: "text-rose-700",
      title: "Relax / Outside",
      desc: "Your turn is more than 15 minutes away. You can wait in the cafeteria or open area.",
    },
    buffer: {
      bg: "bg-amber-50",
      border: "border-amber-200",
      iconBg: "bg-amber-100",
      iconColor: "bg-amber-500",
      titleText: "text-amber-800",
      descText: "text-amber-700",
      title: "Buffer Zone",
      desc: "Please move to the waiting area near Room 104. You are coming up soon.",
    },
    inside: {
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      iconBg: "bg-emerald-100",
      iconColor: "bg-emerald-500",
      titleText: "text-emerald-800",
      descText: "text-emerald-600",
      title: "Inside Room Now",
      desc: "It is your turn. Please enter the doctor's room.",
    },
  };

  const currentConfig = config[status];

  return (
    <div
      className={`border rounded-2xl p-4 flex items-start space-x-3 transition-colors duration-500 ${currentConfig.bg} ${currentConfig.border}`}
    >
      <div className={`${currentConfig.iconBg} p-2 rounded-full mt-0.5`}>
        <div
          className={`w-2.5 h-2.5 rounded-full animate-pulse ${currentConfig.iconColor}`}
        ></div>
      </div>
      <div>
        <h2 className={`font-bold text-lg ${currentConfig.titleText}`}>
          {currentConfig.title}
        </h2>
        <p
          className={`text-sm mt-0.5 leading-relaxed ${currentConfig.descText}`}
        >
          {currentConfig.desc}
        </p>
      </div>
    </div>
  );
}
