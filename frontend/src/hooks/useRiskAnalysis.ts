import { useState, useCallback } from "react";
import { analyzeRisk, RiskResult } from "../services/mock/risk.mock";

export interface AnalysisStep {
  id: number;
  label: string;
  sublabel: string;
  color: string;
  done: boolean;
  active: boolean;
}

const STEPS: Omit<AnalysisStep, "done" | "active">[] = [
  {
    id: 1,
    label: "Checking Environmental Data…",
    sublabel: "Gate 1: Environment threshold",
    color: "#00E5FF",
  },
  {
    id: 2,
    label: "Matching Order Drop Signals…",
    sublabel: "Gate 2: Economic impact",
    color: "#FF6B35",
  },
  {
    id: 3,
    label: "Validating Work Activity…",
    sublabel: "Gate 3: Persistence check",
    color: "#9C27B0",
  },
  {
    id: 4,
    label: "Calculating Protection…",
    sublabel: "WIVE engine — loss estimation",
    color: "#00FF87",
  },
];

export function useRiskAnalysis() {
  const [steps, setSteps] = useState<AnalysisStep[]>(
    STEPS.map((s, i) => ({ ...s, done: false, active: i === 0 }))
  );
  const [result, setResult] = useState<RiskResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const runAnalysis = useCallback(
    async (incomeRange: string, zone: string) => {
      setAnalyzing(true);
      const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

      for (let i = 0; i < STEPS.length; i++) {
        setSteps((prev) =>
          prev.map((s, idx) => ({
            ...s,
            active: idx === i,
            done: idx < i,
          }))
        );
        await delay(1200);
        setSteps((prev) =>
          prev.map((s, idx) => ({
            ...s,
            done: idx <= i,
            active: idx === i + 1,
          }))
        );
      }

      const data = await analyzeRisk(incomeRange, zone);
      setResult(data);
      setAnalyzing(false);
    },
    []
  );

  return { steps, result, analyzing, runAnalysis };
}
