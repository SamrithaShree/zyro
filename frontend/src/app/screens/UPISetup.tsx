import { MobileContainer } from "../components/MobileContainer";
import { ArrowLeft, Wallet, CheckCircle2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { useState } from "react";

import { useOnboardingStore } from "../../store/useOnboardingStore";

export function UPISetup() {
  const navigate = useNavigate();
  const setUPI = useOnboardingStore((s) => s.setUPI);
  const [upiId, setUpiId] = useState("");
  const [verified, setVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const handleVerify = () => {
    if (upiId.includes("@")) {
      setVerifying(true);
      setTimeout(() => {
        setVerified(true);
        setVerifying(false);
      }, 1500);
    }
  };

  const handleContinue = () => {
    if (verified) {
      setUPI(upiId, true);
      navigate("/readiness");
    }
  };

  return (
    <MobileContainer>
      <div className="flex flex-col min-h-screen px-6 py-8">
        {/* Header */}
        <button
          onClick={() => navigate("/work-profile")}
          className="flex items-center gap-2 text-muted-foreground mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs text-muted-foreground">Step 4 of 4</span>
            <div className="flex-1 h-1 bg-secondary rounded-full overflow-hidden">
              <div className="w-full h-full bg-accent" />
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
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
              <Wallet className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Setup instant payouts</h1>
            <p className="text-muted-foreground">
              Get paid directly to your UPI account
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm mb-2 text-muted-foreground">
                UPI ID
              </label>
              <div className="space-y-3">
                <Input
                  type="text"
                  placeholder="yourname@paytm"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value.toLowerCase())}
                  disabled={verified}
                  className="h-14 bg-card border-border"
                />
                {!verified && (
                  <Button
                    onClick={handleVerify}
                    disabled={!upiId.includes("@") || verifying}
                    variant="outline"
                    className="w-full h-12 border-accent text-accent hover:bg-accent/10"
                  >
                    {verifying ? "Verifying..." : "Verify UPI ID"}
                  </Button>
                )}
              </div>
            </div>

            {verified && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[#00FF87]/5 border border-[#00FF87]/20 rounded-xl p-4"
              >
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-[#00FF87] flex-shrink-0" />
                  <div>
                    <h4 className="font-medium mb-1 text-[#00FF87]">
                      UPI verified
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Payouts will be instant when disruptions are detected
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            <div className="bg-secondary/50 rounded-xl p-4 space-y-3">
              <h4 className="font-medium">How instant payouts work:</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                  <span>Zyro detects disruption in your area</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                  <span>System validates your eligibility</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                  <span>Money sent to your UPI instantly</span>
                </li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        <Button
          onClick={handleContinue}
          disabled={!verified}
          className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Complete Setup
        </Button>
      </div>
    </MobileContainer>
  );
}
