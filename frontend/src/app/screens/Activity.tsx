import { useEffect, useState } from "react";
import { MobileContainer } from "../components/MobileContainer";
import { BottomNav } from "../components/BottomNav";
import { TriggerIcon } from "../../components/common/TriggerIcon";
import { SkeletonCard } from "../../components/common/SkeletonCard";
import { ErrorState } from "../../components/common/ErrorState";
import { Shield, ChevronRight, TrendingUp } from "lucide-react";
import { fetchClaimHistory, ClaimRecord } from "../../services/mock/claim.mock";
import { motion } from "motion/react";

export function Activity() {
  const [claims, setClaims] = useState<ClaimRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchClaimHistory();
      setClaims(data);
    } catch {
      setError("Failed to load activity. Please retry.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <MobileContainer hasBottomNav className="bg-[#1B4965]">
      <div className="px-6 pt-12 pb-32 space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-white italic tracking-tighter">Activity</h1>
            <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">Transaction History</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-[#62B6CB]">
             <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-white/5 rounded-[28px] animate-pulse border border-white/5" />
            ))}
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : claims.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 bg-white/5 rounded-[32px] border border-white/5 flex items-center justify-center mb-6 shadow-2xl">
              <Shield className="w-10 h-10 text-white/20" />
            </div>
            <h3 className="text-xl font-black text-white italic mb-2">No triggers yet</h3>
            <p className="text-sm text-white/40 max-w-[240px] font-medium leading-relaxed">
              Zyro is monitoring your zone 24/7. Claims will trigger automatically.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {claims.map((claim, i) => (
              <motion.div
                key={claim.eventId}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white/5 backdrop-blur-md border border-white/10 rounded-[28px] p-6 hover:bg-white/10 transition-colors group"
              >
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-[#62B6CB] shadow-inner group-hover:scale-110 transition-transform">
                    <TriggerIcon eventType={claim.eventType} size="sm" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-black text-sm text-white italic tracking-tight">
                        {claim.eventType.charAt(0) + claim.eventType.slice(1).toLowerCase()} Disruption
                      </p>
                      {claim.status === "PAID" ? (
                        <span className="text-[#00FF87] font-black text-sm italic">+₹{claim.amount}</span>
                      ) : (
                        <span className="text-[10px] px-3 py-1 bg-[#62B6CB]/10 text-[#62B6CB] rounded-full font-black uppercase tracking-wider">
                          Review
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 overflow-hidden">
                      <span className="text-[10px] font-bold text-white/30 uppercase tracking-tighter">{claim.date}</span>
                      <span className="text-white/10">·</span>
                      <span className="text-[10px] font-bold text-white/30 uppercase tracking-tighter truncate">{claim.zone}</span>
                      <span className="text-white/10">·</span>
                      <span className="text-[10px] font-bold text-white/30 uppercase tracking-tighter">{claim.duration}h</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/10 group-hover:text-white/40 transition-colors" />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      <BottomNav />
    </MobileContainer>
  );
}
