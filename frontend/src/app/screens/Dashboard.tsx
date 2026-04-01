import { MobileContainer } from "../components/MobileContainer";
import { BottomNav } from "../components/BottomNav";
import { SystemBadge } from "../components/SystemBadge";
import { TriggerIcon } from "../../components/common/TriggerIcon";
import {
  Shield,
  MapPin,
  CheckCircle2,
  ArrowRight,
  Calendar,
} from "lucide-react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { Button } from "../components/ui/button";
import { useAuthStore } from "../../store/useAuthStore";
import { useOnboardingStore } from "../../store/useOnboardingStore";
import { useClaimStore } from "../../store/useClaimStore";
import { useNotificationHandler } from "../../hooks/useNotificationHandler";

const RECENT_PAYOUTS = [
  { type: "RAIN" as const, amount: 485, date: "Apr 01", zone: "Anna Nagar" },
  { type: "POLLUTION" as const, amount: 320, date: "Mar 28", zone: "Anna Nagar" },
];

export function Dashboard() {
  const navigate = useNavigate();
  const { name, trustScore } = useAuthStore();
  const { location, upiId } = useOnboardingStore();
  const detectEvent = useClaimStore((s) => s.detectEvent);
  // Registers window.triggerDemoClaim() for judges — safe inside Router
  useNotificationHandler();

  const handleDemoClaim = () => {
    detectEvent(`EVT_${Date.now()}`, "RAIN", location?.zone || "Anna Nagar");
    navigate("/disruption-detected");
  };

  const trustPercent = trustScore;
  const circumference = 2 * Math.PI * 22;
  const trustOffset = circumference * (1 - trustPercent / 100);

  return (
    <MobileContainer hasBottomNav>
      <div className="px-6 py-8 space-y-5 pb-24">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Hey {name} 👋</h2>
            <div className="flex items-center gap-1 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-accent" />
              <p className="text-muted-foreground text-sm">
                {location?.zone || "Anna Nagar"}, {location?.city || "Chennai"}
              </p>
            </div>
          </div>
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-background font-bold">
            {name[0]}
          </div>
        </div>

        {/* Coverage + Trust Score */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-card to-secondary border border-border rounded-2xl p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-success/10 rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5 text-success" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Protection Active</h3>
                <p className="text-xs text-muted-foreground">All systems running</p>
              </div>
            </div>
            <SystemBadge text="Monitoring" variant="cyan" />
          </div>

          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-border/50">
            {/* Trust Score with ring */}
            <div className="text-center">
              <div className="flex justify-center mb-1">
                <svg width="44" height="44" viewBox="0 0 44 44" className="-rotate-90">
                  <circle cx="22" cy="22" r="18" fill="none" stroke="#2A2E3C" strokeWidth="4" />
                  <motion.circle
                    cx="22" cy="22" r="22" fill="none"
                    stroke="#FFA726" strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: trustOffset }}
                    transition={{ duration: 1.2 }}
                  />
                </svg>
                <span className="absolute mt-3 text-sm font-bold text-primary">
                  {trustScore}
                </span>
              </div>
              <div className="text-xs text-muted-foreground">Trust</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent mb-1">24/7</div>
              <div className="text-xs text-muted-foreground">Monitor</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-success mb-1">88%</div>
              <div className="text-xs text-muted-foreground">Coverage</div>
            </div>
          </div>
        </motion.div>

        {/* Weekly protection */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-sm">This Week's Protection</h3>
            </div>
            <span className="text-xs text-muted-foreground">Resets in 6d</span>
          </div>
          <div className="flex items-end gap-2 mb-2">
            <span className="text-3xl font-bold text-success">₹805</span>
            <span className="text-sm text-muted-foreground mb-1">protected so far</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-success to-accent rounded-full"
              initial={{ width: 0 }}
              animate={{ width: "52%" }}
              transition={{ duration: 1, delay: 0.3 }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">Weekly coverage active</p>
        </div>

        {/* Trigger monitoring */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm">Zone Monitoring</h3>
            <motion.div
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="flex items-center gap-1.5"
            >
              <div className="w-2 h-2 bg-success rounded-full" />
              <span className="text-xs text-success">Live</span>
            </motion.div>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {(["RAIN", "HEAT", "POLLUTION", "CURFEW"] as const).map((t) => (
              <div key={t} className="flex flex-col items-center gap-1">
                <TriggerIcon eventType={t} size="sm" showLabel />
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            System is monitoring your zone across all 4 triggers
          </p>
        </div>

        {/* Recent payouts */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="font-semibold text-sm mb-4">Recent Payouts</h3>
          {RECENT_PAYOUTS.map((p, i) => (
            <div
              key={i}
              className="flex items-center justify-between py-3 border-b border-border/50 last:border-0"
            >
              <div className="flex items-center gap-3">
                <TriggerIcon eventType={p.type} size="sm" />
                <div>
                  <p className="text-sm font-medium">{p.type.charAt(0) + p.type.slice(1).toLowerCase()} event</p>
                  <p className="text-xs text-muted-foreground">{p.date} · {p.zone}</p>
                </div>
              </div>
              <span className="font-bold text-success">+₹{p.amount}</span>
            </div>
          ))}
        </div>

        {/* Setup checklist */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="font-semibold text-sm mb-3">Your Setup</h3>
          <div className="space-y-2.5">
            {[
              { label: "Identity Verified", sub: "Aadhaar linked" },
              { label: "Location Active", sub: location?.zone || "Anna Nagar" },
              { label: "UPI Connected", sub: upiId || "Auto-pay ready" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                  <span className="text-sm">{item.label}</span>
                </div>
                <span className="text-xs text-muted-foreground">{item.sub}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Demo CTA */}
        <Button
          onClick={handleDemoClaim}
          className="w-full h-14 bg-gradient-to-r from-accent to-primary text-background hover:opacity-90 font-semibold"
        >
          <span>Demo Claim Pipeline</span>
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
      <BottomNav />
    </MobileContainer>
  );
}
