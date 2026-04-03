import { useState } from "react";
import { useOnboardingStore } from "../../../store/useOnboardingStore";
import { useAuthStore } from "../../../store/useAuthStore";
import { Button } from "../../../app/components/ui/button";
import { CheckCircle2, Loader2 } from "lucide-react";
import { apiService } from "../../../services/api";

export function ReviewStep() {
  const { data, syncWithBackend } = useOnboardingStore();
  const setAuth = useAuthStore((s) => s.setAuth);
  const auth = useAuthStore();
  const [isRegistering, setIsRegistering] = useState(false);
  const [workerId, setWorkerId] = useState<string | null>(null);

  const handleRegister = async () => {
    setIsRegistering(true);
    try {
      const response = await apiService.worker.register();
      
      const resData = response.data.data;
      setWorkerId(resData.worker_id);
      
      // Update auth store with worker_id and registered status
      setAuth({
        token: auth.token!,
        is_registered: true,
        has_mpin: auth.hasMpin,
        worker_id: resData.worker_id
      });
      
      await syncWithBackend();
    } catch {
       // Error handled by interceptor
    } finally {
       setIsRegistering(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[#1B4965] mb-2">Review Profile</h2>
        <p className="text-[#1B4965]/60">Everything looks great. Final step to create your profile.</p>
      </div>

      <div className="space-y-4 flex-1">
        <div className="bg-white rounded-2xl p-6 border-2 border-[#1B4965]/5 shadow-sm space-y-6">
           <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#1B4965]/40 uppercase">Worker Name</span>
              <span className="text-sm font-bold text-[#1B4965]">{data.name}</span>
           </div>
           <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#1B4965]/40 uppercase">Platform</span>
              <span className="text-sm font-bold text-[#1B4965]">{data.platform}</span>
           </div>
           <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#1B4965]/40 uppercase">Operating Zone</span>
              <span className="text-sm font-bold text-[#1B4965]">{data.zone}, {data.city}</span>
           </div>
           <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#1B4965]/40 uppercase">Weekly Income</span>
              <span className="text-sm font-bold text-[#1B4965]">{data.incomeBand}</span>
           </div>
           <div className="flex items-center justify-between pt-4 border-t-2 border-[#1B4965]/5">
              <span className="text-xs font-bold text-[#1B4965]/40 uppercase">Payout Destination</span>
              <span className="text-sm font-bold text-[#1B4965]">{data.upiId}</span>
           </div>
        </div>

        {workerId && (
          <div className="p-4 bg-green-500 rounded-2xl flex items-center justify-center gap-3 animate-bounce">
             <CheckCircle2 className="w-6 h-6 text-white" />
             <span className="text-white font-black">ZYRO VERIFIED: {workerId}</span>
          </div>
        )}
      </div>

      <Button
        onClick={handleRegister}
        disabled={isRegistering || !!workerId}
        className="w-full h-16 rounded-2xl font-bold text-lg bg-[#62B6CB] text-white mt-8"
      >
        {isRegistering ? <Loader2 className="w-6 h-6 animate-spin" /> : workerId ? "Registered!" : "Register Worker Profile"}
      </Button>
    </div>
  );
}
