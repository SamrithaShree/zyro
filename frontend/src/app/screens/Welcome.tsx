import { MobileContainer } from "../components/MobileContainer";
import { Shield, Zap, CheckCircle2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { useNavigate } from "react-router";
import { motion } from "motion/react";

export function Welcome() {
  const navigate = useNavigate();

  return (
    <MobileContainer>
      <div className="flex flex-col min-h-screen px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 flex flex-col justify-center"
        >
          {/* Logo */}
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center">
                <Shield className="w-7 h-7 text-primary-foreground" />
              </div>
              <h1 className="text-3xl font-bold">Zyro</h1>
            </div>
            <p className="text-muted-foreground">
              Income protection for delivery workers
            </p>
          </div>

          {/* Value Props */}
          <div className="space-y-6 mb-12">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Zap className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Earn even when work stops</h3>
                <p className="text-sm text-muted-foreground">
                  Rain, pollution, outages? We've got you covered.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-[#00FF87]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-5 h-5 text-[#00FF87]" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">No claims, paid automatically</h3>
                <p className="text-sm text-muted-foreground">
                  Zyro detects disruptions and pays you instantly.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Zero paperwork required</h3>
                <p className="text-sm text-muted-foreground">
                  Setup in 2 minutes. Everything works in the background.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        <div className="space-y-3">
          <Button
            onClick={() => navigate("/login")}
            className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Get Started
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            For Swiggy, Zomato & delivery riders
          </p>
        </div>
      </div>
    </MobileContainer>
  );
}
