import { MobileContainer } from "../components/MobileContainer";
import {
  CloudRain,
  MapPin,
  Clock,
  TrendingDown,
  Shield,
  Smartphone,
  ChevronDown,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../components/ui/collapsible";

export function ClaimDetails() {
  const navigate = useNavigate();
  const [openSections, setOpenSections] = useState<string[]>(["event"]);

  const toggleSection = (section: string) => {
    setOpenSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section]
    );
  };

  return (
    <MobileContainer>
      <div className="px-6 py-8 pb-24">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate("/dashboard")}
            className="text-sm text-muted-foreground mb-4"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-bold mb-2">Claim Details</h1>
          <p className="text-sm text-muted-foreground">
            Complete breakdown of your claim
          </p>
        </div>

        {/* Status Banner */}
        <div className="bg-[#00FF87]/5 border border-[#00FF87]/20 rounded-xl p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#00FF87]/10 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-[#00FF87]" />
            </div>
            <div>
              <div className="font-semibold text-[#00FF87]">Paid</div>
              <div className="text-xs text-muted-foreground">
                Transaction ID: ZYR485291
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-[#00FF87]">₹485</div>
            <div className="text-xs text-muted-foreground">April 1, 2026</div>
          </div>
        </div>

        {/* Collapsible Sections */}
        <div className="space-y-3">
          {/* Event Details */}
          <Collapsible
            open={openSections.includes("event")}
            onOpenChange={() => toggleSection("event")}
          >
            <CollapsibleTrigger className="w-full bg-card border border-border rounded-xl p-4 flex items-center justify-between hover:bg-secondary/50 transition-colors">
              <div className="flex items-center gap-3">
                <CloudRain className="w-5 h-5 text-[#FF6B35]" />
                <span className="font-semibold">Event Details</span>
              </div>
              <ChevronDown
                className={`w-5 h-5 text-muted-foreground transition-transform ${
                  openSections.includes("event") ? "rotate-180" : ""
                }`}
              />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="bg-card border border-border border-t-0 rounded-b-xl p-4 -mt-1">
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Type</span>
                    <span className="font-medium">Heavy Rain</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Severity</span>
                    <span className="px-2 py-1 bg-[#FF6B35]/10 text-[#FF6B35] rounded-md text-xs font-medium">
                      High
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Duration</span>
                    <span className="font-medium">2.5 hours</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Start time</span>
                    <span className="font-medium">14:23 PM</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">End time</span>
                    <span className="font-medium">16:53 PM</span>
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Eligibility */}
          <Collapsible
            open={openSections.includes("eligibility")}
            onOpenChange={() => toggleSection("eligibility")}
          >
            <CollapsibleTrigger className="w-full bg-card border border-border rounded-xl p-4 flex items-center justify-between hover:bg-secondary/50 transition-colors">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-[#00FF87]" />
                <span className="font-semibold">Eligibility Checks</span>
              </div>
              <ChevronDown
                className={`w-5 h-5 text-muted-foreground transition-transform ${
                  openSections.includes("eligibility") ? "rotate-180" : ""
                }`}
              />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="bg-card border border-border border-t-0 rounded-b-xl p-4 -mt-1">
                <div className="space-y-3">
                  {[
                    "Activity match verified",
                    "Order drop detected (35%)",
                    "Coverage area confirmed",
                    "Duration threshold met",
                  ].map((check, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <div className="w-5 h-5 bg-[#00FF87]/10 rounded-md flex items-center justify-center">
                        <span className="text-[#00FF87] text-xs">✓</span>
                      </div>
                      <span>{check}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Fraud Check */}
          <Collapsible
            open={openSections.includes("fraud")}
            onOpenChange={() => toggleSection("fraud")}
          >
            <CollapsibleTrigger className="w-full bg-card border border-border rounded-xl p-4 flex items-center justify-between hover:bg-secondary/50 transition-colors">
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-accent" />
                <span className="font-semibold">Fraud Analysis</span>
              </div>
              <ChevronDown
                className={`w-5 h-5 text-muted-foreground transition-transform ${
                  openSections.includes("fraud") ? "rotate-180" : ""
                }`}
              />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="bg-card border border-border border-t-0 rounded-b-xl p-4 -mt-1">
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Confidence</span>
                    <span className="font-bold text-[#00FF87]">95% High</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      Behavioral pattern
                    </span>
                    <span className="font-medium">98%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      Device verification
                    </span>
                    <span className="font-medium">95%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      Location consistency
                    </span>
                    <span className="font-medium">92%</span>
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Calculation */}
          <Collapsible
            open={openSections.includes("calculation")}
            onOpenChange={() => toggleSection("calculation")}
          >
            <CollapsibleTrigger className="w-full bg-card border border-border rounded-xl p-4 flex items-center justify-between hover:bg-secondary/50 transition-colors">
              <div className="flex items-center gap-3">
                <TrendingDown className="w-5 h-5 text-primary" />
                <span className="font-semibold">Payout Calculation</span>
              </div>
              <ChevronDown
                className={`w-5 h-5 text-muted-foreground transition-transform ${
                  openSections.includes("calculation") ? "rotate-180" : ""
                }`}
              />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="bg-card border border-border border-t-0 rounded-b-xl p-4 -mt-1">
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Base rate</span>
                    <span className="font-medium">₹220/hour</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Duration</span>
                    <span className="font-medium">2.5 hours</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Raw calculation</span>
                    <span className="font-medium">₹550</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Coverage %</span>
                    <span className="font-medium">88%</span>
                  </div>
                  <div className="h-px bg-border" />
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Final payout</span>
                    <span className="font-bold text-[#00FF87]">₹485</span>
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* Timeline Summary */}
        <div className="mt-6 bg-gradient-to-br from-accent/5 to-primary/5 border border-accent/20 rounded-xl p-4">
          <h4 className="font-medium mb-3 text-accent">Processing Timeline</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Detected</span>
              <span>14:23</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Validated</span>
              <span>14:24</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Approved</span>
              <span>14:26</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Paid</span>
              <span>14:28</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-accent/20">
            <div className="flex items-center justify-between font-medium text-accent">
              <span>Total processing time</span>
              <span>5 minutes</span>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-background border-t border-border">
        <Button
          onClick={() => navigate("/dashboard")}
          className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground max-w-md mx-auto block"
        >
          Back to Dashboard
        </Button>
      </div>
    </MobileContainer>
  );
}
