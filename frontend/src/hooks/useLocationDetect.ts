import { useState, useCallback } from "react";
import { detectLocation, LocationResult } from "../services/mock/location.mock";

interface UseLocationDetectResult {
  zone: LocationResult | null;
  loading: boolean;
  error: string | null;
  detect: () => Promise<void>;
}

export function useLocationDetect(): UseLocationDetectResult {
  const [zone, setZone] = useState<LocationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const detect = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await detectLocation();
      setZone(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Location detection failed");
    } finally {
      setLoading(false);
    }
  }, []);

  return { zone, loading, error, detect };
}
