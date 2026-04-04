import React, { useState, useEffect } from "react";
import { 
  Zap, 
  CloudRain, 
  Flame, 
  Wind, 
  Unplug, 
  Car,
  Loader2,
  CheckCircle2,
  ArrowLeft,
  ChevronRight,
  AlertTriangle,
  Check
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { apiService } from "../../services/api";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import "../../design-system/styles/atmosphere.css";

const TRIGGERS = [
  { id: "HEAVY_RAIN", label: "Heavy Rain", icon: <CloudRain />, color: "#62B6CB", desc: "Monsoon disruption simulation" },
  { id: "EXTREME_HEAT", label: "Extreme Heat", icon: <Flame />, color: "#FF6B35", desc: "45°C+ heatwave simulation" },
  { id: "SEVERE_AQI", label: "Severe AQI", icon: <Wind />, color: "#8E9AAF", desc: "Hazardous air quality alert" },
  { id: "PLATFORM_DOWNTIME", label: "System Outage", icon: <Unplug />, color: "#E07A5F", desc: "Global platform downtime" },
  { id: "TRAFFIC_DISRUPTION", label: "Traffic Lock", icon: <Car />, color: "#F2CC8F", desc: "City-wide traffic gridlock" },
];

export function SimulationScreen() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<string | null>(null);
  const [activeEvents, setActiveEvents] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);
  const [showDetection, setShowDetection] = useState<string | null>(null);

  const fetchActive = async () => {
    try {
      const res = await apiService.events.getActive();
      if (res.data && Array.isArray(res.data.events)) {
        setActiveEvents(res.data.events);
      }
    } catch (err) {
      console.error("Failed to fetch events", err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchActive();
    const timer = setInterval(fetchActive, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleTrigger = async (triggerId: string) => {
    setLoading(triggerId);
    try {
      await apiService.events.simulate({
        zone: "Anna Nagar",
        trigger_type: triggerId,
        severity: 1.2,
        source: "DEMO_PANEL",
        description: `Simulated ${triggerId} for testing end-to-end pipeline.`
      });
      setShowDetection(triggerId);
      setTimeout(() => {
        setShowDetection(null);
        navigate("/dashboard");
      }, 4000);
    } catch (err) {
      toast.error("Failed to simulate event");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="zyro-root font-sans">
      <div className="zyro-atmosphere" />
      
      <div className="zyro-container Independent-scroll pb-32">
        <div className="px-6 pt-12 pb-24 space-y-8 relative z-10">
          
          {/* Header */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-white text-[#1B4965] shadow-lg active:scale-95 transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-black text-[#1B4965] tracking-tight uppercase">Trigger Center</h1>
              <p className="text-[10px] font-bold text-[#62B6CB] uppercase tracking-widest">Parametric Simulation</p>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-white/40 backdrop-blur-md rounded-3xl p-6 shadow-sm border border-white/60">
             <div className="flex gap-4">
                <AlertTriangle className="w-6 h-6 text-[#FF6B35] shrink-0" />
                <p className="text-[12px] text-[#1B4965]/70 leading-relaxed font-semibold italic">
                  These controls manually inject environmental data into the WIVE Engine to demonstrate zero-touch claims.
                </p>
             </div>
          </div>

          {/* Trigger Grid */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-bold text-[#1B4965]/40 uppercase tracking-[0.2em] px-2">Manual Overrides</h3>
            {TRIGGERS.map((t) => (
              <motion.div
                key={t.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => !loading && handleTrigger(t.id)}
                className="bg-white/60 backdrop-blur-sm rounded-[24px] p-5 shadow-sm border border-white/60 flex items-center justify-between cursor-pointer group hover:bg-white/80 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center shadow-inner transition-transform group-hover:scale-110"
                    style={{ backgroundColor: `${t.color}15`, color: t.color }}
                  >
                    {React.cloneElement(t.icon as React.ReactElement, { size: 24 })}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#1B4965]">{t.label}</h4>
                    <p className="text-[10px] text-[#1B4965]/40 font-semibold uppercase tracking-tighter">{t.desc}</p>
                  </div>
                </div>
                <div>
                  {loading === t.id ? (
                    <Loader2 className="w-5 h-5 animate-spin text-[#62B6CB]" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-[#1B4965]/10 group-hover:text-[#62B6CB] group-hover:translate-x-1 transition-all" />
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Live Events List */}
          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-[10px] font-bold text-[#1B4965]/40 uppercase tracking-[0.2em]">Live Node Status</h3>
              {fetching && <Loader2 className="w-3 h-3 animate-spin text-[#62B6CB]" />}
            </div>
            
            <div className="space-y-3">
              {activeEvents.length > 0 ? (
                activeEvents.map((event) => (
                  <motion.div
                    key={event.event_id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/40 rounded-2xl p-4 border border-white/60 shadow-sm flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-[#00FF87] animate-pulse shadow-[0_0_10px_rgba(0,255,135,0.5)]" />
                      <div>
                        <div className="text-[11px] font-bold text-[#1B4965] uppercase">{event.trigger_type}</div>
                        <div className="text-[9px] text-[#1B4965]/40 font-bold uppercase tracking-widest">{event.zone}</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-[#1B4965]/20 uppercase">{new Date(event.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-10 bg-white/20 rounded-[32px] border-2 border-dashed border-white/40">
                  <p className="text-[10px] font-bold text-[#1B4965]/30 uppercase tracking-[0.2em]">All Systems Nominal</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Detection Overlay */}
      <AnimatePresence>
        {showDetection && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-[#1B4965] flex flex-col items-center justify-center p-8 text-center"
          >
             <motion.div
               initial={{ scale: 0.8, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               transition={{ delay: 0.2 }}
               className="w-full max-w-xs space-y-12"
             >
                <div className="relative flex justify-center">
                   <div className="w-32 h-32 rounded-[40px] bg-white/10 flex items-center justify-center relative">
                      <Zap className="w-16 h-16 text-[#62B6CB] fill-[#62B6CB]" />
                      <motion.div 
                        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute inset-0 rounded-[40px] border-4 border-[#62B6CB]"
                      />
                   </div>
                </div>

                <div className="space-y-4">
                   <h2 className="text-3xl font-black text-white italic uppercase tracking-tight">Disruption <br/>Detected</h2>
                   <div className="flex flex-col items-center gap-2">
                      <div className="px-4 py-1.5 bg-[#62B6CB]/20 rounded-full border border-[#62B6CB]/30">
                         <span className="text-[#62B6CB] text-[10px] font-black uppercase tracking-[0.3em]">{showDetection}</span>
                      </div>
                      <p className="text-white/40 text-sm font-medium italic">WIVE AI initializing validation...</p>
                   </div>
                </div>

                <div className="space-y-4 w-full">
                   <ValidationRow label="Environmental Node Match" status="complete" delay={0.5} />
                   <ValidationRow label="Operating Zone Verification" status="complete" delay={1.2} />
                   <ValidationRow label="Worker Intent Capture" status="loading" delay={2.0} />
                </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ValidationRow({ label, status, delay }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className="flex items-center justify-between w-full bg-white/5 p-4 rounded-2xl border border-white/5"
    >
       <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">{label}</span>
       {status === 'complete' ? (
         <Check className="w-4 h-4 text-[#00FF87]" strokeWidth={3} />
       ) : (
         <Loader2 className="w-4 h-4 text-[#62B6CB] animate-spin" />
       )}
    </motion.div>
  );
}
