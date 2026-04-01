import { useState } from "react";
import { MobileContainer } from "../components/MobileContainer";
import { Activity, Zap, Target, ChevronRight } from "lucide-react";
import { Button } from "../components/ui/button";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { useOnboardingStore } from "../../store/useOnboardingStore";
import { StepProgress } from "../../components/common/StepProgress";

const ONBOARDING_STEPS = [
  { id: 1, label: "Consent" },
  { id: 2, label: "Platform" },
  { id: 3, label: "Identity" },
  { id: 4, label: "Work" },
  { id: 5, label: "UPI" },
];

export function ActivityConsentScreen() {
  const navigate = useNavigate();
  const setConsent = useOnboardingStore((s) => s.setConsent);
  const [enabled, setEnabled] = useState(true);

  const handleContinue = () => {
    setConsent(true, enabled);
    navigate("/platform-selection");
  };

  return (
    <MobileContainer>
      <div className="flex flex-col min-h-screen px-6 py-8">
        <div className="mb-6">
          <StepProgress steps={ONBOARDING_STEPS} currentStep={1} variant="dots" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 flex flex-col"
        >
          <div className="mb-8">
            <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mb-6">
              <Activity className="w-8 h-8 text-accent" />
            </div>
            <h1 className="text-2xl font-bold mb-2">
              Enable Smart Activity Detection
            </h1>
            <p className="text-muted-foreground text-sm">
              Zyro uses passive signals to confirm you're working during a
              disruption — ensuring accurate, automatic payouts.
            </p>
          </div>

          {/* Benefits */}
          <div className="space-y-4 mb-8">
            {[
              {
                icon: Target,
                color: "#00E5FF",
                bg: "#00E5FF15",
                title: "Confirms you're working during disruptions",
                sub: "Activity signals match claim events automatically",
              },
              {
                icon: Zap,
                color: "#00FF87",
                bg: "#00FF8715",
                title: "Improves claim accuracy",
                sub: "Higher precision means fewer edge-case rejections",
              },
              {
                icon: ChevronRight,
                color: "#FFA726",
                bg: "#FFA72615",
                title: "Enables faster payouts",
                sub: "No manual review required when signals match",
              },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * i }}
                  className="flex items-start gap-4"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: item.bg }}
                  >
                    <Icon className="w-5 h-5" style={{ color: item.color }} />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{item.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {item.sub}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Toggle Card */}
          <div className="bg-card border border-border rounded-2xl p-5 mb-auto">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">Allow Activity Detection</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Battery-light. No continuous tracking.
                </p>
              </div>
              <button
                onClick={() => setEnabled((v) => !v)}
                className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${
                  enabled ? "bg-accent" : "bg-muted"
                }`}
                role="switch"
                aria-checked={enabled}
              >
                <motion.div
                  animate={{ x: enabled ? 28 : 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className="absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow"
                />
              </button>
            </div>
          </div>
        </motion.div>

        <div className="mt-6 space-y-3">
          <Button
            onClick={handleContinue}
            className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Continue
          </Button>
          <button
            onClick={handleContinue}
            className="w-full text-sm text-muted-foreground"
          >
            Skip for now
          </button>
        </div>
      </div>
    </MobileContainer>
  );
}
