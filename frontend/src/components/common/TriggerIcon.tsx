import { EventType } from "../../store/useClaimStore";
import { CloudRain, Thermometer, Wind, AlertOctagon } from "lucide-react";

interface TriggerIconProps {
  eventType: EventType;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

const config: Record<
  EventType,
  { icon: React.ElementType; color: string; label: string; bg: string }
> = {
  RAIN: {
    icon: CloudRain,
    color: "#00E5FF",
    bg: "#00E5FF15",
    label: "Heavy Rain",
  },
  HEAT: {
    icon: Thermometer,
    color: "#FF6B35",
    bg: "#FF6B3515",
    label: "Extreme Heat",
  },
  POLLUTION: {
    icon: Wind,
    color: "#9C27B0",
    bg: "#9C27B015",
    label: "High AQI",
  },
  CURFEW: {
    icon: AlertOctagon,
    color: "#FF3B30",
    bg: "#FF3B3015",
    label: "Curfew / Restriction",
  },
};

const sizeMap = {
  sm: { wrapper: "w-8 h-8", icon: "w-4 h-4", text: "text-xs" },
  md: { wrapper: "w-12 h-12", icon: "w-6 h-6", text: "text-sm" },
  lg: { wrapper: "w-16 h-16", icon: "w-8 h-8", text: "text-base" },
};

export function TriggerIcon({
  eventType,
  size = "md",
  showLabel = false,
}: TriggerIconProps) {
  const c = config[eventType];
  const s = sizeMap[size];
  const Icon = c.icon;

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`${s.wrapper} rounded-xl flex items-center justify-center flex-shrink-0`}
        style={{ background: c.bg }}
      >
        <Icon className={s.icon} style={{ color: c.color }} />
      </div>
      {showLabel && (
        <span className={`${s.text} font-medium`} style={{ color: c.color }}>
          {c.label}
        </span>
      )}
    </div>
  );
}
