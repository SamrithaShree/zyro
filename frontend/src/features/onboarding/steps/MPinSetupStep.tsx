import { useState } from "react";
import { useOnboardingStore } from "../../../store/useOnboardingStore";
import { useAuthStore } from "../../../store/useAuthStore";
import { Button } from "../../../app/components/ui/button";
import { apiService } from "../../../services/api";
import { Loader2, Delete, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const KEYPAD = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "⌫"];

export function MPinSetupStep() {
  const { syncWithBackend } = useOnboardingStore();
  const setAuth = useAuthStore((s) => s.setAuth);
  const auth = useAuthStore();
  
  const [pin, setPin] = useState<string[]>([]);
  const [confirmPin, setConfirmPin] = useState<string[]>([]);
  const [isConfirming, setIsConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shaking, setShaking] = useState(false);

  const handleKey = async (key: string) => {
    if (key === "⌫") {
      if (isConfirming) setConfirmPin(p => p.slice(0, -1));
      else setPin(p => p.slice(0, -1));
      return;
    }
    
    const current = isConfirming ? confirmPin : pin;
    if (current.length >= 4) return;
    
    const next = [...current, key];
    if (isConfirming) setConfirmPin(next);
    else setPin(next);

    if (next.length === 4) {
      if (!isConfirming) {
        setTimeout(() => setIsConfirming(true), 300);
      } else {
        if (next.join("") === pin.join("")) {
          submit(next.join(""));
        } else {
          setShaking(true);
          setTimeout(() => setShaking(false), 500);
          setConfirmPin([]);
        }
      }
    }
  };

  const submit = async (mpin: string) => {
    setLoading(true);
    try {
      await apiService.auth.setMpin(mpin);
      setAuth({
        token: auth.token!,
        is_registered: auth.isRegistered,
        has_mpin: true,
        worker_id: auth.workerId
      });
      await syncWithBackend();
    } catch {
       setConfirmPin([]);
       setIsConfirming(false);
       setPin([]);
    } finally {
       setLoading(false);
    }
  };

  const current = isConfirming ? confirmPin : pin;

  return (
    <div className="flex-1 flex flex-col items-center">
      <div className="mb-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#BEE9E8] flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-[#BEE9E8]/20">
           <ShieldCheck className="w-8 h-8 text-[#1B4965]" />
        </div>
        <h2 className="text-3xl font-black text-white mb-2 italic tracking-tight">
          {isConfirming ? "Confirm PIN" : "Security PIN"}
        </h2>
        <p className="text-white/40 text-sm font-medium max-w-[240px] mx-auto">
          {isConfirming ? "Enter the PIN again to confirm." : "Create a 4-digit PIN to secure your Zyro account."}
        </p>
      </div>

      <motion.div
        className="flex gap-6 mb-16 h-8 items-center"
        animate={shaking ? { x: [0, -10, 10, -10, 10, 0] } : {}}
      >
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="relative">
            <motion.div
              initial={false}
              animate={{ 
                scale: i < current.length ? 1.2 : 1,
                backgroundColor: i < current.length ? "#BEE9E8" : "rgba(255,255,255,0.1)"
              }}
              className={`w-5 h-5 rounded-full transition-all duration-200 ${
                i < current.length ? "shadow-[0_0_20px_rgba(190,233,232,0.6)]" : ""
              }`}
            />
          </div>
        ))}
      </motion.div>

      <div className="w-full max-w-xs grid grid-cols-3 gap-4 mb-10">
        {KEYPAD.map((key, i) => (
          <motion.button
            key={i}
            onClick={() => key && !loading && handleKey(key)}
            disabled={!key || loading}
            whileTap={{ scale: 0.92 }}
            className={`h-20 rounded-[24px] font-black text-2xl flex items-center justify-center transition-all ${
              !key ? "opacity-0 pointer-events-none" : "bg-white/5 text-white hover:bg-white/10 active:bg-white/20 border-2 border-white/5"
            } italic`}
          >
            {key === "⌫" ? <Delete className="w-7 h-7 text-[#62B6CB]" /> : key}
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {loading && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-3 text-[#62B6CB] font-black italic tracking-tighter"
          >
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>SECURING ACCOUNT...</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
