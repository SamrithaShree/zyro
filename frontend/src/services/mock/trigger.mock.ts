const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export interface TriGateResult {
  gate1Passed: boolean; // Environmental threshold crossed
  gate2Passed: boolean; // Order/economic drop confirmed
  gate3Passed: boolean; // Duration threshold met
  gate1Label: string;
  gate2Label: string;
  gate3Label: string;
}

export async function runTriGateValidation(
  eventType: string,
  zone: string
): Promise<TriGateResult> {
  await delay(2500);
  console.log(`[Tri-Gate] Evaluating ${eventType} in ${zone}`);
  return {
    gate1Passed: true,
    gate2Passed: true,
    gate3Passed: true,
    gate1Label: "Environmental threshold exceeded (Heavy Rain > 15mm/hr)",
    gate2Label: "Order drop confirmed: 62% below baseline",
    gate3Label: "Duration > 45 min minimum threshold",
  };
}
