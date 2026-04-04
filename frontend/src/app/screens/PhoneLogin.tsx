import { useState, useRef, useEffect } from "react";
import { MobileContainer } from "../components/MobileContainer";
import {
  ArrowLeft,
  Smartphone,
  Delete,
  Loader2,
  ShieldCheck,
  ChevronRight,
  Fingerprint,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { apiService } from "../../services/api";
import { useAuthStore } from "../../store/useAuthStore";
import { useOnboardingStore } from "../../store/useOnboardingStore";
import { toast } from "sonner";

/* ─────────────────────────────────────────
   Palette & Style Config (Phase 2 Pro)
───────────────────────────────────────── */

type Step = "phone" | "otp" | "mpin" | "loading";

const KEYPAD = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  ["", "0", "⌫"],
];

const containerVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.4,
      staggerChildren: 0.08,
      ease: [0.25, 1, 0.5, 1]
    }
  },
  exit: { 
    opacity: 0, 
    y: -10,
    transition: { duration: 0.2 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" }
  }
};

/* ─────────────────────────────────────────
   STEP 1 — Phone
───────────────────────────────────────── */
function PhoneStep({
  onDone,
}: {
  onDone: (phone: string, data: any) => void;
}) {
  const storePhone = useAuthStore(s => s.phone);
  const [phone, setPhone] = useState(storePhone.replace("+91", "") || "");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (phone.length !== 10) return;
    setLoading(true);
    try {
      // sendOtp result tells us if user has mPIN
      const res = await apiService.auth.sendOtp(phone);
      if (res.data.status === "SUCCESS") {
        onDone(phone, res.data.data);
      }
    } catch {
      // Handled by API interceptor
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      key="phone"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="flex-1 flex flex-col pt-4"
    >
      <motion.div variants={itemVariants} className="mb-12">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 bg-white/10 ring-1 ring-white/20 shadow-inner">
          <Smartphone className="w-7 h-7 text-white" strokeWidth={1.5} />
        </div>
        <h1 className="text-3xl font-bold mb-3 text-white tracking-tight">Welcome</h1>
        <p className="text-[#BEE9E8]/70 text-base max-w-[280px] leading-relaxed">
          Enter your mobile number to get started with Zyro.
        </p>
      </motion.div>

      <motion.div variants={itemVariants} className="space-y-8 flex-1">
        <div className="bg-white rounded-[2rem] p-8 shadow-2xl shadow-black/20">
          <label className="block text-[11px] font-bold mb-4 text-[#1B4965]/40 uppercase tracking-[0.15em]">
            Mobile Number
          </label>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 h-16 bg-[#F8FAFC] rounded-2xl border border-[#1B4965]/5">
              <span className="text-[#1B4965] font-black text-lg">+91</span>
            </div>
            <Input
              type="tel"
              placeholder="00000 00000"
              value={phone}
              onChange={(e) =>
                setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
              }
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              className="flex-1 h-16 bg-[#F8FAFC] border-none rounded-2xl text-xl font-bold tracking-[0.1em] text-[#1B4965] placeholder:text-[#1B4965]/20 focus-visible:ring-2 focus-visible:ring-[#62B6CB]/20 transition-all"
              maxLength={10}
              autoFocus
            />
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} whileTap={{ scale: 0.98 }} className="mt-8 pb-4">
        <Button
          onClick={handleSend}
          disabled={phone.length !== 10 || loading}
          className="w-full h-16 rounded-2xl font-bold text-lg shadow-xl shadow-[#62B6CB]/20 bg-[#62B6CB] text-white hover:bg-[#5FA8D3] border-none transition-all group"
        >
          {loading ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <span className="flex items-center gap-2">
              Continue <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          )}
        </Button>
      </motion.div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────
   STEP 2 — OTP (For Registration & Forgot PIN)
───────────────────────────────────────── */
function OTPStep({
  phone,
  onDone,
}: {
  phone: string;
  onDone: (data: any) => void;
}) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    refs.current[0]?.focus();
  }, []);

  const handleChange = (i: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[i] = val.slice(-1);
    setOtp(next);
    if (val && i < 5) refs.current[i + 1]?.focus();
    if (next.every(Boolean) && i === 5) submit(next.join(""));
  };

  const handleKey = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[i] && i > 0)
      refs.current[i - 1]?.focus();
  };

  const submit = async (code: string) => {
    setLoading(true);
    try {
      const res = await apiService.auth.verifyOtp(phone, code);
      if (res.data.status === "SUCCESS") {
        onDone(res.data.data);
      }
    } catch {
      setOtp(["", "", "", "", "", ""]);
      setTimeout(() => refs.current[0]?.focus(), 50);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      key="otp"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="flex-1 flex flex-col pt-4"
    >
      <motion.div variants={itemVariants} className="mb-12">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 bg-white/10 ring-1 ring-white/20 shadow-inner text-white">
          <ShieldCheck className="w-7 h-7" strokeWidth={1.5} />
        </div>
        <h1 className="text-3xl font-bold mb-3 text-white tracking-tight">Identity Check</h1>
        <p className="text-[#BEE9E8]/70 text-base leading-relaxed">
          Verify your account via 6-digit OTP sent to <span className="text-white font-bold tracking-wider">+91 {phone}</span>
        </p>
      </motion.div>

      <motion.div variants={itemVariants} className="flex-1">
        <div className="bg-white rounded-[2rem] p-8 shadow-2xl shadow-black/20 text-center">
          <div className="flex gap-2.5 justify-center mb-8">
            {otp.map((d, i) => (
              <input
                key={i}
                ref={(el) => { refs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={d}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKey(i, e)}
                className="w-11 h-14 bg-[#F8FAFC] border-none rounded-xl text-center text-2xl font-bold text-[#1B4965] focus:ring-2 focus:ring-[#62B6CB]/30 focus:outline-none transition-all"
              />
            ))}
          </div>

          <button
            onClick={() => apiService.auth.sendOtp(phone)}
            className="text-[#62B6CB] font-bold text-sm hover:text-[#5FA8D3] transition-colors flex items-center justify-center gap-1 mx-auto"
          >
            Resend OTP
          </button>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} whileTap={{ scale: 0.98 }} className="mt-8 pb-4">
        <Button
          onClick={() => submit(otp.join(""))}
          disabled={!otp.every(Boolean) || loading}
          className="w-full h-16 rounded-2xl font-bold text-lg shadow-xl shadow-[#62B6CB]/20 bg-[#62B6CB] text-white"
        >
          {loading ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            "Verify Identity"
          )}
        </Button>
      </motion.div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────
   STEP 3 — MPIN (Fast Sign-in Path)
───────────────────────────────────────── */
function MPINStep({
  phone,
  onDone,
  onForgot,
}: {
  phone: string;
  onDone: (data: any) => void;
  onForgot: () => void;
}) {
  const [pin, setPin] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [shaking, setShaking] = useState(false);

  const handleKey = async (key: string) => {
    if (key === "⌫") {
      setPin((p) => p.slice(0, -1));
      return;
    }
    if (pin.length >= 4) return;
    const next = [...pin, key];
    setPin(next);

    if (next.length === 4) {
      setLoading(true);
      try {
        const res = await apiService.auth.loginMpin(phone, next.join(""));
        if (res.data.status === "SUCCESS") {
          onDone(res.data.data);
        }
      } catch {
        setShaking(true);
        setTimeout(() => setShaking(false), 500);
        setPin([]);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <motion.div
      key="mpin"
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={containerVariants}
      className="flex-1 flex flex-col items-center pt-4"
    >
      <motion.div variants={itemVariants} className="mb-12 text-center flex flex-col items-center">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 bg-white/10 ring-1 ring-white/20 shadow-inner">
          <Fingerprint className="w-7 h-7 text-white" strokeWidth={1.5} />
        </div>
        <h1 className="text-3xl font-bold mb-3 text-white tracking-tight">Access Key</h1>
        <p className="text-[#BEE9E8]/70 text-base">Sign in with your 4-digit mPIN</p>
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="flex gap-6 mb-12"
        animate={shaking ? { x: [0, -10, 10, -10, 10, 0] } : {}}
      >
        {Array.from({ length: 4 }, (_, i) => (
          <div
            key={i}
            className={`w-4 h-4 rounded-full transition-all duration-300 ${
              i < pin.length ? "bg-[#62B6CB] scale-125 shadow-[0_0_10px_#62B6CB]" : "bg-white/20"
            }`}
          />
        ))}
      </motion.div>

      <motion.div variants={itemVariants} className="w-full grid grid-cols-3 gap-5 max-w-[300px]">
        {KEYPAD.flat().map((key, i) => (
          <motion.button
            key={i}
            onClick={() => key && !loading && handleKey(key)}
            disabled={!key || loading}
            whileTap={{ scale: 0.92 }}
            className={`h-16 rounded-2xl font-bold text-2xl flex items-center justify-center transition-all ${
              !key ? "opacity-0 cursor-default" : "bg-white/10 text-white border border-white/5 hover:bg-white/20 active:bg-white/30 backdrop-blur-sm shadow-sm"
            }`}
          >
            {key === "⌫" ? <Delete className="w-6 h-6" /> : key}
          </motion.button>
        ))}
      </motion.div>

      <motion.button
        variants={itemVariants}
        onClick={onForgot}
        className="text-[#62B6CB] font-black text-sm mt-12 hover:text-white transition-colors uppercase tracking-widest"
      >
        Forgot PIN? Use OTP instead
      </motion.button>
    </motion.div>
  );
}

/* ─────────────────────────────────────────
   Root — PhoneLogin (Handles 3 paths)
───────────────────────────────────────── */
export function PhoneLogin() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const syncOnboarding = useOnboardingStore((s) => s.syncWithBackend);

  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhoneLocal] = useState("");
  const [isRecovering, setIsRecovering] = useState(false);

  // STEP 1 Callback
  const handlePhoneDone = (p: string, data: any) => {
    setPhoneLocal(p);
    // RULE: Sign-in should only ask for mPIN if available
    if (data.is_registered && data.has_mpin) {
      setStep("mpin");
    } else {
      setStep("otp");
    }
  };

  // STEP 2 Callback (OTP Success)
  const handleOTPDone = async (data: any) => {
    setAuth({ ...data, phone });
    
    // Check if we are in Forgot mPIN path
    if (isRecovering) {
      await syncOnboarding();
      // Onboarding step 10 is mPIN Setup
      navigate("/onboarding"); 
    } else if (data.is_registered) {
      // Registered but somehow reached here (e.g. no mPIN set)
      await syncOnboarding();
      navigate("/onboarding");
    } else {
      // New user registration
      await syncOnboarding();
      navigate("/onboarding");
    }
  };

  // STEP 3 Callback (mPIN Success)
  const handleMPINDone = async (data: any) => {
    setAuth({ ...data, phone });
    await syncOnboarding();
    setStep("loading");
    setTimeout(() => navigate("/dashboard"), 1500);
  };

  // Recovery Logic
  const handleForgotPIN = () => {
    setIsRecovering(true);
    setStep("otp"); // Switch back to OTP screen
  };

  const handleBack = () => {
    if (step === "phone") navigate("/");
    else if (step === "otp" && isRecovering) setStep("mpin");
    else if (step === "otp") setStep("phone");
    else if (step === "mpin") setStep("phone");
  };

  return (
    <MobileContainer style={{ backgroundColor: "#1B4965" }}>
      <div className="flex flex-col min-h-screen px-8 py-10 selection:bg-[#62B6CB] selection:text-white">
        {step !== "loading" && (
          <button
            onClick={handleBack}
            className="w-11 h-11 flex items-center justify-center rounded-xl bg-white/10 text-white mb-10 ring-1 ring-white/10 hover:bg-white/20 transition-all shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}

        <AnimatePresence mode="wait">
          {step === "phone" && <PhoneStep onDone={handlePhoneDone} />}
          {step === "otp" && <OTPStep phone={phone} onDone={handleOTPDone} />}
          {step === "mpin" && <MPINStep phone={phone} onDone={handleMPINDone} onForgot={handleForgotPIN} />}
          {step === "loading" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 flex flex-col items-center justify-center text-center gap-8"
            >
               <div className="relative">
                 <Loader2 className="w-14 h-14 animate-spin text-[#62B6CB] relative z-10" strokeWidth={2.5} />
                 <div className="absolute inset-0 w-14 h-14 bg-[#62B6CB]/20 blur-xl animate-pulse" />
               </div>
               <div className="space-y-2">
                 <p className="text-2xl font-black text-white tracking-tight">Authorizing</p>
                 <p className="text-white/40 text-sm font-medium">Securing your session...</p>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MobileContainer>
  );
}
