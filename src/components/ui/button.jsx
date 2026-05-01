import React from "react";
import { cn } from "@/lib/utils";

const variants = {
  default: "bg-slate-200 text-slate-950 hover:bg-slate-300",
  outline: "border border-white/20 bg-transparent hover:bg-white/10",
};

const sizes = {
  default: "h-10 px-4 py-2",
  icon: "h-10 w-10",
};

export function Button({
  className,
  variant = "default",
  size = "default",
  type = "button",
  ...props
}) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-white/30 disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
}
