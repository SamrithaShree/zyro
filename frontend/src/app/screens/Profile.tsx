import { MobileContainer } from "../components/MobileContainer";
import { BottomNav } from "../components/BottomNav";
import {
  User,
  MapPin,
  Wallet,
  Shield,
  ChevronRight,
  LogOut,
  Star,
  Settings
} from "lucide-react";
import { useNavigate } from "react-router";
import { useAuthStore } from "../../store/useAuthStore";
import { useOnboardingStore } from "../../store/useOnboardingStore";
import { apiService } from "../../services/api";
import { motion } from "motion/react";

export function Profile() {
  const navigate = useNavigate();
  const { phone, logout: authLogout } = useAuthStore();
  const { data, reset: onboardingReset } = useOnboardingStore();

  const handleLogout = async () => {
    try {
      await apiService.auth.logout();
    } catch {
      // Ignore logout errors
    } finally {
      authLogout();
      onboardingReset();
      navigate("/login");
    }
  };

  return (
    <MobileContainer hasBottomNav className="bg-[#1B4965]">
      <div className="px-6 pt-12 pb-32 space-y-10">
        
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-black text-white italic tracking-tighter">Profile</h1>
          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-[#62B6CB]">
             <Settings className="w-6 h-6" />
          </div>
        </div>

        {/* User Card - High Contrast */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#BEE9E8] rounded-[40px] p-8 text-[#1B4965] shadow-[0_30px_60px_rgba(0,0,0,0.4)] relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#1B4965]/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
          
          <div className="relative z-10 flex items-center gap-6 mb-8">
            <div className="w-20 h-20 bg-[#1B4965] rounded-[28px] flex items-center justify-center text-[#BEE9E8] shadow-2xl">
              <User className="w-10 h-10" />
            </div>
            <div>
              <h2 className="font-black text-2xl tracking-tight italic">Delivery Partner</h2>
              <p className="text-sm font-bold text-[#1B4965]/60 italic tracking-tight">{phone || "+91 98765 43210"}</p>
            </div>
          </div>

          <div className="relative z-10 pt-6 border-t border-[#1B4965]/10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 fill-[#1B4965]" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Trust Score</span>
              </div>
              <span className="font-black text-xl italic tracking-tighter">98/100</span>
            </div>
            <div className="h-2 w-full bg-[#1B4965]/10 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: "98%" }}
                transition={{ duration: 1, delay: 0.5 }}
                className="h-full bg-[#1B4965]" 
              />
            </div>
          </div>
        </motion.div>

        {/* Settings Sections */}
        <div className="space-y-8">
          {/* Work Details */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] px-2">Work Meta</h3>
            <div className="bg-white/5 backdrop-blur-md rounded-[32px] border border-white/5 overflow-hidden shadow-xl">
              <button className="w-full flex items-center justify-between p-6 hover:bg-white/5 transition-colors group">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-[#62B6CB] shadow-inner group-hover:scale-110 transition-transform">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <div className="font-black text-white text-sm italic tracking-tight">Active Zone</div>
                    <div className="text-[10px] font-bold text-white/40 uppercase tracking-tighter mt-0.5">
                      {data.zone || "Koramangala"}, {data.city || "BLR"}
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-white/10 group-hover:text-white/40 transition-colors" />
              </button>
              <div className="h-px bg-white/5 mx-6" />
              <button className="w-full flex items-center justify-between p-6 hover:bg-white/5 transition-colors group">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-[#62B6CB] shadow-inner group-hover:scale-110 transition-transform">
                    <Shield className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <div className="font-black text-white text-sm italic tracking-tight">Platforms</div>
                    <div className="text-[10px] font-bold text-white/40 uppercase tracking-tighter mt-0.5">
                      {data.platform || "Swiggy, Zomato"}
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-white/10 group-hover:text-white/40 transition-colors" />
              </button>
            </div>
          </div>

          {/* Payment */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] px-2">Payout Config</h3>
            <div className="bg-white/5 backdrop-blur-md rounded-[32px] border border-white/5 overflow-hidden shadow-xl">
              <button className="w-full flex items-center justify-between p-6 hover:bg-white/5 transition-colors group">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-[#00FF87] shadow-inner group-hover:scale-110 transition-transform">
                    <Wallet className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <div className="font-black text-white text-sm italic tracking-tight">Unified ID</div>
                    <div className="text-[10px] font-bold text-white/40 uppercase tracking-tighter mt-0.5">
                      {data.upiId || "secure-partner@upi"}
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-white/10 group-hover:text-white/40 transition-colors" />
              </button>
            </div>
          </div>

          {/* Log Out Button */}
          <div className="pt-4">
            <motion.button 
              whileTap={{ scale: 0.98 }}
              onClick={handleLogout}
              className="w-full h-16 rounded-[24px] bg-red-500/10 border-2 border-red-500/20 text-red-500 font-black text-xs uppercase tracking-[0.3em] italic flex items-center justify-center gap-3 hover:bg-red-500 hover:text-white transition-all shadow-xl"
            >
              <LogOut className="w-5 h-5" />
              Terminate Session
            </motion.button>
          </div>
        </div>

        {/* App Info */}
        <div className="text-center space-y-1">
          <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Zyro Ecosystem v1.0.4</p>
          <p className="text-[9px] font-bold text-white/10 italic">
            AI-Powered Parametric Income Protection
          </p>
        </div>
      </div>

      <BottomNav />
    </MobileContainer>
  );
}
