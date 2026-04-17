import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { MobileContainer } from "../components/MobileContainer";
import { BottomNav } from "../components/BottomNav";
import { Shield, ChevronRight, TrendingUp, AlertCircle, Activity as ActivityIcon, Loader2 } from "lucide-react";
import { apiService } from "../../services/api";
import { motion } from "motion/react";
import { StatsStrip } from "../components/StatsStrip";
import "../../design-system/styles/atmosphere.css";

export function Activity() {
  const navigate = useNavigate();
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await apiService.claims.getMyClaims();
      if (Array.isArray(res.data)) {
        setClaims(res.data);
      }
    } catch (err) {
      console.error("Failed to load activity", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // Calculate stats
  const totalClaimed = claims.filter(c => c.status === 'PAID').reduce((sum, c) => sum + (c.final_payout || 0), 0);
  const potentialLoss = claims.reduce((sum, c) => sum + (c.estimated_loss || 0), 0);
  const stabilityBase = 85; 
  const stabilityBonus = Math.min(10, claims.length * 2);
  const netStability = stabilityBase + stabilityBonus;

  return (
    <div className="zyro-root font-sans">
      <div className="zyro-atmosphere" />
      
      <div className="zyro-container Independent-scroll pb-32">
        <div className="px-6 pt-12 space-y-8 relative z-10">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-3xl font-black text-[#1B4965] italic tracking-tighter">Activity</h1>
              <p className="text-[#1B4965]/40 text-[10px] font-black uppercase tracking-[0.2em]">Transaction History</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-white/40 border border-white/60 flex items-center justify-center text-[#62B6CB] shadow-sm">
               <TrendingUp className="w-6 h-6" />
            </div>
          </div>

          <StatsStrip 
            totalClaimed={totalClaimed}
            potentialLoss={potentialLoss}
            netGain={netStability}
          />

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-white/40 rounded-[28px] animate-pulse border border-white/60 shadow-sm" />
              ))}
            </div>
          ) : claims.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-20 h-20 bg-white/40 rounded-[32px] border border-white/60 flex items-center justify-center mb-6 shadow-xl">
                <Shield className="w-10 h-10 text-[#1B4965]/20" />
              </div>
              <h3 className="text-xl font-black text-[#1B4965] italic mb-2">No triggers yet</h3>
              <p className="text-sm text-[#1B4965]/40 max-w-[240px] font-medium leading-relaxed">
                Zyro is monitoring your zone 24/7. Claims will trigger automatically.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {claims.map((claim, i) => (
                <motion.div
                  key={claim.claim_id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => navigate(`/claim-details/${claim.claim_id}`)}
                  className="bg-white/40 backdrop-blur-md border border-white/60 rounded-[28px] p-6 hover:bg-white/60 transition-colors group cursor-pointer shadow-sm active:scale-[0.98]"
                >
                  <div className="flex items-center gap-5">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform ${
                      claim.status === 'PAID' ? 'bg-green-500/10 text-green-500' : 'bg-[#62B6CB]/10 text-[#62B6CB]'
                    }`}>
                      {claim.status === 'PAID' ? <Shield size={24} /> : <ActivityIcon size={24} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-black text-sm text-[#1B4965] italic tracking-tight">
                          Disruption Analysis
                        </p>
                        {claim.status === "PAID" ? (
                          <span className="text-green-600 font-black text-sm italic">+₹{claim.final_payout}</span>
                        ) : (
                          <span className="text-[10px] px-3 py-1 bg-[#62B6CB]/10 text-[#62B6CB] rounded-full font-black uppercase tracking-wider">
                            {claim.status}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 overflow-hidden">
                        <span className="text-[10px] font-bold text-[#1B4965]/30 uppercase tracking-tighter">{new Date(claim.created_at).toLocaleDateString()}</span>
                        <span className="text-[#1B4965]/10">·</span>
                        <span className="text-[10px] font-bold text-[#1B4965]/30 uppercase tracking-tighter truncate">{claim.zone}</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#1B4965]/10 group-hover:text-[#62B6CB] transition-colors" />
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
