import { useState } from "react";
import { useOnboardingStore } from "../../../store/useOnboardingStore";
import { useAuthStore } from "../../../store/useAuthStore";
import { Button } from "../../../app/components/ui/button";
import { authService } from "../../../services/authService";
import { Loader2, Delete } from "lucide-react";
import { motion } from "motion/react";

const KEYPAD = [["1", "2", "3"], ["4", "5", "6"], ["7", "8", "9"], ["", "0", "⌫"]];

export function MPinSetupStep() {
  const { nextStep } = useOnboardingStore();
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
      await authService.setMpin(mpin);
      setAuth({
        token: auth.token!,
        isRegistered: auth.isRegistered,
        hasMpin: true,
        workerId: auth.workerId
      });
      nextStep();
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
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-bold text-[#1B4965] mb-2">
          {isConfirming ? "Confirm mPIN" : "Create mPIN"}
        </h2>
        <p className="text-[#1B4965]/60">Secure your account with 4 digits.</p>
      </div>

      <motion.div
        className="flex gap-5 mb-12"
        animate={shaking ? { x: [0, -10, 10, -10, 10, 0] } : {}}
      >
        {Array.from({ length: 4 }, (_, i) => (
          <div
            key={i}
            className={`w-4 h-4 rounded-full transition-all duration-200 ${
              i < current.length ? "bg-[#62B6CB] scale-125" : "bg-[#1B4965]/10"
            }`}
          />
        ))}
      </motion.div>

      <div className="w-full max-w-xs grid grid-cols-3 gap-4 mb-10">
        {KEYPAD.flat().map((key, i) => (
          <motion.button
            key={i}
            onClick={() => key && !loading && handleKey(key)}
            disabled={!key || loading}
            whileTap={{ scale: 0.9 }}
            className={`h-16 rounded-2xl font-bold text-2xl flex items-center justify-center transition-colors ${
              !key ? "opacity-0" : "bg-white text-[#1B4965] shadow-sm border-2 border-[#1B4965]/5"
            }`}
          >
            {key === "⌫" ? <Delete className="w-6 h-6" /> : key}
          </motion.button>
        ))}
      </div>

      {loading && <Loader2 className="w-8 h-8 animate-spin text-[#62B6CB]" />}
    </div>
  );
}
