import { useState, useEffect, useRef, useCallback } from "react";

const DEFAULT_SECONDS = 60;

export function useOTPTimer(initial = DEFAULT_SECONDS) {
  const [seconds, setSeconds] = useState(initial);
  const [canResend, setCanResend] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const tick = useCallback(() => {
    setSeconds((s) => {
      if (s <= 1) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setCanResend(true);
        return 0;
      }
      return s - 1;
    });
  }, []);

  useEffect(() => {
    intervalRef.current = setInterval(tick, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [tick]);

  const restart = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setSeconds(initial);
    setCanResend(false);
    intervalRef.current = setInterval(tick, 1000);
  }, [initial, tick]);

  return { seconds, canResend, restart };
}
