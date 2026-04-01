import { Activity } from "lucide-react";

interface SystemBadgeProps {
  text: string;
  variant?: "cyan" | "green" | "orange" | "amber";
}

export function SystemBadge({ text, variant = "cyan" }: SystemBadgeProps) {
  const colors = {
    cyan: "bg-accent/10 text-accent border-accent/20",
    green: "bg-[#00FF87]/10 text-[#00FF87] border-[#00FF87]/20",
    orange: "bg-[#FF6B35]/10 text-[#FF6B35] border-[#FF6B35]/20",
    amber: "bg-primary/10 text-primary border-primary/20",
  };

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium ${colors[variant]}`}
    >
      <Activity className="w-3 h-3 animate-pulse" />
      {text}
    </div>
  );
}
