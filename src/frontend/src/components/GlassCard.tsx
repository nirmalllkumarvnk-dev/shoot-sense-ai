import { cn } from "@/lib/utils";
import type { KeyboardEvent, ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  neon?: "cyan" | "purple" | "none";
  onClick?: () => void;
  "data-ocid"?: string;
}

export function GlassCard({
  children,
  className = "",
  neon = "cyan",
  onClick,
  "data-ocid": dataOcid,
}: GlassCardProps) {
  const neonClass =
    neon === "cyan"
      ? "border-[oklch(0.55_0.26_264/0.5)] shadow-[0_0_20px_oklch(0.55_0.26_264/0.25),inset_0_0_20px_oklch(0.55_0.26_264/0.05)]"
      : neon === "purple"
        ? "border-[oklch(0.6_0.25_305/0.5)] shadow-[0_0_20px_oklch(0.6_0.25_305/0.25),inset_0_0_20px_oklch(0.6_0.25_305/0.05)]"
        : "border-border/30 shadow-none";

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if ((e.key === "Enter" || e.key === " ") && onClick) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div
      data-ocid={dataOcid}
      onClick={onClick}
      onKeyDown={onClick ? handleKeyDown : undefined}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={cn(
        "glassmorphism rounded-xl border",
        neonClass,
        onClick ? "cursor-pointer hover:scale-[1.02] transition-smooth" : "",
        className,
      )}
    >
      {children}
    </div>
  );
}
