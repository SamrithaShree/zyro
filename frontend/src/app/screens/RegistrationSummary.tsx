import { MobileContainer } from "../components/MobileContainer";
import { CheckCircle2, Shield, MapPin, Briefcase } from "lucide-react";
import { Button } from "../components/ui/button";
import { useNavigate } from "react-router";
import { motion } from "motion/react";

const checklist = [
  {
    icon: Shield,
    label: "Identity verified",
    desc: "Platform ID + Aadhaar confirmed",
    color: "#00FF87",
  },
  {
    icon: MapPin,
    label: "Location captured",
    desc: "Anna Nagar, Chennai · LOW risk zone",
    color: "#00E5FF",
  },
  {
    icon: Briefcase,
    label: "Work profile completed",
    desc: "Swiggy · 6-8 hrs · ₹700–1000/day",
    color: "#FFA726",
  },
];

export function RegistrationSummary() {
  const navigate = useNavigate();

  return (
    <MobileContainer>
      <div className="flex flex-col min-h-screen px-6 py-10">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-muted-foreground">Step 6 of 6</span>
            <div className="flex-1 h-1 bg-secondary rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: "linear-gradient(90deg,#FFA726,#00E5FF)" }}
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 0.8 }}
              />
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1"
        >
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-2">You're almost there 🎯</h1>
            <p className="text-muted-foreground text-sm">
              Here's everything we've set up for you
            </p>
          </div>

          {/* Checklist */}
          <div className="space-y-3 mb-8">
            {checklist.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.12 }}
                  className="flex items-center gap-4 bg-card rounded-2xl p-4 border border-border"
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{
                      background: `${item.color}15`,
                      border: `1.5px solid ${item.color}30`,
                    }}
                  >
                    <Icon className="w-5 h-5" style={{ color: item.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm text-foreground leading-tight">
                      {item.label}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                      {item.desc}
                    </p>
                  </div>
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0" style={{ color: item.color }} />
                </motion.div>
              );
            })}
          </div>

          {/* Trust Score */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="rounded-2xl p-5 mb-8 relative overflow-hidden"
            style={{
              background:
                "linear-gradient(135deg, rgba(0,229,255,0.08) 0%, rgba(255,167,38,0.08) 100%)",
              border: "1px solid rgba(0,229,255,0.2)",
            }}
          >
            <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">
              Trust Score
            </p>
            <div className="flex items-end gap-2 mb-3">
              <span
                className="text-5xl font-bold text-transparent bg-clip-text"
                style={{
                  backgroundImage: "linear-gradient(90deg, #FFA726, #00E5FF)",
                }}
              >
                72
              </span>
              <span className="text-muted-foreground mb-2 text-lg">/ 100</span>
            </div>

            {/* Score bar */}
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: "linear-gradient(90deg, #FFA726, #00E5FF)" }}
                initial={{ width: "0%" }}
                animate={{ width: "72%" }}
                transition={{ delay: 0.6, duration: 0.8 }}
              />
            </div>

            <p className="text-xs text-muted-foreground mt-3">
              Complete Aadhaar verification to boost your score to 92+
            </p>
          </motion.div>

          {/* Info note */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="bg-accent/5 border border-accent/20 rounded-xl p-4"
          >
            <p className="text-xs text-muted-foreground leading-relaxed">
              <span className="text-accent font-semibold">You're all verified.</span>{" "}
              Zyro will now monitor your area for disruptions and automatically
              credit your UPI when you're eligible.
            </p>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-6"
        >
          <Button
            id="summary-continue-btn"
            onClick={() => navigate("/registration-success")}
            className="w-full h-14 rounded-2xl font-bold text-base"
            style={{
              background: "linear-gradient(90deg, #FFA726 0%, #FFCA28 100%)",
              color: "#0F1115",
              boxShadow: "0 0 24px rgba(255,167,38,0.3)",
            }}
          >
            Activate My Protection ⚡
          </Button>
        </motion.div>
      </div>
    </MobileContainer>
  );
}
