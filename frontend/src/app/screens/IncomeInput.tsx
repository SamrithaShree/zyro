import { useState } from "react";
import { MobileContainer } from "../components/MobileContainer";
import { ArrowLeft } from "lucide-react";
import { Button } from "../components/ui/button";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { useOnboardingStore, IncomeRange, PeakHour } from "../../store/useOnboardingStore";
import { StepProgress } from "../../components/common/StepProgress";

const ONBOARDING_STEPS = [
  { id: 1, label: "Consent" },
  { id: 2, label: "Platform" },
  { id: 3, label: "Identity" },
  { id: 4, label: "Work" },
  { id: 5, label: "UPI" },
];

const INCOME_RANGES: { id: IncomeRange; label: string; sub: string }[] = [
  { id: "300-500", label: "₹300 – 500", sub: "per day" },
  { id: "500-800", label: "₹500 – 800", sub: "per day" },
  { id: "800-1200", label: "₹800 – 1,200", sub: "per day" },
  { id: "1200+", label: "₹1,200+", sub: "per day" },
];

const PEAKS: { id: PeakHour; label: string; emoji: string }[] = [
  { id: "MORNING", label: "Morning", emoji: "🌅" },
  { id: "AFTERNOON", label: "Afternoon", emoji: "☀️" },
  { id: "EVENING", label: "Evening", emoji: "🌆" },
  { id: "NIGHT", label: "Night", emoji: "🌙" },
];

export function IncomeInput() {
  const navigate = useNavigate();
  const { incomeRange, peakHour, setIncome, workHours, setWorkProfile } =
    useOnboardingStore();
  const [localIncome, setLocalIncome] = useState<IncomeRange>(incomeRange);
  const [localPeak, setLocalPeak] = useState<PeakHour>(peakHour);

  const handleContinue = () => {
    if (!localIncome) return;
    setWorkProfile(workHours, localPeak);
    setIncome(localIncome);
    navigate("/analysis-loading");
  };

  return (
    <MobileContainer>
      <div className="flex flex-col min-h-screen px-6 py-8">
        <div className="mb-6">
          <StepProgress steps={ONBOARDING_STEPS} currentStep={4} variant="dots" />
        </div>
        <button
          onClick={() => navigate("/work-profile")}
          className="flex items-center gap-2 text-muted-foreground mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 space-y-8"
        >
          <div>
            <h1 className="text-2xl font-bold mb-1">Your Daily Income</h1>
            <p className="text-sm text-muted-foreground">
              Pick the range closest to a typical day
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {INCOME_RANGES.map((r, i) => (
              <motion.button
                key={r.id}
                whileTap={{ scale: 0.97 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                onClick={() => setLocalIncome(r.id)}
                className={`p-5 rounded-2xl border-2 text-left transition-all ${
                  localIncome === r.id
                    ? "border-accent bg-accent/10"
                    : "border-border bg-card hover:border-border/80"
                }`}
              >
                <div
                  className={`text-lg font-bold mb-1 ${
                    localIncome === r.id ? "text-accent" : ""
                  }`}
                >
                  {r.label}
                </div>
                <div className="text-xs text-muted-foreground">{r.sub}</div>
              </motion.button>
            ))}
          </div>

          <div>
            <h3 className="font-semibold mb-3">Peak earning time</h3>
            <div className="grid grid-cols-4 gap-2">
              {PEAKS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setLocalPeak(p.id)}
                  className={`flex flex-col items-center gap-1 py-3 rounded-xl border-2 text-sm transition-all ${
                    localPeak === p.id
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-card text-muted-foreground"
                  }`}
                >
                  <span className="text-lg">{p.emoji}</span>
                  <span className="text-xs">{p.label}</span>
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        <Button
          onClick={handleContinue}
          disabled={!localIncome}
          className="mt-6 w-full h-14 bg-primary text-primary-foreground disabled:opacity-50"
        >
          Calculate My Protection
        </Button>
      </div>
    </MobileContainer>
  );
}
