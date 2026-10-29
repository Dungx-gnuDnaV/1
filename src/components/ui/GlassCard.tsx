"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  gradient?: boolean;
  hoverEffect?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className,
  gradient = false,
  hoverEffect = true,
  ...props
}) => {
  return (
    <div
      className={cn(
        "rounded-2xl p-5 border backdrop-blur-md transition-all duration-300",
        "bg-white/80 dark:bg-slate-900/70 border-white/60 dark:border-slate-800/80 shadow-sm shadow-slate-200/50 dark:shadow-none",
        gradient && "bg-gradient-to-br from-white/90 via-slate-50/70 to-blue-50/30 dark:from-slate-900/90 dark:via-slate-900/60 dark:to-slate-800/40",
        hoverEffect && "hover:shadow-md hover:border-blue-500/30 dark:hover:border-blue-500/30 hover:-translate-y-0.5",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
