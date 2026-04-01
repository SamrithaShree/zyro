import { MobileContainer } from "../components/MobileContainer";
import { Shield, CheckCircle2, Sparkles } from "lucide-react";
import { Button } from "../components/ui/button";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import confetti from "canvas-confetti";
import { useEffect } from "react";
import { useOnboardingStore } from "../../store/useOnboardingStore";

export function ReadinessConfirmation() {
  const navigate = useNavigate();
  const complete = useOnboardingStore((s) => s.complete);

  useEffect(() => {
    // Mark onboarding as done
    complete();

    // Trigger confetti
    const duration = 2 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ["#00E5FF", "#00FF87", "#FFA726"],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ["#00E5FF", "#00FF87", "#FFA726"],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  return (
    <MobileContainer>
      <div className="flex flex-col min-h-screen px-6 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex-1 flex flex-col items-center justify-center text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-24 h-24 bg-gradient-to-br from-accent via-[#00FF87] to-primary rounded-3xl flex items-center justify-center mb-8 relative"
          >
            <Shield className="w-12 h-12 text-background" />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-3xl"
              style={{
                background:
                  "conic-gradient(transparent, rgba(0,229,255,0.3), transparent)",
              }}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center gap-2 justify-center mb-3">
              <Sparkles className="w-5 h-5 text-primary" />
              <h1 className="text-3xl font-bold">You're all set!</h1>
            </div>
            <p className="text-lg text-muted-foreground mb-8">
              Zyro is now protecting your income
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-4 mb-12"
          >
            <div className="bg-card rounded-xl p-4 border border-border">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#00FF87] flex-shrink-0 mt-0.5" />
                <div className="text-left">
                  <h4 className="font-medium mb-1">Identity verified</h4>
                  <p className="text-sm text-muted-foreground">
                    Platform & location confirmed
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-xl p-4 border border-border">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#00FF87] flex-shrink-0 mt-0.5" />
                <div className="text-left">
                  <h4 className="font-medium mb-1">Payouts ready</h4>
                  <p className="text-sm text-muted-foreground">
                    UPI linked for instant transfers
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-xl p-4 border border-border">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#00FF87] flex-shrink-0 mt-0.5" />
                <div className="text-left">
                  <h4 className="font-medium mb-1">Monitoring active</h4>
                  <p className="text-sm text-muted-foreground">
                    Watching for disruptions 24/7
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="bg-gradient-to-br from-accent/10 to-primary/10 border border-accent/20 rounded-xl p-4 mb-8"
          >
            <p className="text-sm text-muted-foreground">
              <span className="text-foreground font-semibold">
                Remember:
              </span>{" "}
              You don't need to do anything. Zyro automatically detects
              disruptions and sends money to your UPI.
            </p>
          </motion.div>
        </motion.div>

        <Button
          onClick={() => navigate("/dashboard")}
          className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          Go to Dashboard
        </Button>
      </div>
    </MobileContainer>
  );
}
