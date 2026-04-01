import { MobileContainer } from "../components/MobileContainer";
import { SystemBadge } from "../components/SystemBadge";
import { CheckCircle2, Shield, TrendingDown, Star } from "lucide-react";
import { Button } from "../components/ui/button";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { useClaimStore } from "../../store/useClaimStore";
import { useAuthStore } from "../../store/useAuthStore";

const BULLETS = [
  { label: "Behavioral pattern match", value: 98, color: "#00FF87" },
  { label: "Device integrity", value: 95, color: "#00E5FF" },
  { label: "Location consistency", value: 92, color: "#FFA726" },
];

export function ConfidenceCheck() {
  const navigate = useNavigate();
  const { confidence, gateResults } = useClaimStore();
  const { trustScore } = useAuthStore();

  const displayConf = confidence || 95;
  const verdict =
    displayConf >= 85 ? "HIGH" : displayConf >= 65 ? "MEDIUM" : "UNDER_REVIEW";
  const verdictColor =
    verdict === "HIGH"
      ? "#00FF87"
      : verdict === "MEDIUM"
      ? "#FFA726"
      : "#FF6B35";

  return (
    <MobileContainer>
      <div className="flex flex-col min-h-screen px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 space-y-6"
        >
          <div className="text-center">
            <div className="w-20 h-20 bg-accent/10 rounded-3xl flex items-center justify-center mx-auto mb-5">
              <Shield className="w-10 h-10 text-accent" />
            </div>
            <SystemBadge text="Fraud Engine" variant="cyan" />
            <h1 className="text-2xl font-bold mt-3 mb-1">Confidence Analysis</h1>
            <p className="text-sm text-muted-foreground">
              Verified using activity signals, device integrity, and consistency checks
            </p>
          </div>

          {/* Confidence badge */}
          <div className="bg-card border border-border rounded-2xl p-5 text-center">
            <p className="text-xs text-muted-foreground mb-2">Overall Confidence</p>
            <div
              className="text-5xl font-bold mb-2"
              style={{ color: verdictColor }}
            >
              {displayConf}%
            </div>
            <span
              className="inline-block px-4 py-1 rounded-full text-sm font-bold"
              style={{ background: `${verdictColor}20`, color: verdictColor }}
            >
              {verdict === "HIGH"
                ? "HIGH — Eligible"
                : verdict === "MEDIUM"
                ? "MEDIUM — Review"
                : "UNDER REVIEW"}
            </span>
          </div>

          {/* Score breakdown */}
          <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
            <h3 className="font-semibold text-sm">Score Breakdown</h3>
            {BULLETS.map((b) => (
              <div key={b.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">{b.label}</span>
                  <span className="font-semibold" style={{ color: b.color }}>
                    {b.value}%
                  </span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: b.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${b.value}%` }}
                    transition={{ duration: 0.8 }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Gate results */}
          <div className="bg-card border border-border rounded-2xl p-5">
            <h3 className="font-semibold text-sm mb-3">Tri-Gate Results</h3>
            {[
              { label: "Gate 1: Environmental threshold", pass: gateResults.gate1 || true },
              { label: "Gate 2: Order drop validated", pass: gateResults.gate2 || true },
              { label: "Gate 3: Duration threshold met", pass: gateResults.gate3 || true },
            ].map((g) => (
              <div key={g.label} className="flex items-center gap-2 py-2 text-sm">
                <CheckCircle2
                  className={`w-4 h-4 ${g.pass ? "text-success" : "text-muted"}`}
                />
                <span className={g.pass ? "" : "text-muted-foreground"}>
                  {g.label}
                </span>
              </div>
            ))}
          </div>

          {/* Trust score */}
          <div className="flex items-center gap-3 p-4 bg-primary/5 border border-primary/20 rounded-xl">
            <Star className="w-5 h-5 text-primary" />
            <div>
              <p className="font-semibold text-sm">
                Your Zyro Trust Score: {trustScore}
              </p>
              <p className="text-xs text-muted-foreground">
                Higher trust → faster automatic approvals
              </p>
            </div>
          </div>
        </motion.div>

        <Button
          onClick={() =>
            navigate(verdict === "UNDER_REVIEW" ? "/under-review" : "/payout-success/demo")
          }
          className="mt-6 w-full h-14 bg-primary text-primary-foreground"
        >
          {verdict === "UNDER_REVIEW" ? "Check Review Status" : "View Payout"}
        </Button>
      </div>
    </MobileContainer>
  );
}
