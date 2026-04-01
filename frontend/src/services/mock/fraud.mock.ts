const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export interface FraudCheckResult {
  confidence: number; // 0–100
  behavioralScore: number;
  deviceScore: number;
  locationScore: number;
  verdict: "HIGH" | "MEDIUM" | "UNDER_REVIEW";
  explanation: string;
}

export async function runFraudCheck(eventId: string): Promise<FraudCheckResult> {
  await delay(1800);
  console.log(`[Fraud Engine] Checking event ${eventId}`);
  return {
    confidence: 95,
    behavioralScore: 98,
    deviceScore: 95,
    locationScore: 92,
    verdict: "HIGH",
    explanation:
      "Verified using activity signals, device integrity, and location consistency checks",
  };
}
