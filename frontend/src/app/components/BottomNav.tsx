import { Home, Activity, User } from "lucide-react";
import { useNavigate, useLocation } from "react-router";
import { motion } from "motion/react";

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: "/dashboard", icon: <Home className="w-6 h-6" />, label: "Home" },
    { path: "/activity", icon: <Activity className="w-6 h-6" />, label: "Activity" },
    { path: "/profile", icon: <User className="w-6 h-6" />, label: "Profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-full sm:max-w-[640px] lg:max-w-[900px] px-4 sm:px-6 lg:px-8 pb-6 pt-2 z-50">
      <div className="bg-[#1B4965]/80 backdrop-blur-2xl border border-white/10 rounded-[32px] flex items-center justify-around px-4 py-3 shadow-[0_-20px_40px_rgba(0,0,0,0.3)]">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className="relative flex flex-col items-center gap-1 p-2 transition-all group"
          >
            <div className={`transition-all duration-300 ${
              isActive(item.path)
                ? "text-[#62B6CB] scale-110"
                : "text-white/40 group-hover:text-white/60"
            }`}>
              {item.icon}
            </div>
            <span className={`text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
              isActive(item.path)
                ? "text-[#62B6CB] opacity-100"
                : "text-white/20 opacity-0 group-hover:opacity-100"
            }`}>
              {item.label}
            </span>
            
            {isActive(item.path) && (
              <motion.div 
                layoutId="activeTab"
                className="absolute -bottom-1 w-1 h-1 rounded-full bg-[#62B6CB] shadow-[0_0_10px_#62B6CB]"
              />
            )}
          </button>
        ))}
      </div>
    </nav>
  );
}
