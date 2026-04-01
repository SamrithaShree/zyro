const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function verifyAadhaar(
  aadhaarNumber: string
): Promise<{ success: boolean; maskedNumber: string }> {
  await delay(1800);
  const last4 = aadhaarNumber.slice(-4);
  return { success: true, maskedNumber: `XXXX XXXX ${last4}` };
}

export async function verifyAadhaarOTP(
  otp: string
): Promise<{ success: boolean; trustBoost: number }> {
  await delay(1500);
  if (otp === "000000") throw new Error("Invalid Aadhaar OTP.");
  return { success: true, trustBoost: 15 }; // +15 trust score
}
