const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function sendOTP(phone: string): Promise<{ success: boolean }> {
  await delay(1200);
  console.log(`[Mock] OTP sent to +91${phone}`);
  return { success: true };
}

export async function verifyOTP(
  phone: string,
  otp: string
): Promise<{ success: boolean; token: string; name: string }> {
  await delay(1500);
  if (otp === "000000") {
    throw new Error("Invalid OTP. Please try again.");
  }
  return {
    success: true,
    token: `mock_token_${phone}_${Date.now()}`,
    name: "Arjun",
  };
}

export async function signup(
  name: string,
  phone: string
): Promise<{ success: boolean }> {
  await delay(1000);
  console.log(`[Mock] Signup for ${name} (${phone})`);
  return { success: true };
}
