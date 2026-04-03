import { useState } from "react";
import { useOnboardingStore } from "../../../store/useOnboardingStore";
import { Button } from "../../../app/components/ui/button";
import { MapPin, Loader2, Navigation } from "lucide-react";
import { apiService } from "../../../services/api";

export function LocationStep() {
  const { data, updateData, syncWithBackend } = useOnboardingStore();
  const [isDetecting, setIsDetecting] = useState(false);
  const [loading, setLoading] = useState(false);

  const detectLocation = () => {
    setIsDetecting(true);
    // Simulate real GPS with a 1.5s delay
    setTimeout(() => {
      updateData({ 
        lat: 13.0827, 
        lng: 80.2707,
        city: "Chennai",
        zone: "Anna Nagar" 
      });
      setIsDetecting(false);
    }, 1500);
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await apiService.worker.captureLocation({
        lat: data.lat,
        lng: data.lng,
        city: data.city,
        zone: data.zone
      });
      await syncWithBackend();
    } catch (err) {
      // Handled by interceptor
    } finally {
      setLoading(false);
    }
  };

  const isComplete = !!data.lat && !!data.zone;

  return (
    <div className="flex-1 flex flex-col">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[#1B4965] mb-2">Operating Zone</h2>
        <p className="text-[#1B4965]/60">We use this to verify parametric triggers.</p>
      </div>

      <div className="flex-1 flex flex-col justify-center gap-10">
        <div className="relative flex justify-center">
           <div className="w-32 h-32 rounded-full bg-white shadow-xl flex items-center justify-center border-4 border-[#62B6CB]/20">
              <MapPin className={`w-12 h-12 text-[#62B6CB] ${isDetecting ? "animate-bounce" : ""}`} />
           </div>
           {isDetecting && (
             <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-48 rounded-full border-2 border-[#62B6CB] animate-ping opacity-20" />
             </div>
           )}
        </div>

        {isComplete ? (
          <div className="bg-white rounded-3xl p-6 border-2 border-[#62B6CB] shadow-lg text-center space-y-4">
             <div className="space-y-1">
                <span className="text-[10px] font-black text-[#62B6CB] uppercase tracking-[0.2em]">DETECTED LOCATION</span>
                <h3 className="text-2xl font-black text-[#1B4965]">{data.zone}, {data.city}</h3>
             </div>
             <p className="text-xs text-[#1B4965]/60 px-6 leading-relaxed">
               Coordinates: {data.lat?.toFixed(4)}, {data.lng?.toFixed(4)}
             </p>
             <button onClick={detectLocation} className="text-[#62B6CB] text-sm font-bold flex items-center justify-center gap-1.5 w-full pt-2">
                <Navigation className="w-4 h-4" />
                Refresh GPS
             </button>
          </div>
        ) : (
          <div className="text-center space-y-4">
             <p className="text-[#1B4965]/80 font-bold">Waiting for GPS signal...</p>
             <p className="text-sm text-[#1B4965]/60">Tap below to detect your primary working zone.</p>
          </div>
        )}
      </div>

      <div className="space-y-4 mt-8">
        {!isComplete ? (
          <Button
            onClick={detectLocation}
            disabled={isDetecting}
            className="w-full h-16 rounded-2xl font-bold text-lg bg-[#62B6CB] text-white"
          >
            {isDetecting ? "Detecting..." : "Detect Location"}
          </Button>
        ) : (
          <Button
            onClick={handleConfirm}
            disabled={loading}
            className="w-full h-16 rounded-2xl font-bold text-lg bg-[#1B4965] text-white"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Confirm Zone"}
          </Button>
        )}
      </div>
    </div>
  );
}
