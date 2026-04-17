import React, { useState, useEffect } from "react";
import { MobileContainer } from "../components/MobileContainer";
import { apiService } from "../../services/api";
import { Button } from "../../design-system/components/Button";
import { toast } from "sonner";
import { Loader2, TrendingUp, AlertTriangle, ShieldCheck, Activity } from "lucide-react";
import { motion } from "motion/react";

export function AdminScreen() {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);

  // Form state for simulation
  const [zone, setZone] = useState("Anna Nagar");
  const [triggerType, setTriggerType] = useState("HEAVY_RAIN");
  const [severity, setSeverity] = useState(1.2);

  const fetchSummary = async () => {
    try {
      const res = await apiService.claims.getSummary();
      if (res.data.status === "SUCCESS") {
        setSummary(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch summary", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const handleSimulate = async () => {
    setSimulating(true);
    try {
      const res = await apiService.events.simulate({
        zone,
        trigger_type: triggerType,
        severity,
        source: "ADMIN_CONSOLE",
        description: `Simulated ${triggerType} in ${zone}`
      });
      if (res.data.status === "SUCCESS" || res.status === 200) {
        toast.success("Disruption event simulated successfully!");
        fetchSummary(); // Refresh stats
      }
    } catch (err) {
      toast.error("Simulation failed");
    } finally {
      setSimulating(false);
    }
  };

  if (loading) {
    return (
      <MobileContainer style={{ backgroundColor: "#1B4965" }}>
        <div className="flex flex-col items-center justify-center min-h-screen text-white">
          <Loader2 className="w-10 h-10 animate-spin text-[#62B6CB]" />
          <p className="mt-4 font-bold uppercase tracking-widest text-[10px]">Loading Admin Console</p>
        </div>
      </MobileContainer>
    );
  }

  return (
    <MobileContainer style={{ backgroundColor: "#F4FBFB" }}>
      <div className="px-6 pt-10 pb-20 space-y-8">
        <header className="space-y-1">
          <span className="text-[10px] font-black text-[#62B6CB] uppercase tracking-[0.2em]">System Control</span>
          <h1 className="text-[28px] font-black text-[#1B4965] tracking-tight italic">Admin Panel</h1>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-[24px] shadow-sm border border-[#1B4965]/5">
            <TrendingUp size={20} className="text-[#62B6CB] mb-2" />
            <div className="text-[10px] font-black text-[#1B4965]/40 uppercase">Total Claims</div>
            <div className="text-2xl font-black text-[#1B4965]">{summary?.total_claims || 0}</div>
          </div>
          <div className="bg-white p-5 rounded-[24px] shadow-sm border border-[#1B4965]/5">
            <ShieldCheck size={20} className="text-green-500 mb-2" />
            <div className="text-[10px] font-black text-[#1B4965]/40 uppercase">Total Payouts</div>
            <div className="text-2xl font-black text-[#1B4965]">₹{summary?.total_payout || 0}</div>
          </div>
          <div className="col-span-2 bg-white p-5 rounded-[24px] shadow-sm border border-[#1B4965]/5">
            <Activity size={20} className="text-orange-500 mb-2" />
            <div className="text-[10px] font-black text-[#1B4965]/40 uppercase">Pending Review</div>
            <div className="text-2xl font-black text-[#1B4965]">{summary?.pending_review || 0}</div>
          </div>
        </div>

        {/* Simulation Controls */}
        <section className="bg-[#1B4965] rounded-[32px] p-8 text-white space-y-6 shadow-xl">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-[#62B6CB]" />
            <h2 className="text-xl font-black italic tracking-tight">Simulate Disruption</h2>
          </div>

          <div className="space-y-4 text-white/80">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-wider ml-1">Zone</label>
              <select 
                value={zone}
                onChange={(e) => setZone(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#62B6CB]"
              >
                <option value="Anna Nagar">Anna Nagar</option>
                <option value="T Nagar">T Nagar</option>
                <option value="Adyar">Adyar</option>
                <option value="Velachery">Velachery</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-wider ml-1">Trigger Type</label>
              <select 
                value={triggerType}
                onChange={(e) => setTriggerType(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#62B6CB]"
              >
                <option value="HEAVY_RAIN">Heavy Rain</option>
                <option value="EXTREME_HEAT">Extreme Heat</option>
                <option value="SEVERE_AQI">Severe AQI</option>
                <option value="TRAFFIC_DISRUPTION">Traffic Disruption</option>
                <option value="PLATFORM_DOWNTIME">Platform Downtime</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-wider ml-1 text-white/40">Severity Multiplier ({severity}x)</label>
              <input 
                type="range"
                min="1.0"
                max="2.0"
                step="0.1"
                value={severity}
                onChange={(e) => setSeverity(parseFloat(e.target.value))}
                className="w-full accent-[#62B6CB]"
              />
            </div>
          </div>

          <Button 
            onClick={handleSimulate} 
            disabled={simulating}
            className="w-full h-14 rounded-2xl bg-[#62B6CB] text-white font-black text-sm uppercase tracking-widest shadow-lg active:scale-[0.98] transition-all"
          >
            {simulating ? <Loader2 className="animate-spin" /> : "Trigger Simulation"}
          </Button>
        </section>
      </div>
    </MobileContainer>
  );
}
