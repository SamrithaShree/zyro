import { useEffect, useState } from "react";
import { MobileContainer } from "../components/MobileContainer";
import { BottomNav } from "../components/BottomNav";
import { TriggerIcon } from "../../components/common/TriggerIcon";
import { SkeletonCard } from "../../components/common/SkeletonCard";
import { ErrorState } from "../../components/common/ErrorState";
import { Shield } from "lucide-react";
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
    <MobileContainer hasBottomNav>
      <div className="px-6 py-8 pb-24 space-y-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Activity</h1>
          <p className="text-sm text-muted-foreground">Your claim history</p>
        </div>

        {loading ? (
          <div className="space-y-3">
            <SkeletonCard lines={3} />
            <SkeletonCard lines={3} />
            <SkeletonCard lines={3} />
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : claims.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold mb-2">No claims yet</h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              Zyro is monitoring your zone. Claims are triggered automatically.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {claims.map((claim, i) => (
              <motion.div
                key={claim.eventId}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="bg-card border border-border rounded-2xl p-4"
              >
                <div className="flex items-center gap-4">
                  <TriggerIcon eventType={claim.eventType} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-sm truncate">
                        {claim.eventType.charAt(0) + claim.eventType.slice(1).toLowerCase()} Event
                      </p>
                      {claim.status === "PAID" ? (
                        <span className="text-success font-bold text-sm">+₹{claim.amount}</span>
                      ) : (
                        <span className="text-xs px-2 py-1 bg-warning/10 text-warning rounded-full font-medium">
                          Review
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">{claim.date}</span>
                      <span className="text-xs text-muted-foreground">·</span>
                      <span className="text-xs text-muted-foreground">{claim.zone}</span>
                      <span className="text-xs text-muted-foreground">·</span>
                      <span className="text-xs text-muted-foreground">{claim.duration}h</span>
                    </div>
                  </div>
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
