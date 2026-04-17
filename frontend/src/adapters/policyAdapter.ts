// ─── Policy Status Adapter ────────────────────────────────────────────────
// Maps GET /policies/status response → flat, null-safe UIPolicy.

export interface UIPolicy {
  has_active_policy: boolean;
  tier: string;
  premium_amount: number;
  hourly_benefit: number;
  weekly_cap: number;
  remaining_cap: number;
  coverage_window: string;
  covered_triggers: string[];
}

const EMPTY: UIPolicy = {
  has_active_policy: false,
  tier:              '',
  premium_amount:    0,
  hourly_benefit:    0,
  weekly_cap:        0,
  remaining_cap:     0,
  coverage_window:   '',
  covered_triggers:  [],
};

export function mapPolicyStatus(raw: any): UIPolicy {
  if (!raw) return EMPTY;

  // Handle both wrapped {data:{...}} and flat shapes
  const outer = raw?.data ?? raw;
  if (!outer?.has_active_policy) return EMPTY;

  const d = outer.policy_details ?? {};

  return {
    has_active_policy: true,
    tier:              String(d.tier             ?? ''),
    premium_amount:    Number(d.premium_amount   ?? 0),
    hourly_benefit:    Number(d.hourly_benefit   ?? 0),
    weekly_cap:        Number(d.weekly_cap       ?? 0),
    remaining_cap:     Number(outer.remaining_cap ?? 0),
    coverage_window:   String(outer.coverage_window ?? ''),
    covered_triggers:  Array.isArray(d.covered_triggers) ? d.covered_triggers : [],
  };
}
