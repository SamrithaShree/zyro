import { MobileContainer } from "../components/MobileContainer";
import { ArrowLeft, Check } from "lucide-react";
import { Button } from "../components/ui/button";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { useState } from "react";
import { useOnboardingStore, Platform } from "../../store/useOnboardingStore";

const platforms = [
  { id: "SWIGGY", name: "Swiggy", color: "#FF5200" },
  { id: "ZOMATO", name: "Zomato", color: "#E23744" },
  { id: "DUNZO", name: "Dunzo", color: "#E20074" },
  { id: "ZEPTO", name: "Zepto", color: "#8B4DC3" },
  { id: "BLINKIT", name: "Blinkit", color: "#FFD400" },
  { id: "OTHER", name: "Other", color: "#8B92A8" },
];

export function PlatformSelection() {
  const navigate = useNavigate();
  const setPlatform = useOnboardingStore((s) => s.setPlatform);
  const [selected, setSelected] = useState<string[]>([]);

  const togglePlatform = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleContinue = () => {
    if (selected.length > 0) {
      // Pick the first selected platform for the primary state
      const primaryPlatform = selected[0] as Platform;
      setPlatform(primaryPlatform);
      navigate("/aadhaar-verify");
    }
  };

  return (
    <MobileContainer>
      <div className="flex flex-col min-h-screen px-6 py-8">
        {/* Header */}
        <button
          onClick={() => navigate("/verify-otp")}
          className="flex items-center gap-2 text-muted-foreground mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs text-muted-foreground">Step 1 of 4</span>
            <div className="flex-1 h-1 bg-secondary rounded-full overflow-hidden">
              <div className="w-1/4 h-full bg-accent" />
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
            <h1 className="text-2xl font-bold mb-2">
              Which platforms do you work on?
            </h1>
            <p className="text-muted-foreground">Select all that apply</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {platforms.map((platform) => {
              const isSelected = selected.includes(platform.id);
              return (
                <button
                  key={platform.id}
                  onClick={() => togglePlatform(platform.id)}
                  className={`relative h-28 rounded-xl border-2 transition-all ${
                    isSelected
                      ? "border-accent bg-accent/5"
                      : "border-border bg-card hover:border-accent/50"
                  }`}
                >
                  <div className="flex flex-col items-center justify-center h-full gap-2">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${platform.color}20` }}
                    >
                      <div
                        className="w-6 h-6 rounded-full"
                        style={{ backgroundColor: platform.color }}
                      />
                    </div>
                    <span className="font-medium">{platform.name}</span>
                  </div>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-3 right-3 w-6 h-6 bg-accent rounded-full flex items-center justify-center"
                    >
                      <Check className="w-4 h-4 text-accent-foreground" />
                    </motion.div>
                  )}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* CTA */}
        <Button
          onClick={handleContinue}
          disabled={selected.length === 0}
          className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue
        </Button>
      </div>
    </MobileContainer>
  );
}
