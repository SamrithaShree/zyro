import React, { useState, useEffect } from "react";
import { useOnboardingStore } from "../../../store/useOnboardingStore";
import { StickyCTA } from "../../../design-system/layouts/StickyCTA";
import { Button } from "../../../design-system/components/Button";
import { Skeleton } from "../../../design-system/components/Skeleton";
import { apiService } from "../../../services/api";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";

type LocationState = "detecting" | "success" | "manual";

const CITIES = ["Bengaluru", "Mumbai", "Delhi", "Chennai", "Hyderabad"];
const ZONES = {
  "Bengaluru": ["Koramangala", "Indiranagar", "HSR Layout", "Whitefield", "Jayanagar"],
  "Mumbai": ["Andheri", "Bandra", "Powai", "Worli", "Dadar"],
  "Delhi": ["Connaught Place", "South Ex", "Rohini", "Dwarka", "Janakpuri"],
  "Chennai": ["Adyar", "T. Nagar", "Velachery", "Anna Nagar", "Mylapore"],
  "Hyderabad": ["Banjara Hills", "Jubilee Hills", "Gachibowli", "HITEC City", "Kukatpally"]
};

export function LocationStep() {
  const { data, updateData, nextStep, syncWithBackend } = useOnboardingStore();
  const [state, setState] = useState<LocationState>("detecting");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    detectLocation();
  }, []);

  const detectLocation = () => {
    setState("detecting");
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported. Please select manually.");
      setState("manual");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        // Mocking area detection from coordinates
        setTimeout(() => {
          updateData({
            lat: latitude,
            lng: longitude,
            city: "Bengaluru",
            zone: "Koramangala"
          });
          setState("success");
        }, 2000);
      },
      (error) => {
        toast.error("Permission denied or detection failed.");
        setState("manual");
      }
    );
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
      nextStep();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save location");
    } finally {
      setLoading(false);
    }
  };

  const focusClass = "focus:ring-2 focus:ring-[#62B6CB] focus:ring-offset-2 outline-none transition-all";

  return (
    <div className="space-y-8">
      <AnimatePresence mode="wait">
        {state === "detecting" && (
          <motion.div
            key="detecting"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            <div className="w-full h-48 bg-[#E8F4F4] rounded-[32px] overflow-hidden relative flex items-center justify-center">
              <div className="absolute inset-0 bg-[#62B6CB]/5 animate-pulse" />
              <div className="relative flex flex-col items-center gap-4">
                <div className="w-12 h-12 rounded-full border-4 border-[#62B6CB] border-t-transparent animate-spin" />
                <span className="text-[14px] font-bold text-[#1B4965]/40 uppercase tracking-widest">Detecting GPS...</span>
              </div>
            </div>
            <div className="space-y-3 px-2">
              <Skeleton width="60%" height={20} />
              <Skeleton width="100%" height={16} />
              <Skeleton width="80%" height={16} />
            </div>
          </motion.div>
        )}

        {state === "success" && (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Map Preview Placeholder */}
            <div className="w-full h-48 bg-[#62B6CB]/10 rounded-[32px] overflow-hidden relative border-2 border-[#62B6CB]/20">
              {/* Fake Map UI */}
              <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#1B4965 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="relative">
                  <div className="w-12 h-12 bg-[#62B6CB]/30 rounded-full animate-ping absolute -top-3 -left-3" />
                  <div className="w-6 h-6 bg-[#62B6CB] rounded-full border-4 border-white shadow-lg relative z-10" />
                </div>
              </div>
              <div className="absolute bottom-4 left-4 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-bold text-[#1B4965] border border-white">
                Live GPS Active
              </div>
            </div>

            <div className="bg-[#F4FBFB] p-6 rounded-[28px] shadow-[0_4px_20px_rgba(27,73,101,0.08)] space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#62B6CB]/10 flex items-center justify-center text-[#62B6CB]">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                </div>
                <div className="flex-1">
                  <div className="text-[12px] font-bold text-[#1B4965]/40 uppercase tracking-widest">Detected Area</div>
                  <div className="text-[18px] font-bold text-[#1B4965]">{data.zone}, {data.city}</div>
                </div>
              </div>
              <button 
                onClick={() => setState("manual")}
                className="w-full py-3 text-[#62B6CB] font-bold text-sm border-2 border-[#62B6CB]/10 rounded-2xl hover:bg-[#62B6CB]/5 transition-colors"
              >
                Not your zone? Change manually
              </button>
            </div>
          </motion.div>
        )}

        {state === "manual" && (
          <motion.div
            key="manual"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="space-y-4">
              <div className="space-y-2 px-1">
                <label className="text-[12px] font-bold uppercase tracking-widest text-[#1B4965]/40">City</label>
                <div className="relative">
                  <select 
                    value={data.city || ""}
                    onChange={(e) => updateData({ city: e.target.value, zone: "" })}
                    className={`w-full h-16 px-6 bg-[#F4FBFB] rounded-[24px] text-[18px] font-bold text-[#1B4965] appearance-none shadow-[0_4px_20px_rgba(27,73,101,0.08)] ${focusClass}`}
                  >
                    <option value="">Select City</option>
                    {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-[#1B4965]/40">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                  </div>
                </div>
              </div>

              <div className="space-y-2 px-1">
                <label className="text-[12px] font-bold uppercase tracking-widest text-[#1B4965]/40">Working Zone</label>
                <div className="relative">
                  <select 
                    value={data.zone || ""}
                    disabled={!data.city}
                    onChange={(e) => updateData({ zone: e.target.value })}
                    className={`w-full h-16 px-6 bg-[#F4FBFB] rounded-[24px] text-[18px] font-bold text-[#1B4965] appearance-none shadow-[0_4px_20px_rgba(27,73,101,0.08)] ${!data.city ? 'opacity-50' : ''} ${focusClass}`}
                  >
                    <option value="">Select Zone</option>
                    {data.city && (ZONES[data.city as keyof typeof ZONES] || []).map(z => <option key={z} value={z}>{z}</option>)}
                  </select>
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-[#1B4965]/40">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                  </div>
                </div>
              </div>
            </div>

            <button 
              onClick={detectLocation}
              className="flex items-center justify-center gap-2 w-full py-3 text-[#62B6CB] font-bold text-sm"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
              Try auto-detection again
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <StickyCTA>
        <Button 
          onClick={handleConfirm} 
          disabled={!data.city || !data.zone || loading || state === 'detecting'}
        >
          {loading ? <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" /> : "Confirm Zone"}
        </Button>
      </StickyCTA>
    </div>
  );
}
