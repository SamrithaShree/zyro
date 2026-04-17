// ─── Claim Adapter ─────────────────────────────────────────────────────────
// Maps raw backend claim objects to UI-safe, typed structures.
// Backend uses payout_amount → UI uses final_payout.

export type ConfidenceLane = 'HIGH' | 'MEDIUM' | 'REVIEW';

export interface UIClaim {
  claim_id: string;
  final_payout: number;   // mapped from backend: payout_amount
  estimated_loss: number;
  uncovered_loss: number;
  protection_ratio: number;
  status: string;
  confidence_lane: ConfidenceLane;
  explanation: string;
  created_at: string;
}

const VALID_LANES: ConfidenceLane[] = ['HIGH', 'MEDIUM', 'REVIEW'];

export function mapClaims(apiClaims: any[]): UIClaim[] {
  return (apiClaims || []).map((c) => ({
    claim_id:        String(c.claim_id ?? ''),
    final_payout:    Number(c.payout_amount ?? 0),   // ← KEY MAPPING
    estimated_loss:  Number(c.estimated_loss ?? 0),
    uncovered_loss:  Number(c.uncovered_loss ?? 0),
    protection_ratio: Number(c.protection_ratio ?? 0),
    status:          String(c.status ?? 'PROCESSING'),
    confidence_lane: VALID_LANES.includes(c.confidence_lane)
      ? c.confidence_lane
      : 'REVIEW',
    explanation:     String(c.explanation ?? ''),
    created_at:      String(c.created_at ?? new Date().toISOString()),
  }));
}

// ─── Derived stats (no business logic in JSX) ─────────────────────────────

export interface ClaimStats {
  totalSaved: number;
  totalLost: number;
  protectionRatio: number; // 0–100, never NaN
  totalEstimatedLoss: number;
}

export function computeClaimStats(claims: UIClaim[]): ClaimStats {
  const totalSaved = claims
    .filter((c) => c.status === 'PAID')
    .reduce((s, c) => s + c.final_payout, 0);

  const totalLost = claims.reduce((s, c) => s + c.uncovered_loss, 0);
  const totalEstimatedLoss = claims.reduce((s, c) => s + c.estimated_loss, 0);

  const denominator = totalSaved + totalLost;
  const protectionRatio = denominator > 0
    ? Math.round((totalSaved / denominator) * 100)
    : 0;

  return { totalSaved, totalLost, protectionRatio, totalEstimatedLoss };
}

// ─── Confidence lane styling helpers ─────────────────────────────────────────

export function laneColor(lane: ConfidenceLane): string {
  switch (lane) {
    case 'HIGH':   return '#00FF87';
    case 'MEDIUM': return '#F39C12';
    case 'REVIEW': return '#FF6B35';
  }
}

export function laneBg(lane: ConfidenceLane): string {
  switch (lane) {
    case 'HIGH':   return 'bg-[#00FF87]/15 text-[#00FF87]';
    case 'MEDIUM': return 'bg-[#F39C12]/15 text-[#F39C12]';
    case 'REVIEW': return 'bg-[#FF6B35]/15 text-[#FF6B35]';
  }
}
