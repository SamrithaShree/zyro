import { useEffect, useRef } from "react";
import { MobileContainer } from "../components/MobileContainer";
import { Button } from "../components/ui/button";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { ShieldCheck, Zap, ArrowRight, Smartphone } from "lucide-react";

/* ─────────────────────────────────────────
   Palette Usage (Phase 2)
   Background: #BEE9E8
   Interactive: #62B6CB
   Text: #1B4965
   Secondary: #5FA8D3
───────────────────────────────────────── */

export function Welcome() {
  const navigate = useNavigate();

  return (
    <MobileContainer style={{ backgroundColor: "#BEE9E8" }}>
      <div className="relative flex flex-col min-h-screen px-8 py-12 overflow-hidden">
        
        {/* Background Accents */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#62B6CB]/10 rounded-full blur-3xl -translate-y-20 translate-x-20" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#5FA8D3]/10 rounded-full blur-3xl translate-y-20 -translate-x-20" />

        {/* Content */}
        <div className="relative z-10 flex-1 flex flex-col">
          
          {/* Logo Section */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center mb-12"
          >
            <div className="w-24 h-24 rounded-[32px] bg-white shadow-2xl flex items-center justify-center border-4 border-[#62B6CB]/20 mb-4 overflow-hidden">
               <img src="/assets/zyro-logo.png" alt="Zyro" className="w-16 h-16 object-contain" />
            </div>
            <div className="bg-[#1B4965] px-3 py-1 rounded-full text-[8px] font-black text-white tracking-[0.2em] uppercase">
               NULL POINTERS PRESENTS
            </div>
          </motion.div>

          {/* Headline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-black text-[#1B4965] leading-tight tracking-tight mb-4">
               Earn even when <br/>
               <span className="text-[#62B6CB]">work stops.</span>
            </h1>
            <p className="text-[#1B4965]/60 font-medium leading-relaxed">
               Parametric income protection for delivery partners. Zero claims. Instant payouts.
            </p>
          </motion.div>

          {/* Feature List */}
          <div className="space-y-4 mb-12">
             {[
               { icon: <ShieldCheck className="w-5 h-5 text-[#62B6CB]" />, text: "Automated Data Triggers" },
               { icon: <Zap className="w-5 h-5 text-[#62B6CB]" />, text: "Instant UPI Payouts" },
               { icon: <Smartphone className="w-5 h-5 text-[#62B6CB]" />, text: "90-Second Onboarding" },
             ].map((f, i) => (
               <motion.div
                 key={i}
                 initial={{ opacity: 0, x: -20 }}
                 animate={{ opacity: 1, x: 0 }}
                 transition={{ delay: 0.4 + i * 0.1 }}
                 className="flex items-center gap-4 bg-white/40 backdrop-blur-sm p-4 rounded-2xl border border-white/20 shadow-sm"
               >
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                     {f.icon}
                  </div>
                  <span className="font-bold text-[#1B4965] text-sm">{f.text}</span>
               </motion.div>
             ))}
          </div>

          {/* CTA Group */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-auto space-y-4"
          >
             <Button
               onClick={() => navigate("/login")}
               className="w-full h-16 rounded-2xl bg-[#62B6CB] text-white font-black text-lg shadow-xl shadow-[#62B6CB]/20 flex items-center justify-center gap-2 group"
             >
                Get Protected Now
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
             </Button>

             <p className="text-center text-[10px] text-[#1B4965]/40 font-bold uppercase tracking-widest">
                Trusted by 12,000+ Delivery Partners
             </p>
          </motion.div>

        </div>
      </div>
    </MobileContainer>
  );
}
