const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export interface LocationResult {
  zone: string;
  city: string;
  lat: number;
  lng: number;
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
}

export async function detectLocation(): Promise<LocationResult> {
  await delay(2200);
  return {
    zone: "Anna Nagar",
    city: "Chennai",
    lat: 13.0827,
    lng: 80.2707,
    riskLevel: "MEDIUM",
  };
}
