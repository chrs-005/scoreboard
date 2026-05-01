import React from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }) {
  return <section className={cn("rounded-xl border text-white", className)} {...props} />;
}

export function CardHeader({ className, ...props }) {
  return <div className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />;
}

export function CardTitle({ className, ...props }) {
  return <h2 className={cn("font-semibold leading-none tracking-tight", className)} {...props} />;
}

export function CardContent({ className, ...props }) {
  return <div className={cn("p-6 pt-0", className)} {...props} />;
}
