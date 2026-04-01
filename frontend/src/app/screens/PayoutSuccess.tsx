import { useEffect, useRef } from "react";
import { MobileContainer } from "../components/MobileContainer";
import { Wallet, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "../components/ui/button";
import { useNavigate, useParams } from "react-router";
import { motion } from "motion/react";
import { useClaimStore } from "../../store/useClaimStore";
import { haptics } from "../../services/haptics";
import confetti from "canvas-confetti";

export function PayoutSuccess() {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const { amount, eventType, timestamps } = useClaimStore();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const displayAmount = amount || 485;

  useEffect(() => {
    haptics.success();

    // Confetti burst
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.4 },
      colors: ["#00FF87", "#00E5FF", "#FFA726"],
    });

    // Audio feedback
    try {
      const audio = new Audio("/audio/payout_sound.mp3");
      audio.volume = 0.5;
      audio.play().catch(() => {/* ignore autoplay policy */});
      audioRef.current = audio;
    } catch { /* ignore */ }

    return () => {
      audioRef.current?.pause();
    };
  }, []);

  const paidAt = timestamps?.PAID
    ? new Date(timestamps.PAID).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "14:28";

  return (
    <MobileContainer>
      <div className="flex flex-col min-h-screen px-6 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex-1 flex flex-col items-center justify-center text-center"
        >
          {/* Animated payout icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.1, stiffness: 200 }}
            className="w-28 h-28 bg-success/10 rounded-3xl flex items-center justify-center mb-6 relative"
          >
            <Wallet className="w-14 h-14 text-success" />
            <motion.div
              animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0, 0.4] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 bg-success/15 rounded-3xl"
            />
          </motion.div>

          <div className="mb-2">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-success/10 border border-success/30 rounded-full text-sm font-medium text-success mb-4">
                <Sparkles className="w-4 h-4" />
                Credited to your UPI
              </span>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="text-6xl font-bold text-success mb-2">
              ₹{displayAmount}
            </div>
            <p className="text-muted-foreground text-sm">
              {eventType || "Rain"} disruption payout · Today, {paidAt}
            </p>
          </motion.div>

          {/* UPI card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="w-full mt-8 bg-gradient-to-br from-card to-secondary border border-border rounded-2xl p-5"
          >
            <div className="flex items-center justify-between text-sm mb-3">
              <span className="text-muted-foreground">Transaction ID</span>
              <span className="font-mono font-medium">
                {eventId?.startsWith("ZYR") ? eventId : `ZYR${Math.floor(Math.random() * 900000 + 100000)}`}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm mb-3">
              <span className="text-muted-foreground">Method</span>
              <span className="font-medium">UPI Autopay</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Status</span>
              <span className="px-2 py-1 bg-success/10 text-success text-xs font-semibold rounded-full">
                PAID
              </span>
            </div>
          </motion.div>

          {/* Weekly protection */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="w-full mt-4 p-4 bg-primary/5 border border-primary/20 rounded-xl text-left"
          >
            <p className="text-sm font-medium">This week: <span className="text-success">₹{displayAmount + 320} protected</span></p>
            <p className="text-xs text-muted-foreground mt-0.5">Weekly coverage resets in 6 days</p>
          </motion.div>
        </motion.div>

        <div className="space-y-3 mt-6">
          <Button
            onClick={() => navigate("/saved-vs-lost")}
            className="w-full h-14 bg-primary text-primary-foreground flex items-center justify-center gap-2"
          >
            See What Zyro Saved You
            <ArrowRight className="w-5 h-5" />
          </Button>
          <button
            onClick={() => navigate("/dashboard")}
            className="w-full text-sm text-muted-foreground"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </MobileContainer>
  );
}
