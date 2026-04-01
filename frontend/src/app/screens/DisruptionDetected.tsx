import { MobileContainer } from "../components/MobileContainer";
import { SystemBadge } from "../components/SystemBadge";
import { CloudRain, MapPin, ArrowRight } from "lucide-react";
import { Button } from "../components/ui/button";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { useEffect } from "react";

export function DisruptionDetected() {
  const navigate = useNavigate();

  useEffect(() => {
    // Auto-advance after 3 seconds
    const timer = setTimeout(() => {
      navigate("/validation");
    }, 3000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <MobileContainer>
      <div className="flex flex-col min-h-screen px-6 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex-1 flex flex-col items-center justify-center"
        >
          {/* Alert Icon */}
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="w-24 h-24 bg-[#FF6B35]/10 rounded-3xl flex items-center justify-center mb-8 relative"
          >
            <CloudRain className="w-12 h-12 text-[#FF6B35]" />
            <motion.div
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 bg-[#FF6B35]/20 rounded-3xl"
            />
          </motion.div>

          {/* System Badge */}
          <div className="mb-4">
            <SystemBadge text="Trigger Engine Active" variant="orange" />
          </div>

          {/* Content */}
          <h1 className="text-2xl font-bold mb-2 text-center">
            Disruption Detected
          </h1>
          <p className="text-muted-foreground text-center mb-8">
            Heavy rain in your area
          </p>

          {/* Details */}
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-sm">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Location</span>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-accent" />
                  <span className="font-medium">Anna Nagar</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Event Type</span>
                <span className="font-medium">Heavy Rain</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Severity</span>
                <span className="px-3 py-1 bg-[#FF6B35]/10 text-[#FF6B35] rounded-full text-sm font-medium">
                  High
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <span className="font-medium text-accent">Evaluating...</span>
              </div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-8 text-center"
          >
            <p className="text-sm text-muted-foreground">
              System is beginning evaluation
            </p>
          </motion.div>
        </motion.div>

        {/* Auto-advance indicator */}
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <span>Auto-advancing</span>
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
