import * as React from "react";
import { cn } from "../../utils/cn";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "primary" | "secondary" | "success" | "warning" | "destructive" | "outline";
}

function Badge({ className, variant = "primary", ...props }: BadgeProps) {
  const variants = {
    primary:     "border-gold/25     bg-gold/12     text-gold",
    secondary:   "border-white/[0.1] bg-surface-2   text-ink-secondary",
    success:     "border-teal/20     bg-teal/10     text-teal",
    warning:     "border-amber/20    bg-amber/10    text-amber",
    destructive: "border-red/20      bg-red/[0.12]  text-red",
    outline:     "border-[#2a2a2a]   bg-transparent text-ink-secondary hover:border-[#333] hover:text-ink-primary",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

export default Badge;
