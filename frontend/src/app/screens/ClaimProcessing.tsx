import { MobileContainer } from "../components/MobileContainer";
import { SystemBadge } from "../components/SystemBadge";
import { CloudRain, Clock, TrendingDown, ArrowRight } from "lucide-react";
import { Button } from "../components/ui/button";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { useEffect } from "react";

export function ClaimProcessing() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/timeline");
    }, 3500);
    return () => clearTimeout(timer);
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
            <div className="w-20 h-20 bg-gradient-to-br from-accent to-primary rounded-2xl flex items-center justify-center mx-auto mb-6 relative">
              <CloudRain className="w-10 h-10 text-background" />
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0.2, 0.5],
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 bg-accent rounded-2xl"
              />
            </div>

            <SystemBadge text="Processing Claim" variant="amber" />

            <h1 className="text-2xl font-bold mt-4 mb-2">
              Claim Processing
            </h1>
            <p className="text-muted-foreground">
              Calculating your protection amount
            </p>
          </div>

          {/* Event Details */}
          <div className="bg-card border border-border rounded-2xl p-6 mb-6">
            <h3 className="font-semibold mb-4">Event Details</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CloudRain className="w-5 h-5 text-[#FF6B35]" />
                  <span className="text-sm text-muted-foreground">Disruption</span>
                </div>
                <span className="font-medium">Heavy Rain</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-accent" />
                  <span className="text-sm text-muted-foreground">Duration</span>
                </div>
                <span className="font-medium">2.5 hours</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <TrendingDown className="w-5 h-5 text-destructive" />
                  <span className="text-sm text-muted-foreground">Est. Impact</span>
                </div>
                <span className="font-medium text-destructive">₹450-550</span>
              </div>
            </div>
          </div>

          {/* Processing Animation */}
          <div className="bg-gradient-to-br from-accent/5 to-primary/5 border border-accent/20 rounded-2xl p-6 mb-6">
            <div className="flex items-center gap-4 mb-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12 border-4 border-accent/20 border-t-accent rounded-full"
              />
              <div>
                <h4 className="font-semibold mb-1">Calculating payout...</h4>
                <p className="text-xs text-muted-foreground">
                  Analyzing work patterns and disruption impact
                </p>
              </div>
            </div>
          </div>

          {/* System State */}
          <div className="space-y-2">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex items-center gap-2 text-xs text-muted-foreground"
            >
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span>Cross-referencing weather data</span>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="flex items-center gap-2 text-xs text-muted-foreground"
            >
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span>Matching against work profile</span>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              className="flex items-center gap-2 text-xs text-muted-foreground"
            >
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span>Preparing payout calculation</span>
            </motion.div>
          </div>
        </motion.div>

        {/* Auto-advance indicator */}
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <span>Processing</span>
          <motion.div
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <ArrowRight className="w-4 h-4" />
          </motion.div>
        </div>
      </div>
    </MobileContainer>
  );
}
