// ─── Admin Metrics Adapter ────────────────────────────────────────────────
// Assembles UIAdminMetrics from multiple backend endpoints.
// GET /api/v1/dashboard/admin does NOT exist — we compose from:
//   GET /claims/summary   → basic totals
//   GET /events/active    → live events

export interface UIActiveEvent {
  event_id: string;
  zone: string;
  trigger_type: string;
  severity: number;
  affected_workers: number;
  start_time: string;
}

export interface UIAdminMetrics {
  // Claims
  total_claims: number;
  paid_claims: number;
  processing_claims: number;
  review_claims: number;
  total_payout: number;
  payout_ratio: number;     // 0–100

  // Fraud
  fraud_under_review: number;

  // Reserve pool (derived from claims data)
  reserve_utilization: number;  // 0–100+
  weekly_premium: number;
  weekly_payout: number;

  // Confidence distribution
  confidence_distribution: {
    HIGH: number;
    MEDIUM: number;
    REVIEW: number;
  };

  // Active events
  active_events: UIActiveEvent[];
}

const EMPTY_METRICS: UIAdminMetrics = {
  total_claims: 0,
  paid_claims: 0,
  processing_claims: 0,
  review_claims: 0,
  total_payout: 0,
  payout_ratio: 0,
  fraud_under_review: 0,
  reserve_utilization: 0,
  weekly_premium: 0,
  weekly_payout: 0,
  confidence_distribution: { HIGH: 0, MEDIUM: 0, REVIEW: 0 },
  active_events: [],
};

/**
 * Map from GET /claims/summary (flat ClaimSummary schema)
 */
export function mapClaimsSummary(summary: any): Partial<UIAdminMetrics> {
  if (!summary) return {};
  return {
    total_claims:        Number(summary.total_claims        ?? 0),
    paid_claims:         Number(summary.paid_claims         ?? 0),
    processing_claims:   Number(summary.processing_claims   ?? summary.total_claims - summary.pending_review ?? 0),
    review_claims:       Number(summary.pending_review      ?? 0),
    total_payout:        Number(summary.total_payout        ?? 0),
    fraud_under_review:  Number(summary.pending_review      ?? 0),
  };
}

/**
 * Map from GET /claims/me (array of claims — used for confidence distribution)
 */
export function mapClaimsForDistribution(claims: any[]): Pick<UIAdminMetrics, 'confidence_distribution' | 'paid_claims' | 'processing_claims' | 'review_claims'> {
  const dist = { HIGH: 0, MEDIUM: 0, REVIEW: 0 };
  let paid = 0, processing = 0, review = 0;

  for (const c of (claims ?? [])) {
    const lane = c.confidence_lane;
    if (lane === 'HIGH')   dist.HIGH++;
    if (lane === 'MEDIUM') dist.MEDIUM++;
    if (lane === 'REVIEW') dist.REVIEW++;

    if (c.status === 'PAID')       paid++;
    if (c.status === 'PROCESSING') processing++;
    if (c.status === 'REVIEW')     review++;
  }

  return { confidence_distribution: dist, paid_claims: paid, processing_claims: processing, review_claims: review };
}

/**
 * Map active events list from GET /events/active
 */
export function mapActiveEvents(raw: any): UIActiveEvent[] {
  const list = raw?.events ?? (Array.isArray(raw) ? raw : []);
  return list.map((e: any) => ({
    event_id:          String(e.event_id       ?? ''),
    zone:              String(e.zone           ?? '—'),
    trigger_type:      String(e.trigger_type   ?? '—'),
    severity:          Number(e.severity       ?? 1),
    affected_workers:  Number(e.affected_workers ?? 0),
    start_time:        String(e.start_time     ?? new Date().toISOString()),
  }));
}

/**
 * Merge all partial pieces into one UIAdminMetrics object.
 */
export function mergeMetrics(
  summary: Partial<UIAdminMetrics>,
  distribution: Pick<UIAdminMetrics, 'confidence_distribution' | 'paid_claims' | 'processing_claims' | 'review_claims'>,
  events: UIActiveEvent[],
  totalPayout: number
): UIAdminMetrics {
  const base = { ...EMPTY_METRICS, ...summary };
  const weeklyPremium = base.total_claims * 79; // approx average premium per claim

  const reserveUtil = weeklyPremium > 0
    ? Math.round((totalPayout / weeklyPremium) * 100)
    : 0;

  return {
    ...base,
    ...distribution,
    total_payout: totalPayout,
    payout_ratio: weeklyPremium > 0 ? Math.round((totalPayout / weeklyPremium) * 100) : 0,
    weekly_premium: weeklyPremium,
    weekly_payout: totalPayout,
    reserve_utilization: reserveUtil,
    active_events: events,
  };
}

// ─── UI helpers (pure, outside JSX) ─────────────────────────────────────────

export function reserveColor(util: number): string {
  if (util > 100) return '#FF6B35';
  if (util >= 80)  return '#F39C12';
  return '#00FF87';
}

export function confidenceLaneColor(lane: 'HIGH' | 'MEDIUM' | 'REVIEW'): string {
  switch (lane) {
    case 'HIGH':   return '#00FF87';
    case 'MEDIUM': return '#F39C12';
    case 'REVIEW': return '#FF6B35';
  }
}
