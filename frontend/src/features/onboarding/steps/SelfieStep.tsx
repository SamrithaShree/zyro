import { useState, useEffect } from "react";
import { useOnboardingStore } from "../../../store/useOnboardingStore";
import { Button } from "../../../app/components/ui/button";
import { Camera, Loader2, CheckCircle2, Scan, Sparkles, ShieldCheck } from "lucide-react";
import { apiService } from "../../../services/api";
import { motion, AnimatePresence } from "motion/react";

export function SelfieStep() {
  const { data, updateData, syncWithBackend } = useOnboardingStore();
  const [isScanning, setIsScanning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [confidence, setConfidence] = useState<number | null>(null);

  const handleCapture = () => {
    setIsScanning(true);
    
    // Simulate "Camera UI" scanning for 2.5 seconds
    setTimeout(async () => {
      setIsScanning(false);
      setIsProcessing(true);
      
      try {
        // Hit backend for verification
        await apiService.auth.verifySelfie("mock_payload");
        
        // Finalize processing
        setTimeout(() => {
          setIsProcessing(false);
          setConfidence(98.4);
          // Set a mock selfie URL for UI display
          updateData({ selfieUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Arjun&backgroundColor=b6e3f4" });
        }, 1500);
      } catch (err) {
        setIsProcessing(false);
      }
    }, 2500);
  };

  const handleContinue = async () => {
    await syncWithBackend();
  };

  return (
    <div className="flex-1 flex flex-col">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[#1B4965] mb-2">Selfie Verification</h2>
        <p className="text-[#1B4965]/60">Match your face with your Aadhaar records.</p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-8">
        <div className="relative">
          {/* Main Frame */}
          <div className={`w-56 h-56 rounded-full border-4 ${confidence ? "border-green-500" : "border-[#62B6CB]"} bg-white overflow-hidden flex items-center justify-center relative shadow-2xl transition-all duration-500`}>
            
            <AnimatePresence mode="wait">
              {isScanning ? (
                <motion.div 
                  key="scanning"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex flex-col items-center justify-center bg-[#1B4965]/10"
                >
                   {/* Scanning Line Animation */}
                   <motion.div 
                    animate={{ top: ["0%", "100%", "0%"] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="absolute left-0 right-0 h-1 bg-[#62B6CB] shadow-[0_0_15px_#62B6CB] z-20"
                   />
                   <Scan className="w-16 h-16 text-[#62B6CB] animate-pulse" />
                   <span className="text-[10px] font-black text-[#1B4965] mt-4 tracking-[0.2em] uppercase">Aligning...</span>
                </motion.div>
              ) : isProcessing ? (
                <motion.div 
                  key="processing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 bg-white/90 backdrop-blur-md flex flex-col items-center justify-center text-[#62B6CB]"
                >
                   <Loader2 className="w-10 h-10 animate-spin mb-3" />
                   <span className="text-[10px] font-black uppercase tracking-widest text-[#1B4965]">Analyzing Biometrics</span>
                </motion.div>
              ) : data.selfieUrl ? (
                <motion.img 
                  key="result"
                  initial={{ scale: 1.2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  src={data.selfieUrl} 
                  className="w-full h-full object-cover" 
                  alt="Selfie" 
                />
              ) : (
                <motion.div key="idle" className="flex flex-col items-center text-[#62B6CB]/30">
                  <Camera className="w-20 h-16 mb-2" />
                  <span className="text-[9px] font-bold uppercase tracking-widest">Front Camera</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* Floating Confidence Badge */}
          {confidence && (
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-green-500 text-white px-5 py-2 rounded-full text-xs font-black shadow-xl flex items-center gap-2 whitespace-nowrap"
            >
              <Sparkles className="w-3.5 h-3.5" />
              MATCH: {confidence}%
            </motion.div>
          )}
        </div>

        {!confidence && !isScanning && !isProcessing && (
          <div className="text-center space-y-3 px-4">
            <div className="bg-white/50 py-2 px-4 rounded-full inline-flex items-center gap-2 border border-[#1B4965]/5">
               <ShieldCheck className="w-4 h-4 text-[#62B6CB]" />
               <span className="text-xs font-bold text-[#1B4965]/80 uppercase tracking-tighter">Secure Biometric Scan</span>
            </div>
            <p className="text-sm text-[#1B4965]/60 leading-relaxed font-medium">Position your face in the circle. <br/>We'll auto-capture when ready.</p>
          </div>
        )}
      </div>

      <div className="space-y-4 mt-8">
        {!confidence ? (
          <Button
            onClick={handleCapture}
            disabled={isScanning || isProcessing}
            className="w-full h-16 rounded-2xl font-black text-lg bg-[#62B6CB] text-white shadow-xl shadow-[#62B6CB]/20 transition-all active:scale-95"
          >
            {isScanning ? "Capturing..." : isProcessing ? "Verifying..." : "Start Face Scan"}
          </Button>
        ) : (
          <Button
            onClick={handleContinue}
            className="w-full h-16 rounded-2xl font-black text-lg bg-[#1B4965] text-white shadow-xl"
          >
            Continue
          </Button>
        )}
      </div>
    </div>
  );
}
