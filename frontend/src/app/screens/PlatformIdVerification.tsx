import { useState } from "react";
import { MobileContainer } from "../components/MobileContainer";
import { ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { verifyPlatformId } from "../../services/mock/platform.mock";
import { useOnboardingStore, Platform } from "../../store/useOnboardingStore";
import { ImagePicker } from "../../components/common/ImagePicker";
import { haptics } from "../../services/haptics";
import { StepProgress } from "../../components/common/StepProgress";
import { toast } from "sonner";

const ONBOARDING_STEPS = [
  { id: 1, label: "Consent" },
  { id: 2, label: "Platform" },
  { id: 3, label: "Identity" },
  { id: 4, label: "Work" },
  { id: 5, label: "UPI" },
];

const PLATFORMS: { id: Platform; label: string; color: string }[] = [
  { id: "SWIGGY", label: "Swiggy", color: "#FF6B35" },
  { id: "ZOMATO", label: "Zomato", color: "#FF3B30" },
  { id: "OTHER", label: "Other", color: "#8B92A8" },
];

type VerifyState = "IDLE" | "VERIFYING" | "SUCCESS" | "ERROR";

export function PlatformIdVerification() {
  const navigate = useNavigate();
  const { platform, setPlatform, setPlatformId } = useOnboardingStore();

  const [riderId, setRiderId] = useState("");
  const [verifyState, setVerifyState] = useState<VerifyState>("IDLE");
  const [verifiedName, setVerifiedName] = useState("");
  const [uploadMode, setUploadMode] = useState(false);

  const handleVerify = async () => {
    if (!platform || (!riderId && !uploadMode)) return;
    setVerifyState("VERIFYING");
    try {
      const res = await verifyPlatformId(platform, riderId || "BADGE");
      setPlatformId(riderId, true);
      setVerifiedName(res.verifiedName);
      setVerifyState("SUCCESS");
      haptics.success();
      toast.success("Platform ID verified!");
      setTimeout(() => navigate("/selfie-capture"), 1200);
    } catch (e) {
      setVerifyState("ERROR");
      haptics.error();
      toast.error(e instanceof Error ? e.message : "Verification failed");
    }
  };

  return (
    <MobileContainer>
      <div className="flex flex-col min-h-screen px-6 py-8">
        <div className="mb-6">
          <StepProgress steps={ONBOARDING_STEPS} currentStep={3} variant="dots" />
        </div>
        <button
          onClick={() => navigate("/aadhaar-verify")}
          className="flex items-center gap-2 text-muted-foreground mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1"
        >
          <h1 className="text-2xl font-bold mb-2">Link Your Platform ID</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Linking your Swiggy/Zomato ID helps verify your activity and ensures
            faster automatic payouts.
          </p>

          {/* Platform picker */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {PLATFORMS.map((p) => (
              <button
                key={p.id}
                onClick={() => setPlatform(p.id)}
                className={`py-4 rounded-xl border-2 font-semibold text-sm transition-all ${
                  platform === p.id
                    ? "border-accent bg-accent/10"
                    : "border-border bg-card"
                }`}
                style={platform === p.id ? { color: p.color } : {}}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Input mode toggle */}
          {platform && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <div className="flex gap-2 text-sm">
                <button
                  onClick={() => setUploadMode(false)}
                  className={`px-4 py-2 rounded-lg border transition-all ${
                    !uploadMode
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-border text-muted-foreground"
                  }`}
                >
                  Enter ID
                </button>
                <button
                  onClick={() => setUploadMode(true)}
                  className={`px-4 py-2 rounded-lg border transition-all ${
                    uploadMode
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-border text-muted-foreground"
                  }`}
                >
                  Upload Badge
                </button>
              </div>

              <AnimatePresence mode="wait">
                {uploadMode ? (
                  <motion.div
                    key="upload"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <ImagePicker
                      label="Upload your rider ID badge"
                      onImageSelected={() => setRiderId("BADGE")}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="id"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <Input
                      type="text"
                      placeholder="Enter your Rider ID"
                      value={riderId}
                      onChange={(e) => setRiderId(e.target.value)}
                      className="h-14 bg-card border-border text-base"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {verifyState === "SUCCESS" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-3 p-4 bg-success/5 border border-success/20 rounded-xl"
                >
                  <CheckCircle2 className="w-5 h-5 text-success" />
                  <span className="text-sm text-success">{verifiedName}</span>
                </motion.div>
              )}

              {verifyState === "ERROR" && (
                <p className="text-sm text-destructive">
                  Verification failed. Please check your Rider ID.
                </p>
              )}
            </motion.div>
          )}
        </motion.div>

        <Button
          onClick={handleVerify}
          disabled={
            !platform ||
            (!riderId && !uploadMode) ||
            verifyState === "VERIFYING" ||
            verifyState === "SUCCESS"
          }
          className="w-full h-14 bg-primary text-primary-foreground disabled:opacity-50"
        >
          {verifyState === "VERIFYING" ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Verifying…
            </span>
          ) : verifyState === "SUCCESS" ? (
            "Verified ✓"
          ) : (
            "Verify ID"
          )}
        </Button>
      </div>
    </MobileContainer>
  );
}
