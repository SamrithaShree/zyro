import { MobileContainer } from "../components/MobileContainer";
import { TrendingDown, TrendingUp, Shield } from "lucide-react";
import { Button } from "../components/ui/button";
import { useNavigate } from "react-router";
import { motion } from "motion/react";

export function SavedVsLost() {
  const navigate = useNavigate();
  const estimatedLoss = 550;
  const zyroPayment = 485;
  const protectionPercentage = Math.round((zyroPayment / estimatedLoss) * 100);

  return (
    <MobileContainer>
      <div className="flex flex-col min-h-screen px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1"
        >
          {/* Header */}
          <div className="mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-accent to-primary rounded-2xl flex items-center justify-center mb-6">
              <Shield className="w-8 h-8 text-background" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Impact Analysis</h1>
            <p className="text-muted-foreground">
              How Zyro protected your income
            </p>
          </div>

          {/* Comparison Cards */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-destructive/5 border border-destructive/20 rounded-xl p-6"
            >
              <div className="flex items-center gap-2 mb-3">
                <TrendingDown className="w-5 h-5 text-destructive" />
                <span className="text-xs text-muted-foreground">Without Zyro</span>
              </div>
              <div className="text-3xl font-bold text-destructive mb-1">
                ₹{estimatedLoss}
              </div>
              <p className="text-xs text-muted-foreground">Est. Loss</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-[#00FF87]/5 border border-[#00FF87]/20 rounded-xl p-6"
            >
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-5 h-5 text-[#00FF87]" />
                <span className="text-xs text-muted-foreground">With Zyro</span>
              </div>
              <div className="text-3xl font-bold text-[#00FF87] mb-1">
                ₹{zyroPayment}
              </div>
              <p className="text-xs text-muted-foreground">Protected</p>
            </motion.div>
          </div>

          {/* Protection Percentage */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-card to-secondary border border-border rounded-2xl p-8 mb-8 text-center"
          >
            <p className="text-sm text-muted-foreground mb-3">
              Protection Coverage
            </p>
            <div className="text-6xl font-bold text-primary mb-3">
              {protectionPercentage}%
            </div>
            <p className="text-sm text-muted-foreground">
              of your estimated loss was covered
            </p>

            {/* Visual Bar */}
            <div className="mt-6 h-3 bg-secondary rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${protectionPercentage}%` }}
                transition={{ delay: 0.6, duration: 1 }}
                className="h-full bg-gradient-to-r from-accent to-primary"
              />
            </div>
          </motion.div>

          {/* Breakdown */}
          <div className="bg-card border border-border rounded-2xl p-6 mb-8">
            <h3 className="font-semibold mb-4">Calculation Breakdown</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Disruption duration</span>
                <span className="font-medium">2.5 hours</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Avg hourly earning</span>
                <span className="font-medium">₹220/hour</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Expected loss</span>
                <span className="font-medium text-destructive">₹550</span>
              </div>
              <div className="h-px bg-border" />
              <div className="flex items-center justify-between">
                <span className="font-semibold">Zyro protection</span>
                <span className="font-bold text-[#00FF87]">₹485</span>
              </div>
            </div>
          </div>

          {/* Insight */}
          <div className="bg-gradient-to-br from-accent/5 to-primary/5 border border-accent/20 rounded-xl p-4">
            <h4 className="font-medium mb-2 text-accent">Smart Protection</h4>
            <p className="text-sm text-muted-foreground">
              Zyro's algorithm balanced your work profile, disruption severity,
              and platform data to calculate fair protection—automatically.
            </p>
          </div>
        </motion.div>

        {/* CTAs */}
        <div className="space-y-3">
          <Button
            onClick={() => navigate("/claim-details")}
            variant="outline"
            className="w-full h-12"
          >
            View Full Claim Details
          </Button>
          <Button
            onClick={() => navigate("/dashboard")}
            className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    </MobileContainer>
  );
}
