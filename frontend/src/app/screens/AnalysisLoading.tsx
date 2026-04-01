import { useEffect } from "react";
import { MobileContainer } from "../components/MobileContainer";
import { CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { useRiskAnalysis } from "../../hooks/useRiskAnalysis";
import { useOnboardingStore } from "../../store/useOnboardingStore";

export function AnalysisLoading() {
  const navigate = useNavigate();
  const { incomeRange, location } = useOnboardingStore();
  const { steps, result, analyzing, runAnalysis } = useRiskAnalysis();

  useEffect(() => {
    runAnalysis(incomeRange || "500-800", location?.zone || "Anna Nagar");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (result && !analyzing) {
      const t = setTimeout(() => navigate("/risk-summary"), 600);
      return () => clearTimeout(t);
    }
  }, [result, analyzing, navigate]);

  return (
    <MobileContainer>
      <div className="flex flex-col min-h-screen px-6 py-12 items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm"
        >
          {/* Logo pulse */}
          <div className="flex justify-center mb-12">
            <motion.div
              animate={{ scale: [1, 1.06, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-20 h-20 bg-gradient-to-br from-accent/20 to-primary/20 rounded-3xl flex items-center justify-center border border-accent/30"
            >
              <span className="text-3xl font-bold bg-gradient-to-br from-accent to-primary bg-clip-text text-transparent">
                Z
              </span>
            </motion.div>
          </div>

          <h2 className="text-xl font-bold text-center mb-2">
            Analysing your profile
          </h2>
          <p className="text-sm text-muted-foreground text-center mb-10">
            Zyro's Tri-Gate engine is evaluating your zone
          </p>

          {/* Steps */}
          <div className="space-y-4">
            {steps.map((step, i) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-500 ${
                  step.done
                    ? "border-success/30 bg-success/5"
                    : step.active
                    ? "border-accent/40 bg-accent/5"
                    : "border-border bg-card/50"
                }`}
              >
                {/* Status indicator */}
                <div className="relative flex-shrink-0">
                  <AnimatePresence mode="wait">
                    {step.done ? (
                      <motion.div
                        key="done"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500 }}
                      >
                        <CheckCircle2 className="w-6 h-6 text-success" />
                      </motion.div>
                    ) : step.active ? (
                      <motion.div
                        key="active"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                        className="w-6 h-6 rounded-full border-2 flex items-center justify-center"
                        style={{ borderColor: step.color }}
                      >
                        <motion.div
                          animate={{ opacity: [1, 0.3, 1] }}
                          transition={{ duration: 0.8, repeat: Infinity }}
                          className="w-2 h-2 rounded-full"
                          style={{ background: step.color }}
                        />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="waiting"
                        className="w-6 h-6 rounded-full border-2 border-border"
                      />
                    )}
                  </AnimatePresence>
                </div>

                <div className="flex-1 min-w-0">
                  <p
                    className={`font-medium text-sm transition-colors ${
                      step.done
                        ? "text-success"
                        : step.active
                        ? "text-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    {step.label}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">
                    {step.sublabel}
                  </p>
                </div>

                {step.done && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xs text-success font-medium flex-shrink-0"
                  >
                    ✓
                  </motion.span>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </MobileContainer>
  );
}
