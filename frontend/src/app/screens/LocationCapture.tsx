import { MobileContainer } from "../components/MobileContainer";
import { ArrowLeft, MapPin, CheckCircle2, Navigation } from "lucide-react";
import { Button } from "../components/ui/button";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { useState } from "react";

import { useOnboardingStore } from "../../store/useOnboardingStore";

export function LocationCapture() {
  const navigate = useNavigate();
  const setLocation = useOnboardingStore((s) => s.setLocation);
  const [locationDetected, setLocationDetected] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDetectLocation = () => {
    setLoading(true);
    // Simulate location detection
    setTimeout(() => {
      setLocationDetected(true);
      setLoading(false);
      setLocation({
        zone: "Anna Nagar",
        city: "Chennai",
        lat: 13.0827,
        lng: 80.2707,
      });
    }, 1500);
  };

  const handleContinue = () => {
    if (locationDetected) {
      navigate("/work-profile");
    }
  };

  return (
    <MobileContainer>
      <div className="flex flex-col min-h-screen px-6 py-8">
        {/* Header */}
        <button
          onClick={() => navigate("/platform-selection")}
          className="flex items-center gap-2 text-muted-foreground mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs text-muted-foreground">Step 2 of 4</span>
            <div className="flex-1 h-1 bg-secondary rounded-full overflow-hidden">
              <div className="w-2/4 h-full bg-accent" />
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
            <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mb-6">
              <MapPin className="w-8 h-8 text-accent" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Where do you work?</h1>
            <p className="text-muted-foreground">
              We'll monitor local disruptions in your area
            </p>
          </div>

          <div className="space-y-4">
            {!locationDetected ? (
              <button
                onClick={handleDetectLocation}
                disabled={loading}
                className="w-full h-32 bg-card border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-3 hover:border-accent transition-all disabled:opacity-50"
              >
                <Navigation
                  className={`w-8 h-8 text-accent ${loading ? "animate-pulse" : ""}`}
                />
                <span className="font-medium">
                  {loading ? "Detecting location..." : "Tap to detect location"}
                </span>
              </button>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-card border border-accent/20 rounded-xl p-6"
              >
                <div className="flex items-start gap-3 mb-4">
                  <CheckCircle2 className="w-6 h-6 text-[#00FF87] flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">Location detected</h3>
                    <p className="text-sm text-muted-foreground">
                      Anna Nagar, Chennai
                    </p>
                  </div>
                </div>
                <div className="bg-accent/5 border border-accent/20 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">
                    Zyro will monitor weather, traffic, and platform disruptions
                    in this zone automatically.
                  </p>
                </div>
              </motion.div>
            )}

            <div className="bg-secondary/50 rounded-xl p-4">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-accent" />
                Why we need this
              </h4>
              <p className="text-sm text-muted-foreground">
                Local disruptions vary by area. Your location helps us detect
                rain, pollution, or curfews that affect your earnings.
              </p>
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        <Button
          onClick={handleContinue}
          disabled={!locationDetected}
          className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue
        </Button>
      </div>
    </MobileContainer>
  );
}
