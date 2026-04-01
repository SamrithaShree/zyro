const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function processPayment(
  wivedLoss: number,
  coveragePercent: number
): Promise<{ amount: number; upiRef: string; processedAt: string }> {
  await delay(1500);
  const amount = Math.round((wivedLoss * coveragePercent) / 100);
  return {
    amount,
    upiRef: `ZYR${Math.floor(Math.random() * 900000 + 100000)}`,
    processedAt: new Date().toISOString(),
  };
}
