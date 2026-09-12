import React from "react";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
}

export default function GlassCard({ children, className = "", hoverEffect = false }: GlassCardProps) {
  return (
    <div
      className={`glass-panel rounded-2xl p-6 ${hoverEffect ? "glass-panel-hover cursor-pointer" : ""} ${className}`}
    >
      {children}
    </div>
  );
}
