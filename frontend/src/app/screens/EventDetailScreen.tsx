import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { MobileContainer } from "../components/MobileContainer";
import { apiService } from "../../services/api";
import { Loader2, ArrowLeft, Zap, MapPin, Clock, Info, ShieldCheck, Activity } from "lucide-react";
import { motion } from "motion/react";

export function EventDetailScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) return;
      try {
        const res = await apiService.events.getById(id);
        if (res.data.status === "SUCCESS" || res.status === 200) {
          setEvent(res.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch event detail", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  if (loading) {
    return (
      <MobileContainer style={{ backgroundColor: "#F4FBFB" }}>
        <div className="flex flex-col items-center justify-center min-h-screen">
          <Loader2 className="w-10 h-10 animate-spin text-[#62B6CB]" />
        </div>
      </MobileContainer>
    );
  }

  if (!event) {
    return (
      <MobileContainer style={{ backgroundColor: "#F4FBFB" }}>
        <div className="px-6 pt-10 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
            <ArrowLeft size={20} className="text-[#1B4965]" />
          </button>
          <h1 className="text-xl font-black text-[#1B4965]">Disruption Not Found</h1>
        </div>
      </MobileContainer>
    );
  }

  return (
    <MobileContainer style={{ backgroundColor: "#F4FBFB" }}>
      <div className="px-6 pt-10 pb-20 space-y-8 overflow-y-auto max-h-screen">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm text-[#1B4965] active:scale-95 transition-all">
            <ArrowLeft size={20} />
          </button>
          <div className="space-y-0.5">
            <span className="text-[10px] font-black text-[#62B6CB] uppercase tracking-[0.2em]">Disruption Detail</span>
            <h1 className="text-xl font-black text-[#1B4965] uppercase tracking-tight">{event.trigger_type.replace(/_/g, ' ')}</h1>
          </div>
        </div>

        {/* Status Hero */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#1B4965] rounded-[32px] p-8 text-white relative overflow-hidden shadow-2xl"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#62B6CB]/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
          
          <div className="relative z-10 space-y-6">
            <div className="flex justify-between items-center">
              <div className="px-3 py-1 bg-[#62B6CB] text-white text-[10px] font-black rounded-full uppercase tracking-widest">
                {event.status}
              </div>
              <Zap className="text-[#62B6CB]" size={32} fill="currentColor" />
            </div>

            <div className="space-y-1">
              <div className="text-4xl font-black italic tracking-tighter">{event.severity}x</div>
              <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Impact Intensity</div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-[#62B6CB]" />
                <span className="text-xs font-bold">{event.zone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-[#62B6CB]" />
                <span className="text-xs font-bold">{new Date(event.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Description & Metadata */}
        <div className="bg-white rounded-[32px] p-8 shadow-sm border border-[#1B4965]/5 space-y-6">
          <div className="space-y-2">
            <h3 className="text-[10px] font-black text-[#1B4965]/40 uppercase tracking-[0.2em]">Disruption Report</h3>
            <p className="text-sm font-medium text-[#1B4965] leading-relaxed">
              {event.description || `A verified ${event.trigger_type.toLowerCase().replace(/_/g, ' ')} event is currently affecting the ${event.zone} zone.`}
            </p>
          </div>

          <div className="space-y-4 pt-4 border-t border-[#1B4965]/5">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-[#1B4965]/40">Source</span>
              <span className="text-xs font-black text-[#1B4965] uppercase">{event.source}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-[#1B4965]/40">ID</span>
              <span className="text-xs font-mono font-bold text-[#1B4965]/60 uppercase">{event.event_id}</span>
            </div>
          </div>
        </div>

        {/* Coverage Note */}
        <div className="bg-[#BEE9E8]/30 p-6 rounded-[28px] border border-[#62B6CB]/20 space-y-3">
          <div className="flex items-center gap-3">
            <ShieldCheck size={20} className="text-[#62B6CB]" />
            <h4 className="text-xs font-black text-[#1B4965] uppercase tracking-wider">Protected Response</h4>
          </div>
          <p className="text-[11px] font-medium text-[#1B4965]/70 leading-relaxed">
            Our system has automatically detected your presence in this zone. Payout eligibility is being calculated based on your specific shift overlap.
          </p>
        </div>

      </div>
    </MobileContainer>
  );
}
