import { MobileContainer } from "../components/MobileContainer";
import { SystemBadge } from "../components/SystemBadge";
import { Loader2, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { useEffect, useState } from "react";

const validationSteps = [
  { id: 1, label: "Disruption detection", completed: true },
  { id: 2, label: "Activity tracking", completed: false },
  { id: 3, label: "Policy validation", completed: false },
];

export function ValidationInProgress() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const stepTimer = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < validationSteps.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 1500);

    const navigateTimer = setTimeout(() => {
      navigate("/claim-processing");
    }, 5000);

    return () => {
      clearInterval(stepTimer);
      clearTimeout(navigateTimer);
    };
  }, [navigate]);

  return (
    <MobileContainer>
      <div className="flex flex-col min-h-screen px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-20 h-20 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-6"
            >
              <Loader2 className="w-10 h-10 text-accent" />
            </motion.div>

            <SystemBadge text="Validation Engine Running" variant="cyan" />

            <h1 className="text-2xl font-bold mt-4 mb-2">
              Validation in Progress
            </h1>
            <p className="text-muted-foreground">
              Running automated checks
            </p>
          </div>

          {/* Validation Steps */}
          <div className="bg-card border border-border rounded-2xl p-6 mb-8">
            <div className="space-y-4">
              {validationSteps.map((step, index) => {
                const isComplete = index <= currentStep;
                const isActive = index === currentStep;

                return (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.2 }}
                    className="flex items-center gap-4"
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                        isComplete
                          ? "bg-[#00FF87]/10"
                          : "bg-secondary"
                      }`}
                    >
                      {isComplete ? (
                        <CheckCircle2 className="w-5 h-5 text-[#00FF87]" />
                      ) : (
                        <Loader2
                          className={`w-5 h-5 text-muted-foreground ${
                            isActive ? "animate-spin" : ""
                          }`}
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <div
                        className={`font-medium ${
                          isComplete ? "text-foreground" : "text-muted-foreground"
                        }`}
                      >
                        {step.label}
                      </div>
                      {isActive && (
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: "100%" }}
                          transition={{ duration: 1.5 }}
                          className="h-1 bg-accent rounded-full mt-2"
                        />
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-accent/5 border border-accent/20 rounded-xl p-4">
            <p className="text-sm text-muted-foreground">
              <span className="text-accent font-semibold">Why this matters:</span>{" "}
              We validate your work activity and check for any anomalies to
              ensure fair payouts for everyone.
            </p>
          </div>

          {/* System Annotations */}
          <div className="mt-8 space-y-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
              <span>Checking location match</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
              <span>Analyzing work patterns</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
              <span>Verifying platform data</span>
            </div>
          </div>
        </motion.div>
      </div>
    </MobileContainer>
  );
}
