import { useState } from "react";
import { useOnboardingStore } from "../../../store/useOnboardingStore";
import { Button } from "../../../app/components/ui/button";
import { Input } from "../../../app/components/ui/input";
import { ShieldCheck, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export function AadhaarStep() {
  const { data, updateData, nextStep } = useOnboardingStore();
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [otp, setOtp] = useState("");
  const [showOtp, setShowOtp] = useState(false);

  const handleVerify = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setShowOtp(true);
    }, 1500);
  };

  const handleOtpSubmit = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setIsVerified(true);
      setTimeout(nextStep, 1000);
    }, 1500);
  };

  const isComplete = data.aadhaarNumber.length === 12;

  return (
    <div className="flex-1 flex flex-col">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[#1B4965] mb-2">ID Verification</h2>
        <p className="text-[#1B4965]/60">Secure verification via DigiLocker.</p>
      </div>

      <div className="space-y-6 flex-1">
        <div className="relative">
          <label className="block text-sm font-semibold mb-2 text-[#1B4965]/80 uppercase tracking-wider">Aadhaar Number</label>
          <Input 
            placeholder="0000 0000 0000"
            value={data.aadhaarNumber}
            onChange={(e) => updateData({ aadhaarNumber: e.target.value.replace(/\D/g, "").slice(0, 12) })}
            disabled={showOtp || isVerified}
            className="h-14 bg-white border-2 border-[#1B4965]/5 rounded-2xl text-lg font-bold tracking-[0.2em] shadow-sm"
            maxLength={12}
          />
          {isVerified && (
            <ShieldCheck className="absolute right-4 top-10 w-6 h-6 text-green-500" />
          )}
        </div>

        <AnimatePresence>
          {showOtp && !isVerified && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="space-y-4 pt-4"
            >
              <label className="block text-sm font-semibold mb-2 text-[#1B4965]/80 uppercase tracking-wider text-center">Enter OTP sent to Aadhaar-linked mobile</label>
              <Input 
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className="h-14 bg-white border-2 border-[#1B4965]/5 rounded-2xl text-center text-xl font-bold tracking-[0.5em] shadow-sm"
                maxLength={6}
              />
              <Button
                onClick={handleOtpSubmit}
                disabled={otp.length !== 6 || isVerifying}
                className="w-full h-14 rounded-2xl font-bold bg-[#1B4965] text-white"
              >
                {isVerifying ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify OTP"}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {!showOtp && (
          <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-start gap-3">
             <ShieldCheck className="w-5 h-5 text-blue-500 shrink-0" />
             <p className="text-xs text-blue-800 leading-relaxed">
               Zyro uses government-approved DigiLocker protocols. Your full Aadhaar number is never stored on our servers.
             </p>
          </div>
        )}
      </div>

      {!showOtp && (
        <Button
          onClick={handleVerify}
          disabled={!isComplete || isVerifying}
          className="w-full h-16 rounded-2xl font-bold text-lg bg-[#62B6CB] text-white mt-8"
        >
          {isVerifying ? <Loader2 className="w-6 h-6 animate-spin" /> : "Verify with Aadhaar"}
        </Button>
      )}

      {isVerified && (
        <div className="flex items-center justify-center gap-2 text-green-600 font-bold py-4">
           <ShieldCheck className="w-6 h-6" />
           Verified Successfully
        </div>
      )}
    </div>
  );
}
