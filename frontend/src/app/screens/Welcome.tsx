import { useEffect, useRef } from "react";
import { MobileContainer } from "../components/MobileContainer";
import { Button } from "../components/ui/button";
import { useNavigate } from "react-router";
import { motion } from "motion/react";

/* ─────────────────────────────────────────
   Rain Particle Canvas
───────────────────────────────────────── */
function RainCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    type Drop = { x: number; y: number; len: number; speed: number; opacity: number };
    const drops: Drop[] = Array.from({ length: 55 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      len: Math.random() * 14 + 6,
      speed: Math.random() * 1.2 + 0.4,
      opacity: Math.random() * 0.18 + 0.04,
    }));

    let raf: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drops.forEach((d) => {
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x - 1, d.y + d.len);
        ctx.strokeStyle = `rgba(0, 229, 255, ${d.opacity})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
        d.y += d.speed;
        if (d.y > canvas.height) {
          d.y = -d.len;
          d.x = Math.random() * canvas.width;
        }
      });
      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity: 0.6 }}
    />
  );
}

/* ─────────────────────────────────────────
   Platform Brand Logos (inline SVG)
───────────────────────────────────────── */
const SwiggyLogo = () => (
  <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
    <circle cx="17" cy="17" r="17" fill="#FC8019" />
    <text x="17" y="23" textAnchor="middle" fill="white" fontSize="18" fontWeight="900" fontFamily="Arial Black, sans-serif">S</text>
  </svg>
);

const ZomatoLogo = () => (
  <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
    <circle cx="17" cy="17" r="17" fill="#E23744" />
    <text x="17" y="23" textAnchor="middle" fill="white" fontSize="18" fontWeight="900" fontFamily="Arial Black, sans-serif">Z</text>
  </svg>
);

const ZeptoLogo = () => (
  <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
    <rect width="34" height="34" rx="10" fill="#6C3CE1" />
    <text x="17" y="23" textAnchor="middle" fill="white" fontSize="18" fontWeight="900" fontFamily="Arial Black, sans-serif">Z</text>
  </svg>
);

const DunzoLogo = () => (
  <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
    <circle cx="17" cy="17" r="17" fill="#00A676" />
    <text x="17" y="23" textAnchor="middle" fill="white" fontSize="17" fontWeight="900" fontFamily="Arial Black, sans-serif">D</text>
  </svg>
);

const platforms = [
  { name: "Swiggy",  Logo: SwiggyLogo,  glow: "rgba(252,128,25,0.45)"  },
  { name: "Zomato",  Logo: ZomatoLogo,  glow: "rgba(226,55,68,0.45)"   },
  { name: "Zepto",   Logo: ZeptoLogo,   glow: "rgba(108,60,225,0.45)"  },
  { name: "Dunzo",   Logo: DunzoLogo,   glow: "rgba(0,166,118,0.45)"   },
];

const bulletPoints = [
  { icon: "🌧️", label: "Rain",        desc: "Payouts when it's too wet to deliver"    },
  { icon: "🚔", label: "Curfew",      desc: "Covered during city-wide restrictions"   },
  { icon: "📉", label: "Order Drops", desc: "Protected when platform demand crashes"  },
];

/* ─────────────────────────────────────────
   Main Welcome Screen
───────────────────────────────────────── */
export function Welcome() {
  const navigate = useNavigate();

  return (
    <MobileContainer>
      <div className="relative flex flex-col min-h-screen overflow-hidden">

        {/* ── ANIMATED BACKGROUND ── */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 90% 55% at 50% -5%, rgba(0,180,255,0.22) 0%, transparent 65%)," +
              "radial-gradient(ellipse 70% 45% at 85% 100%, rgba(255,140,0,0.14) 0%, transparent 60%)," +
              "radial-gradient(ellipse 50% 40% at 10% 80%, rgba(108,60,225,0.10) 0%, transparent 60%)," +
              "linear-gradient(180deg, #080C14 0%, #0F1115 40%, #0A0D12 100%)",
          }}
        />
        <RainCanvas />

        {/* ── CONTENT ── */}
        <div className="relative flex flex-col min-h-screen px-5 pb-6 pt-12">

          {/* ── HERO LOGO ── */}
          <motion.div
            initial={{ opacity: 0, y: -28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: "easeOut" }}
            className="flex flex-col items-center mb-7"
          >
            {/* Outer pulsing aura */}
            <div className="relative mb-2">
              <motion.div
                animate={{ scale: [1, 1.18, 1], opacity: [0.35, 0.2, 0.35] }}
                transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
                className="absolute rounded-full blur-3xl"
                style={{
                  width: 170,
                  height: 170,
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  background: "radial-gradient(circle, rgba(0,229,255,0.55) 0%, rgba(0,180,255,0.2) 50%, transparent 75%)",
                }}
              />
              {/* Secondary warm aura */}
              <motion.div
                animate={{ scale: [1.1, 1, 1.1], opacity: [0.2, 0.35, 0.2] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", delay: 1 }}
                className="absolute rounded-full blur-2xl"
                style={{
                  width: 120,
                  height: 120,
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  background: "radial-gradient(circle, rgba(255,167,38,0.35) 0%, transparent 70%)",
                }}
              />
              <motion.img
                src="/zyro-logo.png"
                alt="Zyro"
                className="relative object-contain"
                style={{ width: 148, height: 148, filter: "drop-shadow(0 8px 32px rgba(0,229,255,0.4))" }}
                initial={{ scale: 0.75, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.15, duration: 0.6, type: "spring", stiffness: 160 }}
              />
            </div>

            {/* Brand signature */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.62 }}
              transition={{ delay: 0.55, duration: 0.5 }}
              className="text-center mt-1"
              style={{
                fontSize: "9px",
                letterSpacing: "0.22em",
                fontWeight: 200,
                color: "#8B92A8",
                textTransform: "uppercase",
                fontFamily: "Inter, sans-serif",
              }}
            >
              BROUGHT TO YOU BY NULL POINTERS
            </motion.p>
          </motion.div>

          {/* ── HEADLINE ── */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-center mb-5 px-1"
          >
            <h1 className="font-bold leading-tight mb-2" style={{ fontSize: "clamp(26px, 7vw, 34px)" }}>
              Earn even when{" "}
              <span
                className="text-transparent bg-clip-text"
                style={{ backgroundImage: "linear-gradient(90deg, #FFA726 0%, #FFD54F 50%, #00E5FF 100%)" }}
              >
                your work stops
              </span>
            </h1>
            <p className="text-sm leading-relaxed" style={{ color: "#8B92A8" }}>
              Zyro protects your income automatically during disruptions —{" "}
              <span style={{ color: "#00E5FF" }}>no claims, no waiting.</span>
            </p>
          </motion.div>

          {/* ── DISRUPTION CARDS ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.52, duration: 0.5 }}
            className="space-y-2.5 mb-5"
          >
            {bulletPoints.map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.62 + i * 0.1, duration: 0.38 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-4 rounded-2xl p-4 cursor-default"
                style={{
                  background: "linear-gradient(135deg, rgba(255,255,255,0.045) 0%, rgba(255,255,255,0.02) 100%)",
                  border: "1px solid rgba(255,255,255,0.09)",
                  backdropFilter: "blur(12px)",
                  boxShadow: "0 2px 16px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.06)",
                }}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 text-xl"
                  style={{
                    background: "linear-gradient(135deg, rgba(0,229,255,0.18) 0%, rgba(255,167,38,0.12) 100%)",
                    border: "1px solid rgba(0,229,255,0.22)",
                    boxShadow: "0 0 12px rgba(0,229,255,0.1)",
                  }}
                >
                  {item.icon}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-foreground leading-none mb-1">{item.label}</h3>
                  <p className="text-xs" style={{ color: "#8B92A8" }}>{item.desc}</p>
                </div>
                {/* Right accent dot */}
                <div
                  className="ml-auto w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ background: "linear-gradient(135deg,#FFA726,#00E5FF)" }}
                />
              </motion.div>
            ))}
          </motion.div>

          {/* ── PLATFORM TRUST SECTION ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.88, duration: 0.45 }}
            className="mb-6"
          >
            <p
              className="text-center mb-3"
              style={{ fontSize: "10px", letterSpacing: "0.12em", color: "#8B92A8", textTransform: "uppercase", fontWeight: 400 }}
            >
              Trusted by delivery partners across India
            </p>
            <div
              className="flex items-center justify-center gap-3 rounded-2xl px-4 py-3"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
                backdropFilter: "blur(10px)",
              }}
            >
              {platforms.map((p) => {
                const Logo = p.Logo;
                return (
                  <motion.div
                    key={p.name}
                    whileHover={{ scale: 1.12, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 18 }}
                    className="flex flex-col items-center gap-1.5 cursor-default"
                  >
                    {/* Glassmorphism pill */}
                    <div
                      className="rounded-2xl p-2 flex items-center justify-center"
                      style={{
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        boxShadow: `0 0 14px ${p.glow}`,
                        backdropFilter: "blur(8px)",
                      }}
                    >
                      <Logo />
                    </div>
                    <span
                      style={{ fontSize: "9px", color: "#8B92A8", fontWeight: 500, letterSpacing: "0.04em" }}
                    >
                      {p.name}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* ── CTA BUTTONS ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.02, duration: 0.4 }}
            className="space-y-2.5 mt-auto"
          >
            {/* Primary CTA */}
            <motion.div whileTap={{ scale: 0.975 }}>
              <Button
                id="welcome-start-btn"
                onClick={() => navigate("/signup")}
                className="w-full h-14 rounded-2xl font-bold text-[15px] relative overflow-hidden border-0"
                style={{
                  background: "linear-gradient(90deg, #FF8C00 0%, #FFA726 40%, #FFD54F 100%)",
                  color: "#0F1115",
                  boxShadow: "0 0 40px rgba(255,167,38,0.45), 0 4px 16px rgba(255,167,38,0.25)",
                }}
              >
                {/* Shimmer sweep */}
                <motion.div
                  animate={{ x: ["-100%", "200%"] }}
                  transition={{ repeat: Infinity, duration: 2.5, ease: "linear", repeatDelay: 1.5 }}
                  className="absolute inset-y-0"
                  style={{
                    width: "40%",
                    background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
                    pointerEvents: "none",
                  }}
                />
                <span className="relative flex items-center justify-center gap-2">
                  ⚡ Start Setup in 90 seconds
                </span>
              </Button>
            </motion.div>

            {/* Secondary CTA */}
            <motion.button
              id="welcome-login-btn"
              onClick={() => navigate("/login")}
              whileTap={{ scale: 0.97 }}
              className="w-full h-11 rounded-2xl text-sm transition-all"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#8B92A8",
              }}
            >
              Already have an account?{" "}
              <span style={{ color: "#00E5FF", fontWeight: 600 }}>Sign in</span>
            </motion.button>

            <p className="text-center pt-0.5" style={{ fontSize: "10px", color: "#4A5060" }}>
              Zyro · 100% secure · No claims needed 🛡️
            </p>
          </motion.div>
        </div>
      </div>
    </MobileContainer>
  );
}
