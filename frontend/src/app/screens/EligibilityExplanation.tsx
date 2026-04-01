import { MobileContainer } from "../components/MobileContainer";
import { SystemBadge } from "../components/SystemBadge";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import { Button } from "../components/ui/button";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { useClaimStore } from "../../store/useClaimStore";

const WIVE_BULLETS = [
  { icon: CheckCircle2, text: "You were active in the zone", color: "#00FF87" },
  { icon: CheckCircle2, text: "Orders dropped by 62% below baseline", color: "#00FF87" },
  { icon: CheckCircle2, text: "Your policy covers this disruption", color: "#00FF87" },
];

const PARTIAL_BULLET = {
  icon: AlertTriangle,
  text: "Partial payout due to reduced activity overlap",
  color: "#FFA726",
};

export function EligibilityExplanation() {
  const navigate = useNavigate();
  const { orderDropPercent, eventType, gateResults } = useClaimStore();

  const isPartial = orderDropPercent > 0 && orderDropPercent < 40;
  const dropPct = orderDropPercent || 62;

  const bullets = WIVE_BULLETS.map((b) =>
    b.text.includes("62%") ? { ...b, text: `Orders dropped by ${dropPct}% below baseline` } : b
  );

  return (
    <MobileContainer>
      <div className="flex flex-col min-h-screen px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 space-y-6"
        >
          <div className="text-center mb-2">
            <SystemBadge text="WIVE Engine" variant="green" />
            <h1 className="text-2xl font-bold mt-3 mb-1">Why You're Eligible</h1>
            <p className="text-sm text-muted-foreground">
              Zyro verified a loss of{" "}
              <strong className="text-foreground">earning opportunity</strong>
              , not just your presence
            </p>
          </div>

          {/* Eligibility bullets */}
          <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
            {bullets.map((b, i) => {
              const Icon = b.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.12 }}
                  className="flex items-center gap-3"
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: `${b.color}15` }}
                  >
                    <Icon className="w-4 h-4" style={{ color: b.color }} />
                  </div>
                  <span className="text-sm">{b.text}</span>
                </motion.div>
              );
            })}

            {isPartial && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex items-center gap-3 pt-2 border-t border-border/50"
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-warning/10">
                  <PARTIAL_BULLET.icon className="w-4 h-4 text-warning" />
                </div>
                <span className="text-sm text-warning">{PARTIAL_BULLET.text}</span>
              </motion.div>
            )}
          </div>

          {/* Gate summary */}
          <div className="bg-accent/5 border border-accent/20 rounded-2xl p-5">
            <h3 className="font-medium text-sm text-accent mb-3">
              Tri-Gate Validation
            </h3>
            <div className="space-y-2 text-sm">
              {[
                { gate: "Gate 1", label: "Environmental data crossed threshold", pass: gateResults.gate1 || true },
                { gate: "Gate 2", label: "Platform order drop confirmed", pass: gateResults.gate2 || true },
                { gate: "Gate 3", label: "Event duration > 45 minutes", pass: gateResults.gate3 || true },
              ].map((g) => (
                <div key={g.gate} className="flex items-start gap-2">
                  <CheckCircle2
                    className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                      g.pass ? "text-success" : "text-muted-foreground"
                    }`}
                  />
                  <span>
                    <span className="font-medium text-muted-foreground">
                      {g.gate}:{" "}
                    </span>
                    {g.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-4 text-center">
            <p className="text-xs text-muted-foreground">
              Event type:{" "}
              <strong className="text-foreground">
                {eventType || "Heavy Rain"}
              </strong>{" "}
              · All 3 gates passed · Payout approved
            </p>
          </div>
        </motion.div>

        <Button
          onClick={() => navigate("/confidence-check")}
          className="mt-6 w-full h-14 bg-primary text-primary-foreground"
        >
          View Confidence Score
        </Button>
      </div>
    </MobileContainer>
  );
}
