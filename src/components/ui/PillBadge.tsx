"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface PillBadgeProps {
  variant?: "default" | "success" | "warning" | "danger" | "info" | "purple" | "outline";
  size?: "sm" | "md";
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
  dot?: boolean;
}

export const PillBadge: React.FC<PillBadgeProps> = ({
  variant = "default",
  size = "md",
  children,
  icon,
  className,
  dot = false,
}) => {
  const baseStyles =
    "inline-flex items-center font-medium rounded-full backdrop-blur-md transition-all";

  const variants = {
    default: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700/50",
    success: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/50",
    warning: "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200/50 dark:border-amber-800/50",
    danger: "bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200/50 dark:border-rose-800/50",
    info: "bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300 border border-sky-200/50 dark:border-sky-800/50",
    purple: "bg-violet-50 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300 border border-violet-200/50 dark:border-violet-800/50",
    outline: "bg-transparent border border-slate-300 text-slate-700 dark:border-slate-700 dark:text-slate-300",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-xs gap-1",
    md: "px-3 py-1 text-xs gap-1.5",
  };

  const dotColors = {
    default: "bg-slate-400",
    success: "bg-emerald-500",
    warning: "bg-amber-500",
    danger: "bg-rose-500",
    info: "bg-sky-500",
    purple: "bg-violet-500",
    outline: "bg-slate-400",
  };

  return (
    <span className={cn(baseStyles, variants[variant], sizes[size], className)}>
      {dot && <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", dotColors[variant])} />}
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </span>
  );
};
