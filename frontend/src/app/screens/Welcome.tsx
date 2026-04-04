import React from "react";
import { useNavigate } from "react-router";
import { StickyCTA } from "../../design-system/layouts/StickyCTA";
import { Button } from "../../design-system/components/Button";
import { motion } from "motion/react";

export function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="zyro-root font-sans">
      <div className="zyro-atmosphere" />
      
      <div className="zyro-container px-4 sm:px-6 lg:px-8 pt-20 pb-32">
        <div className="flex-1 flex flex-col items-center text-center space-y-12">
          {/* Logo Section */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 20, stiffness: 200 }}
            className="w-24 h-24 bg-white rounded-[32px] flex items-center justify-center shadow-[0_12px_40px_rgba(27,73,101,0.1)] border-2 border-white"
          >
<<<<<<< HEAD
            <div className="w-24 h-24 rounded-[32px] bg-white shadow-2xl flex items-center justify-center border-4 border-[#62B6CB]/20 mb-4 overflow-hidden">
               <img src="/assets/zyro-logo.svg" alt="Zyro" className="w-16 h-16 object-contain" />
            </div>
            <div className="bg-[#1B4965] px-3 py-1 rounded-full text-[8px] font-black text-white tracking-[0.2em] uppercase">
               NULL POINTERS PRESENTS
            </div>
=======
            <img src="/assets/zyro-logo.png" alt="Zyro" className="w-16 h-16 object-contain" />
>>>>>>> b456267 (feat: update frontend ui)
          </motion.div>

          {/* Text Section */}
          <div className="space-y-4">
            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-[32px] font-black text-[#1B4965] leading-tight tracking-tighter"
            >
              Earn even when <br/>
              <span className="text-[#62B6CB]">work stops.</span>
            </motion.h1>
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-[16px] text-[#1B4965]/70 font-medium leading-relaxed px-4"
            >
              The world's first parametric income protection for delivery partners. Zero claims. Instant payouts.
            </motion.p>
          </div>

          {/* Features Preview */}
          <div className="w-full space-y-3 pt-4">
            {[
              { label: "Automated Triggers", sub: "No manual filing" },
              { label: "Instant UPI Payouts", sub: "Money in seconds" }
            ].map((f, i) => (
              <motion.div
                key={i}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 + (i * 0.1) }}
                className="bg-white/40 backdrop-blur-md p-4 rounded-[24px] border border-white/40 flex items-center justify-between"
              >
                <div className="text-left">
                  <div className="text-[14px] font-bold text-[#1B4965]">{f.label}</div>
                  <div className="text-[11px] text-[#1B4965]/50 font-semibold uppercase tracking-wider">{f.sub}</div>
                </div>
                <div className="w-8 h-8 rounded-full bg-white/60 flex items-center justify-center text-[#62B6CB]">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <StickyCTA className="bg-transparent shadow-none">
          <Button onClick={() => navigate("/login")}>
            Get Protected Now
          </Button>
          <Button variant="secondary" onClick={() => navigate("/login")}>
            Sign In
          </Button>
        </StickyCTA>
      </div>
    </div>
  );
}
