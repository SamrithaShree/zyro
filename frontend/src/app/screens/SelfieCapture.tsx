import { useState, useEffect } from "react";
import { MobileContainer } from "../components/MobileContainer";
import { Camera, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { useOnboardingStore } from "../../store/useOnboardingStore";
import { haptics } from "../../services/haptics";
import { StepProgress } from "../../components/common/StepProgress";

const ONBOARDING_STEPS = [
  { id: 1, label: "Consent" },
  { id: 2, label: "Platform" },
  { id: 3, label: "Identity" },
  { id: 4, label: "Work" },
  { id: 5, label: "UPI" },
];

export function SelfieCapture() {
  const navigate = useNavigate();
  const setSelfie = useOnboardingStore((s) => s.setSelfie);
  const [phase, setPhase] = useState<"SCAN" | "MATCHING" | "SUCCESS">("SCAN");

  useEffect(() => {
    if (phase === "SCAN") {
      const t = setTimeout(() => setPhase("MATCHING"), 2500);
      return () => clearTimeout(t);
    }
    if (phase === "MATCHING") {
      const t = setTimeout(() => {
        setPhase("SUCCESS");
        setSelfie(true);
        haptics.success();
      }, 2000);
      return () => clearTimeout(t);
    }
  }, [phase, setSelfie]);

  return (
    <MobileContainer>
      <div className="flex flex-col min-h-screen px-6 py-8">
        <div className="mb-6">
          <StepProgress steps={ONBOARDING_STEPS} currentStep={3} variant="dots" />
        </div>

        <div className="flex-1 flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            {phase === "SUCCESS" ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center text-center"
              >
                <div className="w-28 h-28 rounded-full bg-success/10 border-2 border-success flex items-center justify-center mb-6">
                  <CheckCircle2 className="w-14 h-14 text-success" />
                </div>
                <h2 className="text-xl font-bold mb-2">Face Match Confirmed</h2>
                <p className="text-sm text-muted-foreground mb-8">
                  Your identity has been verified
                </p>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate("/location")}
                  className="w-full h-14 bg-primary rounded-xl text-primary-foreground font-semibold text-base"
                >
                  Continue
                </motion.button>
              </motion.div>
            ) : (
              <motion.div
                key="scan"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center text-center"
              >
                {/* Camera placeholder with animated ring */}
                <div className="relative w-44 h-44 mb-8">
                  {/* Outer pulsing ring */}
                  <motion.div
                    animate={{ scale: [1, 1.08, 1], opacity: [0.4, 0.1, 0.4] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 rounded-full border-2 border-accent"
                  />
                  {/* Face outline */}
                  <motion.div
                    animate={{ scale: [1, 1.03, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="absolute inset-4 rounded-full border-4 border-dashed border-accent/60 flex items-center justify-center bg-card"
                  >
                    <Camera className="w-12 h-12 text-accent" />
                  </motion.div>
                  {/* Scanning line */}
                  <motion.div
                    animate={{ y: [-52, 52, -52] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="absolute left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-accent to-transparent top-1/2"
                  />
                </div>

                <h2 className="text-xl font-bold mb-2">
                  {phase === "SCAN" ? "Position Your Face" : "Matching…"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {phase === "SCAN"
                    ? "Hold still inside the frame"
                    : "Running face match verification"}
                </p>

                <div className="flex gap-1 mt-6">
                  {["SCAN", "MATCHING"].map((p, i) => (
                    <div
                      key={p}
                      className={`h-1 w-8 rounded-full transition-all duration-500 ${
                        i === (phase === "SCAN" ? 0 : 1)
                          ? "bg-accent"
                          : "bg-muted"
                      }`}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </MobileContainer>
  );
}
