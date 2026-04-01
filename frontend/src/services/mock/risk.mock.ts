const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export interface RiskResult {
  estimatedDailyIncome: number;
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  coveragePercent: number;
  weeklyPremium: number;
  maxWeeklyPayout: number;
}

export async function analyzeRisk(
  incomeRange: string,
  zone: string
): Promise<RiskResult> {
  await delay(500);
  const incomeMap: Record<string, number> = {
    "300-500": 400,
    "500-800": 650,
    "800-1200": 1000,
    "1200+": 1400,
  };
  const base = incomeMap[incomeRange] || 650;
  return {
    estimatedDailyIncome: base,
    riskLevel: zone === "Anna Nagar" ? "MEDIUM" : "LOW",
    coveragePercent: 88,
    weeklyPremium: Math.round(base * 0.02),
    maxWeeklyPayout: Math.round(base * 5 * 0.88),
  };
}
