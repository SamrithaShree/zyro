import { MobileContainer } from "../components/MobileContainer";
import { Check, Circle } from "lucide-react";
import { Button } from "../components/ui/button";
import { useNavigate } from "react-router";
import { motion } from "motion/react";

const timelineSteps = [
  {
    id: 1,
    label: "Detected",
    description: "Heavy rain in Anna Nagar",
    status: "completed",
    time: "14:23",
  },
  {
    id: 2,
    label: "Validated",
    description: "All checks passed",
    status: "completed",
    time: "14:24",
  },
  {
    id: 3,
    label: "Approved",
    description: "Payout amount confirmed",
    status: "active",
    time: "14:26",
  },
  {
    id: 4,
    label: "Paid",
    description: "Transferring to UPI",
    status: "pending",
    time: "---",
  },
];

export function TimelineView() {
  const navigate = useNavigate();

  return (
    <MobileContainer>
      <div className="flex flex-col min-h-screen px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1"
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-2">Claim Timeline</h1>
            <p className="text-muted-foreground">
              Track your claim progress
            </p>
          </div>

          {/* Timeline */}
          <div className="relative mb-8">
            {timelineSteps.map((step, index) => {
              const isCompleted = step.status === "completed";
              const isActive = step.status === "active";
              const isPending = step.status === "pending";

              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.2 }}
                  className="relative flex gap-4 pb-8 last:pb-0"
                >
                  {/* Timeline Line */}
                  {index < timelineSteps.length - 1 && (
                    <div className="absolute left-[19px] top-10 w-0.5 h-[calc(100%-40px)] bg-border" />
                  )}

                  {/* Status Icon */}
                  <div className="relative z-10 flex-shrink-0">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        isCompleted
                          ? "bg-[#00FF87]/10 border-2 border-[#00FF87]"
                          : isActive
                          ? "bg-accent/10 border-2 border-accent"
                          : "bg-secondary border-2 border-border"
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="w-5 h-5 text-[#00FF87]" />
                      ) : isActive ? (
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          <Circle className="w-5 h-5 text-accent fill-accent" />
                        </motion.div>
                      ) : (
                        <Circle className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 pt-1">
                    <div className="bg-card border border-border rounded-xl p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3
                          className={`font-semibold ${
                            isPending ? "text-muted-foreground" : ""
                          }`}
                        >
                          {step.label}
                        </h3>
                        <span className="text-xs text-muted-foreground">
                          {step.time}
                        </span>
                      </div>
                      <p
                        className={`text-sm ${
                          isPending
                            ? "text-muted-foreground"
                            : "text-muted-foreground"
                        }`}
                      >
                        {step.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Info Box */}
          <div className="bg-accent/5 border border-accent/20 rounded-xl p-4">
            <h4 className="font-medium mb-2 text-accent">Next Step</h4>
            <p className="text-sm text-muted-foreground">
              Your claim is being reviewed for final approval. This usually takes
              less than a minute.
            </p>
          </div>
        </motion.div>

        {/* CTA */}
        <Button
          onClick={() => navigate("/eligibility")}
          className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          View Eligibility Details
        </Button>
      </div>
    </MobileContainer>
  );
}
