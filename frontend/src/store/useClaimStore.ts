import { create } from "zustand";
import { persist } from "zustand/middleware";
import { makePersistConfig } from "./middleware/persist";

export type ClaimStatus =
  | "IDLE"
  | "DETECTED"
  | "VALIDATING"
  | "PROCESSING"
  | "APPROVED"
  | "PAID"
  | "UNDER_REVIEW";

export type EventType = "RAIN" | "HEAT" | "POLLUTION" | "CURFEW";

export interface GateResult {
  gate1: boolean; // Environment
  gate2: boolean; // Economic Impact (order drop)
  gate3: boolean; // Persistence (duration)
}

interface ClaimState {
  status: ClaimStatus;
  eventId: string;
  eventType: EventType | null;
  amount: number;
  wivedLoss: number; // WIVE engine estimated loss
  confidence: number; // 0–100
  gateResults: GateResult;
  timestamps: Partial<Record<ClaimStatus, string>>;
  zone: string;
  duration: number; // hours
  orderDropPercent: number;

  // Actions
  detectEvent: (
    eventId: string,
    eventType: EventType,
    zone: string
  ) => void;
  setStatus: (status: ClaimStatus) => void;
  setValidated: (gateResults: GateResult, confidence: number) => void;
  setProcessed: (orderDropPercent: number, duration: number, wivedLoss: number) => void;
  setPaid: (amount: number) => void;
  setUnderReview: () => void;
  reset: () => void;
}

const initialState = {
  status: "IDLE" as ClaimStatus,
  eventId: "",
  eventType: null as EventType | null,
  amount: 0,
  wivedLoss: 0,
  confidence: 0,
  gateResults: { gate1: false, gate2: false, gate3: false },
  timestamps: {},
  zone: "",
  duration: 0,
  orderDropPercent: 0,
};

const ts = () => new Date().toISOString();

export const useClaimStore = create<ClaimState>()(
  persist(
    (set) => ({
      ...initialState,

      detectEvent: (eventId, eventType, zone) =>
        set((s) => ({
          eventId,
          eventType,
          zone,
          status: "DETECTED",
          timestamps: { ...s.timestamps, DETECTED: ts() },
        })),

      setStatus: (status) =>
        set((s) => ({
          status,
          timestamps: { ...s.timestamps, [status]: ts() },
        })),

      setValidated: (gateResults, confidence) =>
        set((s) => ({
          gateResults,
          confidence,
          status: "VALIDATING",
          timestamps: { ...s.timestamps, VALIDATING: ts() },
        })),

      setProcessed: (orderDropPercent, duration, wivedLoss) =>
        set((s) => ({
          orderDropPercent,
          duration,
          wivedLoss,
          status: "PROCESSING",
          timestamps: { ...s.timestamps, PROCESSING: ts() },
        })),

      setPaid: (amount) =>
        set((s) => ({
          amount,
          status: "PAID",
          timestamps: { ...s.timestamps, APPROVED: ts(), PAID: ts() },
        })),

      setUnderReview: () =>
        set((s) => ({
          status: "UNDER_REVIEW",
          timestamps: { ...s.timestamps, UNDER_REVIEW: ts() },
        })),

      reset: () => set(initialState),
    }),
    makePersistConfig<ClaimState>("claim", 1, (state) => ({
      status: state.status,
      eventId: state.eventId,
      eventType: state.eventType,
      amount: state.amount,
      wivedLoss: state.wivedLoss,
      confidence: state.confidence,
      gateResults: state.gateResults,
      timestamps: state.timestamps,
      zone: state.zone,
      duration: state.duration,
      orderDropPercent: state.orderDropPercent,
    }))
  )
);
