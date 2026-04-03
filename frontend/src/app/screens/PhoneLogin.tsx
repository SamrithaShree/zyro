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
import { authService } from "../../services/authService";
import { useAuthStore } from "../../store/useAuthStore";
import { toast } from "sonner";

/* ─────────────────────────────────────────
   Palette & Style Config (Phase 2 Pro)
   Background: #1B4965 (Deep Navy)
   Surface: #FFFFFF (Pure White)
   Interactive: #62B6CB (Accent Blue)
   Success: #5FA8D3 (Muted Sky)
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
  onDone: (phone: string) => void;
}) {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (phone.length !== 10) return;
    setLoading(true);
    try {
      await authService.sendOtp(phone);
      onDone(phone);
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
        <h1 className="text-3xl font-bold mb-3 text-white tracking-tight">Identity</h1>
        <p className="text-[#BEE9E8]/70 text-base max-w-[280px] leading-relaxed">
          Verify your mobile number to access your protected income dashboard.
        </p>
      </motion.div>

      <motion.div variants={itemVariants} className="space-y-8 flex-1">
        <div className="bg-white rounded-[2rem] p-8 shadow-2xl shadow-black/20">
          <label className="block text-[11px] font-bold mb-4 text-[#1B4965]/40 uppercase tracking-[0.15em]">
            Registered Mobile Number
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
          
          <div className="mt-8 flex items-start gap-3 p-4 bg-[#BEE9E8]/10 rounded-xl border border-[#BEE9E8]/10">
            <ShieldCheck className="w-5 h-5 text-[#62B6CB] mt-0.5 shrink-0" />
            <p className="text-xs text-[#1B4965]/60 leading-normal">
              A secure 6-digit code will be sent to this number for multi-factor authentication.
            </p>
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
              Send OTP <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          )}
        </Button>
      </motion.div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────
   STEP 2 — OTP
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
      const res = await authService.verifyOtp(phone, code);
      onDone(res);
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
        <h1 className="text-3xl font-bold mb-3 text-white tracking-tight">Security Check</h1>
        <p className="text-[#BEE9E8]/70 text-base leading-relaxed">
          Sent a 6-digit verification code to <span className="text-white font-bold tracking-wider">+91 {phone}</span>
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
            onClick={() => authService.sendOtp(phone)}
            className="text-[#62B6CB] font-bold text-sm hover:text-[#5FA8D3] transition-colors flex items-center justify-center gap-1 mx-auto"
          >
            Didn't receive code? <span className="underline underline-offset-4">Resend</span>
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
            "Verify & Continue"
          )}
        </Button>
      </motion.div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────
   STEP 3 — MPIN
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
        const res = await authService.loginMpin(phone, next.join(""));
        onDone(res);
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
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="flex-1 flex flex-col items-center pt-4"
    >
      <motion.div variants={itemVariants} className="mb-12 text-center flex flex-col items-center">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 bg-white/10 ring-1 ring-white/20 shadow-inner">
          <Fingerprint className="w-7 h-7 text-white" strokeWidth={1.5} />
        </div>
        <h1 className="text-3xl font-bold mb-3 text-white tracking-tight">Access Key</h1>
        <p className="text-[#BEE9E8]/70 text-base">Authorize your login with 4-digit mPIN</p>
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
        className="text-[#BEE9E8]/60 font-bold text-sm mt-12 hover:text-white transition-colors"
      >
        Forgot Access Key? Use OTP
      </motion.button>
    </motion.div>
  );
}

/* ─────────────────────────────────────────
   Root — PhoneLogin
───────────────────────────────────────── */
export function PhoneLogin() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhoneLocal] = useState("");

  const handlePhoneDone = (p: string) => {
    setPhoneLocal(p);
    setStep("otp");
  };

  const handleOTPDone = (data: any) => {
    if (data.isRegistered && data.hasMpin) {
      setStep("mpin");
    } else {
      setAuth({ ...data, phone });
      navigate("/onboarding");
    }
  };

  const handleMPINDone = (data: any) => {
    setAuth({ ...data, phone });
    setStep("loading");
    setTimeout(() => navigate("/dashboard"), 1500);
  };

  const handleBack = () => {
    if (step === "phone") navigate("/");
    else if (step === "otp") setStep("phone");
    else if (step === "mpin") setStep("otp");
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
          {step === "mpin" && <MPINStep phone={phone} onDone={handleMPINDone} onForgot={() => setStep("otp")} />}
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
