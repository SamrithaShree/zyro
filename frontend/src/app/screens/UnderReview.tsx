import { MobileContainer } from "../components/MobileContainer";
import { Clock, Shield, ChevronRight } from "lucide-react";
import { Button } from "../components/ui/button";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { useClaimStore } from "../../store/useClaimStore";

export function UnderReview() {
  const navigate = useNavigate();
  const { eventId, confidence, eventType } = useClaimStore();

  return (
    <MobileContainer>
      <div className="flex flex-col min-h-screen px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 flex flex-col items-center justify-center text-center"
        >
          {/* Calm icon — no alarm colors */}
          <div className="w-24 h-24 bg-accent/10 rounded-3xl flex items-center justify-center mb-8">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            >
              <Shield className="w-12 h-12 text-accent" />
            </motion.div>
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 border border-accent/30 rounded-full mb-4">
            <Clock className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-accent">
              Under Review
            </span>
          </div>

          <h1 className="text-2xl font-bold mb-3">Verification in Progress</h1>
          <p className="text-muted-foreground text-sm max-w-xs mb-8">
            Your claim is being reviewed by Zyro's system. This happens for some
            events where signals need additional verification.
          </p>

          {/* Details card */}
          <div className="w-full bg-card border border-border rounded-2xl p-5 space-y-4 text-left">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Claim ID</span>
              <span className="font-medium font-mono">{eventId || "ZYR-REVIEW"}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Event type</span>
              <span className="font-medium">{eventType || "Weather Event"}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Confidence</span>
              <span className="font-medium text-warning">{confidence}% — Medium</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Estimated ETA</span>
              <span className="font-medium text-accent">2–4 hours</span>
            </div>
          </div>

          <div className="mt-6 p-4 bg-accent/5 border border-accent/20 rounded-xl w-full text-left">
            <p className="text-xs text-muted-foreground">
              You'll be notified the moment your claim is approved. No action
              needed from your side.
            </p>
          </div>
        </motion.div>

        <Button
          onClick={() => navigate("/dashboard")}
          variant="outline"
          className="w-full h-14 flex items-center justify-center gap-2"
        >
          Back to Dashboard
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </MobileContainer>
  );
}
