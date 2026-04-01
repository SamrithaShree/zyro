const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function verifyPlatformId(
  platform: string,
  riderId: string
): Promise<{ success: boolean; verifiedName: string }> {
  await delay(2000);
  if (!riderId || riderId.length < 4) {
    throw new Error("Invalid Rider ID. Please check and try again.");
  }
  return { success: true, verifiedName: `${platform} Rider #${riderId}` };
}
