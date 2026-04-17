// ─── Claim Detail Adapter ──────────────────────────────────────────────────
// Maps GET /api/v1/claims/{id} response → typed, null-safe UIClaimDetail.
// Backend may return payout_amount OR final_payout — both handled.

export type ConfidenceLane = 'HIGH' | 'MEDIUM' | 'REVIEW';

export interface UIValidationBreakdown {
  policy_active: boolean;
  trigger_covered: boolean;
  zone_match: boolean;
  within_policy_window: boolean;
  working_hours_overlap: boolean;
  earning_intent_detected: boolean;
}

export interface UIClaimDetail {
  claim_id: string;
  status: string;
  final_payout: number;       // mapped from payout_amount OR final_payout
  estimated_loss: number;
  uncovered_loss: number;
  protection_ratio: number;
  explanation: string;
  why_eligible: string;

  confidence_lane: ConfidenceLane;
  confidence_score: number;
  risk_score_snapshot: number;

  created_at: string;
  processed_at?: string;

  validation_breakdown: UIValidationBreakdown;

  impact_reasoning: {
    final_impacted_hours: number;
  };
}

const VALID_LANES: ConfidenceLane[] = ['HIGH', 'MEDIUM', 'REVIEW'];

export function mapClaimDetail(api: any): UIClaimDetail {
  const vb = api.validation_breakdown ?? {};
  const ir = api.impact_reasoning ?? {};

  return {
    claim_id:         String(api.claim_id ?? ''),
    status:           String(api.status ?? 'PROCESSING'),
    // Accept either field name from backend
    final_payout:     Number(api.payout_amount ?? api.final_payout ?? 0),
    estimated_loss:   Number(api.estimated_loss ?? 0),
    uncovered_loss:   Number(api.uncovered_loss ?? 0),
    protection_ratio: Number(api.protection_ratio ?? 0),
    explanation:      String(api.explanation ?? ''),
    why_eligible:     String(api.why_eligible ?? ''),

    confidence_lane:  VALID_LANES.includes(api.confidence_lane)
                        ? api.confidence_lane
                        : 'REVIEW',
    confidence_score:     Number(api.confidence_score ?? 0),
    risk_score_snapshot:  Number(api.risk_score_snapshot ?? api.risk_score ?? 0),

    created_at:  String(api.created_at ?? new Date().toISOString()),
    processed_at: api.processed_at ?? undefined,

    validation_breakdown: {
      policy_active:          Boolean(vb.policy_active          ?? false),
      trigger_covered:        Boolean(vb.trigger_covered        ?? false),
      zone_match:             Boolean(vb.zone_match             ?? false),
      within_policy_window:   Boolean(vb.within_policy_window   ?? false),
      working_hours_overlap:  Boolean(vb.working_hours_overlap  ?? false),
      earning_intent_detected:Boolean(vb.earning_intent_detected?? false),
    },

    impact_reasoning: {
      final_impacted_hours: Number(ir.final_impacted_hours ?? 0),
    },
  };
}

// ─── Derived helpers (kept out of JSX) ────────────────────────────────────

export function coverageRatio(claim: UIClaimDetail): number {
  const denom = claim.final_payout + claim.uncovered_loss;
  return denom > 0 ? Math.round((claim.final_payout / denom) * 100) : 0;
}

export function laneColor(lane: ConfidenceLane): string {
  switch (lane) {
    case 'HIGH':   return '#00FF87';
    case 'MEDIUM': return '#F39C12';
    case 'REVIEW': return '#FF6B35';
  }
}

export function laneLabel(lane: ConfidenceLane): string {
  switch (lane) {
    case 'HIGH':   return 'Instant payout — highest confidence';
    case 'MEDIUM': return 'Delayed verification in progress';
    case 'REVIEW': return 'Under fraud review';
  }
}

export function statusColor(status: string): string {
  if (status === 'PAID')       return '#00FF87';
  if (status === 'ELIGIBLE' || status === 'PAYOUT_READY') return '#F39C12';
  return '#62B6CB';
}
