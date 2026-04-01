import { MobileContainer } from "../components/MobileContainer";
import { Shield, TrendingUp, Calendar, ArrowRight } from "lucide-react";
import { Button } from "../components/ui/button";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { useOnboardingStore } from "../../store/useOnboardingStore";
import { useEffect, useState } from "react";
import { analyzeRisk, RiskResult } from "../../services/mock/risk.mock";
import { SkeletonCard } from "../../components/common/SkeletonCard";

const RISK_COLORS = {
  LOW: "#00FF87",
  MEDIUM: "#FFA726",
  HIGH: "#FF3B30",
};

export function RiskSummary() {
  const navigate = useNavigate();
  const { incomeRange, location } = useOnboardingStore();
  const [result, setResult] = useState<RiskResult | null>(null);

  useEffect(() => {
    analyzeRisk(incomeRange || "500-800", location?.zone || "Anna Nagar").then(
      setResult
    );
  }, [incomeRange, location]);

  if (!result) return (
    <MobileContainer>
      <div className="px-6 py-8 space-y-4">
        <SkeletonCard lines={4} />
        <SkeletonCard lines={3} />
      </div>
    </MobileContainer>
  );

  const riskColor = RISK_COLORS[result.riskLevel];
  const circumference = 2 * Math.PI * 42;
  const dashOffset = circumference * (1 - result.coveragePercent / 100);

  return (
    <MobileContainer>
      <div className="flex flex-col min-h-screen px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 space-y-5"
        >
          <div>
            <h1 className="text-2xl font-bold mb-1">Your Protection Profile</h1>
            <p className="text-sm text-muted-foreground">
              Calculated from your zone, platform, and income
            </p>
          </div>

          {/* Coverage ring + income */}
          <div className="bg-gradient-to-br from-card to-secondary border border-border rounded-2xl p-6 flex items-center gap-6">
            <div className="relative flex-shrink-0 w-24 h-24">
              <svg viewBox="0 0 96 96" className="w-full h-full -rotate-90">
                <circle cx="48" cy="48" r="42" fill="none" stroke="#2A2E3C" strokeWidth="8" />
                <motion.circle
                  cx="48" cy="48" r="42" fill="none"
                  stroke={riskColor} strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset: dashOffset }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold" style={{ color: riskColor }}>
                  {result.coveragePercent}%
                </span>
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Coverage</p>
              <p className="text-2xl font-bold" style={{ color: riskColor }}>
                {result.coveragePercent}%
              </p>
              <span
                className="inline-block mt-2 px-3 py-1 text-xs font-semibold rounded-full"
                style={{ background: `${riskColor}20`, color: riskColor }}
              >
                {result.riskLevel} Risk Zone
              </span>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-card border border-border rounded-2xl p-4">
              <TrendingUp className="w-5 h-5 text-accent mb-2" />
              <p className="text-xs text-muted-foreground mb-1">Est. Daily Income</p>
              <p className="text-xl font-bold">₹{result.estimatedDailyIncome}</p>
            </div>
            <div className="bg-card border border-border rounded-2xl p-4">
              <Shield className="w-5 h-5 text-success mb-2" />
              <p className="text-xs text-muted-foreground mb-1">Max Weekly Payout</p>
              <p className="text-xl font-bold text-success">₹{result.maxWeeklyPayout}</p>
            </div>
          </div>

          {/* Weekly model */}
          <div className="flex items-start gap-3 bg-primary/5 border border-primary/20 rounded-xl p-4">
            <Calendar className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-sm">Weekly Coverage Active</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Protection resets every 7 days ·{" "}
                <span className="text-primary font-medium">₹{result.weeklyPremium}/week</span>
              </p>
            </div>
          </div>
        </motion.div>

        <Button
          onClick={() => navigate("/upi-setup")}
          className="mt-6 w-full h-14 bg-primary text-primary-foreground flex items-center justify-center gap-2"
        >
          Activate Coverage
          <ArrowRight className="w-5 h-5" />
        </Button>
      </div>
    </MobileContainer>
  );
}
