import React from "react";
import { cn } from "@/lib/utils";

export function Input({ className, type = "text", ...props }) {
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-400 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:ring-offset-slate-950 dark:focus:ring-white/30",
        className
      )}
      {...props}
    />
  );
}
