// ─── Policy Status Adapter ────────────────────────────────────────────────
// Maps GET /policies/status response data → flat, null-safe UIPolicy.
//
// Backend returns: GenericResponse { data: DashboardPolicyStatus }
// Caller in Dashboard does: raw = res.data?.data ?? res.data
// So this function receives the DashboardPolicyStatus object directly:
//   { has_active_policy, policy_details: PlanOption, remaining_cap, coverage_window }

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
  if (!raw.has_active_policy) return EMPTY;

  // policy_details is a PlanOption from backend
  const d = raw.policy_details ?? {};

  return {
    has_active_policy: true,
    tier:              String(d.tier             ?? ''),
    premium_amount:    Number(d.premium_amount   ?? 0),
    hourly_benefit:    Number(d.hourly_benefit   ?? 0),
    weekly_cap:        Number(d.weekly_cap       ?? 0),
    remaining_cap:     Number(raw.remaining_cap  ?? 0),
    coverage_window:   String(raw.coverage_window ?? ''),
    covered_triggers:  Array.isArray(d.covered_triggers) ? d.covered_triggers : [],
  };
}
