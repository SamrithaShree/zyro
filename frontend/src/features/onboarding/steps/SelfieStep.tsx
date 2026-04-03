import { useState, useRef } from "react";
import { useOnboardingStore } from "../../../store/useOnboardingStore";
import { Button } from "../../../app/components/ui/button";
import { Camera, Loader2, CheckCircle2 } from "lucide-react";

export function SelfieStep() {
  const { data, updateData, nextStep } = useOnboardingStore();
  const [isCapturing, setIsCapturing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [confidence, setConfidence] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCapture = () => {
    // In a real app, this would open camera
    // For demo, we trigger file picker
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsProcessing(true);
      // Simulate AI analysis
      setTimeout(() => {
        setIsProcessing(false);
        setConfidence(98.4);
        updateData({ selfieUrl: URL.createObjectURL(file) });
      }, 2000);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[#1B4965] mb-2">Selfie Verification</h2>
        <p className="text-[#1B4965]/60">Required to match your face with Aadhaar.</p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-8">
        <div className="relative">
          <div className={`w-48 h-48 rounded-full border-4 ${confidence ? "border-green-500" : "border-[#62B6CB]"} bg-white overflow-hidden flex items-center justify-center relative shadow-xl`}>
            {data.selfieUrl ? (
              <img src={data.selfieUrl} className="w-full h-full object-cover" alt="Selfie" />
            ) : (
              <Camera className="w-16 h-16 text-[#62B6CB]/30" />
            )}
            
            {isProcessing && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center text-[#62B6CB]">
                 <Loader2 className="w-8 h-8 animate-spin mb-2" />
                 <span className="text-[10px] font-bold uppercase tracking-widest">Analyzing Face...</span>
              </div>
            )}
          </div>
          
          {confidence && (
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-green-500 text-white px-4 py-1.5 rounded-full text-xs font-black shadow-lg flex items-center gap-1.5 whitespace-nowrap">
              <CheckCircle2 className="w-3.5 h-3.5" />
              CONFIDENCE: {confidence}%
            </div>
          )}
        </div>

        {!confidence && !isProcessing && (
          <div className="text-center space-y-2">
            <p className="text-[#1B4965]/80 font-bold">Good lighting required</p>
            <p className="text-sm text-[#1B4965]/60">Ensure your eyes are visible and you're not wearing a hat or glasses.</p>
          </div>
        )}

        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*" 
          capture="user"
          onChange={handleFileChange}
        />
      </div>

      <div className="space-y-4 mt-8">
        {!confidence ? (
          <Button
            onClick={handleCapture}
            disabled={isProcessing}
            className="w-full h-16 rounded-2xl font-bold text-lg bg-[#62B6CB] text-white"
          >
            {isProcessing ? "Processing..." : "Open Camera"}
          </Button>
        ) : (
          <Button
            onClick={nextStep}
            className="w-full h-16 rounded-2xl font-bold text-lg bg-[#1B4965] text-white"
          >
            Continue
          </Button>
        )}
      </div>
    </div>
  );
}
