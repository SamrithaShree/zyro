import { useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import { useClaimStore } from "../store/useClaimStore";
import { toast } from "sonner";

interface NotificationPayload {
  type: "PAYOUT_SUCCESS" | "DISRUPTION_DETECTED" | "CLAIM_APPROVED";
  eventId: string;
  amount?: number;
  eventType?: string;
}

export function useNotificationHandler() {
  const navigate = useNavigate();
  const detectEvent = useClaimStore((s) => s.detectEvent);

  const handlePayload = useCallback(
    (payload: NotificationPayload) => {
      switch (payload.type) {
        case "PAYOUT_SUCCESS":
          toast.success(`₹${payload.amount} credited to your UPI!`);
          navigate(`/payout-success/${payload.eventId}`);
          break;
        case "DISRUPTION_DETECTED":
          detectEvent(
            payload.eventId,
            (payload.eventType as "RAIN") || "RAIN",
            "Anna Nagar"
          );
          navigate("/disruption-detected");
          break;
        case "CLAIM_APPROVED":
          toast.success("Claim approved! Processing payout...");
          navigate(`/payout-success/${payload.eventId}`);
          break;
      }
    },
    [navigate, detectEvent]
  );

  // Expose demo trigger to browser console
  useEffect(() => {
    (window as unknown as Record<string, unknown>).triggerDemoClaim = () => {
      const eventId = `EVT_DEMO_${Date.now()}`;
      handlePayload({
        type: "DISRUPTION_DETECTED",
        eventId,
        eventType: "RAIN",
      });
      console.log(
        "%c[Zyro Demo] Triggering rain disruption claim pipeline...",
        "color: #00E5FF; font-weight: bold"
      );
    };
    return () => {
      delete (window as unknown as Record<string, unknown>).triggerDemoClaim;
    };
  }, [handlePayload]);

  return { handlePayload };
}
