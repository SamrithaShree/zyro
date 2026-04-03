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

/** Mock: check whether a phone number has an existing account */
export async function checkUserExists(
  phone: string
): Promise<{ exists: boolean; name: string }> {
  await delay(800);
  // In the mock, any 10-digit number is treated as existing except 9999999999
  if (phone === "9999999999") return { exists: false, name: "" };
  return { exists: true, name: "Arjun Kumar" };
}

/** Mock: verify 4-digit MPIN — "0000" always fails for demo purposes */
export async function verifyMPIN(
  phone: string,
  pin: string
): Promise<{ success: boolean; token: string; name: string }> {
  await delay(900);
  console.log(`[Mock] MPIN verification for +91${phone}`);
  if (pin === "0000") throw new Error("Wrong PIN. Please try again.");
  return {
    success: true,
    token: `mock_signin_${phone}_${Date.now()}`,
    name: "Arjun Kumar",
  };
}

