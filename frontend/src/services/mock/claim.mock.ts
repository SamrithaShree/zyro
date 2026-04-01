import { EventType } from "../../store/useClaimStore";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export interface ClaimRecord {
  eventId: string;
  eventType: EventType;
  date: string;
  amount: number;
  status: "PAID" | "UNDER_REVIEW";
  zone: string;
  duration: number;
}

export async function fetchClaimHistory(): Promise<ClaimRecord[]> {
  await delay(1200);
  return [
    {
      eventId: "EVT001",
      eventType: "RAIN",
      date: "2026-04-01",
      amount: 485,
      status: "PAID",
      zone: "Anna Nagar",
      duration: 2.5,
    },
    {
      eventId: "EVT002",
      eventType: "POLLUTION",
      date: "2026-03-28",
      amount: 320,
      status: "PAID",
      zone: "Anna Nagar",
      duration: 1.8,
    },
    {
      eventId: "EVT003",
      eventType: "HEAT",
      date: "2026-03-21",
      amount: 0,
      status: "UNDER_REVIEW",
      zone: "Adyar",
      duration: 3.0,
    },
  ];
}

export async function fetchActiveClaim(): Promise<ClaimRecord | null> {
  await delay(800);
  return null;
}
