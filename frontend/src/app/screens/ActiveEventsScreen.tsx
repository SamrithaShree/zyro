import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { MobileContainer } from "../components/MobileContainer";
import { apiService } from "../../services/api";
import { BottomNav } from "../components/BottomNav";
import { Loader2, Zap, ChevronRight, MapPin, Calendar, Info } from "lucide-react";
import { motion } from "motion/react";

export function ActiveEventsScreen() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await apiService.events.getActive();
        if (res.data.status === "SUCCESS" || res.status === 200) {
          setEvents(res.data.data.events || []);
        }
      } catch (err) {
        console.error("Failed to fetch active events", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  if (loading) {
    return (
      <MobileContainer hasBottomNav style={{ backgroundColor: "#F4FBFB" }}>
        <div className="flex flex-col items-center justify-center min-h-screen">
          <Loader2 className="w-10 h-10 animate-spin text-[#62B6CB]" />
          <p className="mt-4 font-bold uppercase tracking-widest text-[10px] text-[#1B4965]/40">Checking for disruptions</p>
        </div>
        <BottomNav />
      </MobileContainer>
    );
  }

  return (
    <MobileContainer hasBottomNav style={{ backgroundColor: "#F4FBFB" }}>
      <div className="px-6 pt-10 pb-32 space-y-8">
        <header className="space-y-1">
          <span className="text-[10px] font-black text-[#62B6CB] uppercase tracking-[0.2em]">Live Monitoring</span>
          <h1 className="text-[28px] font-black text-[#1B4965] tracking-tight italic">Active Disruptions</h1>
        </header>

        {events.length > 0 ? (
          <div className="space-y-4">
            {events.map((event, i) => (
              <motion.div
                key={event.event_id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => navigate(`/events/${event.event_id}`)}
                className="bg-white rounded-[28px] p-6 border border-[#1B4965]/5 shadow-sm flex items-center justify-between group active:scale-[0.98] transition-all cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-500">
                    <Zap size={24} fill="currentColor" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-[#1B4965] uppercase tracking-tight">{event.trigger_type.replace(/_/g, ' ')}</h4>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#1B4965]/40">
                      <MapPin size={12} />
                      <span>{event.zone}</span>
                    </div>
                  </div>
                </div>
                <ChevronRight size={18} className="text-[#1B4965]/20 group-hover:text-[#62B6CB] transition-colors" />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center py-20 text-center space-y-4 opacity-40">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center text-green-500">
              <ShieldCheck size={40} />
            </div>
            <div className="space-y-1 px-10">
              <h3 className="text-lg font-black text-[#1B4965]">All Zones Clear</h3>
              <p className="text-xs font-bold text-[#1B4965]">No active parametric triggers detected across the grid.</p>
            </div>
          </div>
        )}

        <div className="bg-[#BEE9E8]/30 p-6 rounded-[28px] border border-[#62B6CB]/20 flex gap-4">
          <Info className="text-[#62B6CB] flex-shrink-0" size={20} />
          <p className="text-[11px] font-medium text-[#1B4965]/70 leading-relaxed">
            Events shown here are live environmental disruptions. Payouts are calculated automatically for protected users active in these zones.
          </p>
        </div>
      </div>
      <BottomNav />
    </MobileContainer>
  );
}

function ShieldCheck(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}
