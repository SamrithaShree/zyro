import { MobileContainer } from "../components/MobileContainer";
import { Button } from "../components/ui/button";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import confetti from "canvas-confetti";
import { useEffect } from "react";
import { useOnboardingStore } from "../../store/useOnboardingStore";

export function RegistrationSuccess() {
  const navigate = useNavigate();
  const complete = useOnboardingStore((s) => s.complete);

  useEffect(() => {
    complete();

    // Burst confetti
    const burst = () => {
      confetti({
        particleCount: 80,
        spread: 120,
        origin: { y: 0.55 },
        colors: ["#FFA726", "#00E5FF", "#00FF87", "#FFCA28"],
        startVelocity: 40,
        scalar: 1.1,
      });
    };

    // Continuous side streams
    const duration = 3 * 1000;
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
      if (Date.now() < end) requestAnimationFrame(frame);
    };

    setTimeout(burst, 300);
    frame();
  }, []);

  return (
    <MobileContainer>
      <div className="relative flex flex-col min-h-screen overflow-hidden">
        {/* Background glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 70% 60% at 50% 40%, rgba(0,229,255,0.12) 0%, transparent 70%), radial-gradient(ellipse 50% 50% at 50% 80%, rgba(255,167,38,0.10) 0%, transparent 60%), #0F1115",
          }}
        />

        <div className="relative flex flex-col min-h-screen px-6 pb-10 pt-16 items-center text-center">
          {/* Big checkmark with animation */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 14 }}
            className="relative mb-10"
          >
            {/* Outer glow circles */}
            <motion.div
              animate={{ scale: [1, 1.12, 1], opacity: [0.5, 0.3, 0.5] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
              className="absolute inset-0 rounded-full"
              style={{
                background:
                  "radial-gradient(circle, rgba(0,229,255,0.3) 0%, transparent 70%)",
                transform: "scale(2)",
              }}
            />
            <motion.div
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut", delay: 0.3 }}
              className="w-32 h-32 rounded-full flex items-center justify-center relative"
              style={{
                background:
                  "linear-gradient(135deg, rgba(0,229,255,0.2) 0%, rgba(0,255,135,0.2) 100%)",
                border: "2px solid rgba(0,229,255,0.4)",
              }}
            >
              <motion.div
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.4, type: "spring", stiffness: 160 }}
                className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, #00E5FF, #00FF87)",
                }}
              >
                <svg
                  viewBox="0 0 24 24"
                  className="w-10 h-10 text-background"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <motion.path
                    d="M5 13l4 4L19 7"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ delay: 0.6, duration: 0.6 }}
                  />
                </svg>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mb-10"
          >
            <h1 className="text-4xl font-bold mb-3 leading-tight">
              You're now protected 💛
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-xs mx-auto">
              Even if your work stops, your income won't.
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.85 }}
            className="w-full grid grid-cols-3 gap-3 mb-10"
          >
            {[
              { value: "24/7", label: "Monitoring" },
              { value: "0", label: "Paperwork" },
              { value: "Auto", label: "Payouts" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl p-4 text-center"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  backdropFilter: "blur(8px)",
                }}
              >
                <p
                  className="text-xl font-bold text-transparent bg-clip-text mb-1"
                  style={{ backgroundImage: "linear-gradient(90deg,#FFA726,#00E5FF)" }}
                >
                  {stat.value}
                </p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </motion.div>

          {/* Disclaimer card */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="w-full rounded-2xl p-4 mb-10"
            style={{
              background:
                "linear-gradient(135deg, rgba(0,229,255,0.06) 0%, rgba(255,167,38,0.06) 100%)",
              border: "1px solid rgba(0,229,255,0.15)",
            }}
          >
            <p className="text-sm text-muted-foreground leading-relaxed">
              🎯 Zyro is watching. The moment a disruption is detected in your
              zone, we'll automatically process your payout — straight to your UPI.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            className="w-full space-y-3 mt-auto"
          >
            <Button
              id="success-dashboard-btn"
              onClick={() => navigate("/dashboard")}
              className="w-full h-14 rounded-2xl font-bold text-base"
              style={{
                background: "linear-gradient(90deg, #FFA726 0%, #FFCA28 100%)",
                color: "#0F1115",
                boxShadow: "0 0 32px rgba(255,167,38,0.35)",
              }}
            >
              Go to Dashboard →
            </Button>
          </motion.div>
        </div>
      </div>
    </MobileContainer>
  );
}
