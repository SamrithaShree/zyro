import { MobileContainer } from "../components/MobileContainer";
import { ArrowLeft, Clock, TrendingUp } from "lucide-react";
import { Button } from "../components/ui/button";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { useState } from "react";

const workingHours = ["4-6 hours", "6-8 hours", "8-10 hours", "10+ hours"];
const peakTimes = ["Morning", "Afternoon", "Evening", "Night", "All day"];
const incomeRanges = [
  "₹300-500/day",
  "₹500-800/day",
  "₹800-1200/day",
  "₹1200+/day",
];

import { useOnboardingStore, WorkHours, PeakHour } from "../../store/useOnboardingStore";

export function WorkProfile() {
  const navigate = useNavigate();
  const setWorkProfile = useOnboardingStore((s) => s.setWorkProfile);
  const [hours, setHours] = useState("");
  const [peakTime, setPeakTime] = useState("");
  const [income, setIncome] = useState("");

  const handleContinue = () => {
    if (hours && peakTime && income) {
      // Map to store types
      const mappedHours = hours.split(" ")[0] as WorkHours;
      const mappedPeak = peakTime.toUpperCase() as PeakHour;
      setWorkProfile(mappedHours, mappedPeak);
      navigate("/income-input");
    }
  };

  const isComplete = hours && peakTime && income;

  return (
    <MobileContainer>
      <div className="flex flex-col min-h-screen px-6 py-8">
        {/* Header */}
        <button
          onClick={() => navigate("/location")}
          className="flex items-center gap-2 text-muted-foreground mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs text-muted-foreground">Step 3 of 4</span>
            <div className="flex-1 h-1 bg-secondary rounded-full overflow-hidden">
              <div className="w-3/4 h-full bg-accent" />
            </div>
          </div>
        </div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1"
        >
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-2">Tell us about your work</h1>
            <p className="text-muted-foreground">
              This helps us calculate accurate protection
            </p>
          </div>

          <div className="space-y-6">
            {/* Working Hours */}
            <div>
              <label className="flex items-center gap-2 text-sm mb-3 text-muted-foreground">
                <Clock className="w-4 h-4" />
                Daily working hours
              </label>
              <div className="grid grid-cols-2 gap-3">
                {workingHours.map((option) => (
                  <button
                    key={option}
                    onClick={() => setHours(option)}
                    className={`h-12 rounded-xl border-2 font-medium transition-all ${
                      hours === option
                        ? "border-accent bg-accent/5 text-accent"
                        : "border-border bg-card hover:border-accent/50"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            {/* Peak Time */}
            <div>
              <label className="flex items-center gap-2 text-sm mb-3 text-muted-foreground">
                <TrendingUp className="w-4 h-4" />
                Peak earning time
              </label>
              <div className="grid grid-cols-3 gap-3">
                {peakTimes.map((option) => (
                  <button
                    key={option}
                    onClick={() => setPeakTime(option)}
                    className={`h-12 rounded-xl border-2 font-medium transition-all ${
                      peakTime === option
                        ? "border-accent bg-accent/5 text-accent"
                        : "border-border bg-card hover:border-accent/50"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            {/* Income Range */}
            <div>
              <label className="flex items-center gap-2 text-sm mb-3 text-muted-foreground">
                <TrendingUp className="w-4 h-4" />
                Average daily income
              </label>
              <div className="grid grid-cols-2 gap-3">
                {incomeRanges.map((option) => (
                  <button
                    key={option}
                    onClick={() => setIncome(option)}
                    className={`h-12 rounded-xl border-2 font-medium transition-all ${
                      income === option
                        ? "border-accent bg-accent/5 text-accent"
                        : "border-border bg-card hover:border-accent/50"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            {isComplete && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#00FF87]/5 border border-[#00FF87]/20 rounded-xl p-4"
              >
                <p className="text-sm text-muted-foreground">
                  Based on your profile, Zyro can protect up to{" "}
                  <span className="text-[#00FF87] font-semibold">
                    ₹400-600/day
                  </span>{" "}
                  during disruptions
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* CTA */}
        <Button
          onClick={handleContinue}
          disabled={!isComplete}
          className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue
        </Button>
      </div>
    </MobileContainer>
  );
}
