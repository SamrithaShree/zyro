# Zyro

**AI-powered parametric income protection for food delivery gig workers — automatic trigger detection, worker-level impact validation, and instant payout with zero manual claims.**

---

## Problem Framing

Food delivery workers on platforms like Swiggy and Zomato face a specific financial risk that no existing insurance product addresses adequately: sudden, complete income loss caused by external disruptions beyond their control. A heavy rain event, a sudden curfew, a heatwave advisory, or a platform-side order outage can eliminate a worker's entire earning window in minutes.

Existing options fail this segment for clear structural reasons:

- Monthly insurance premiums do not match a weekly cash-flow cycle
- Manual claim filing takes days; income is lost in hours
- Proof-of-loss documentation is impractical for daily wage workers
- Most products cover accidents or health, not loss of income opportunity

Zyro addresses this gap directly. It is not a generalist gig insurance product. It is a focused, parametric income protection system designed specifically around how food delivery workers earn, where they operate, and what disruptions actually affect them.

---

## Why This Persona

Food delivery workers are the ideal initial segment for this problem for reasons that extend beyond size:

- **Digitally observable:** Workers operate through platform apps, generating real-time activity signals that can be used for both eligibility validation and fraud detection.
- **Geographically bounded:** Workers operate within predictable zone clusters, making hyperlocal trigger logic feasible.
- **Weekly income cycle:** Earnings are tracked and settled weekly on most platforms, making a weekly coverage window natural and product-aligned.
- **High disruption exposure:** Dense urban zones experience more weather extremes, traffic volatility, and local disruptions than any other delivery context.
- **Underserved at scale:** This segment numbers in the millions across India, with essentially zero structured income loss protection today.

Zyro focuses exclusively on two-wheeler-based delivery partners operating in high-density urban zones. This is not arbitrarily narrow — it is the tightest viable segment where parametric income protection is both technically tractable and financially sustainable.

---

## Coverage Scope

**Zyro covers:**

- Loss of earning opportunity caused by verified external disruptions
- Disruption types: heavy rain, flooding, extreme heat, severe air pollution, curfews, local strikes, sudden zone closures, platform-level order outages in a zone

**Zyro strictly excludes:**

- Health or medical coverage
- Life insurance or death benefit
- Accident or injury coverage
- Vehicle damage or repair
- Maintenance or equipment costs

This scope is not a limitation — it is the product's strength. Staying focused on income loss keeps the compliance surface narrow, the trigger logic precise, and the product story clear to both workers and insurers.

---

## Why Mobile-First

Delivery workers never interact from a desk. Their entire work context is a smartphone in motion. The product is designed accordingly:

- OTP-based onboarding in under two minutes, no paperwork
- Policy activation via UPI auto-debit without bank form filling
- Real-time disruption alerts and push notifications while on shift
- Payout confirmation directly on the lock screen
- Background telemetry for passive fraud validation without user action

A web dashboard exists for insurer analytics, admin operations, and compliance review. The worker-facing product is exclusively mobile.

---

## Product Overview

Zyro operates as a six-stage connected pipeline. Each stage has a defined input, defined processing logic, and a defined output that becomes the next stage's input. There are no loose handoffs.

```
Onboarding + Policy Recommendation (APRE-XAI)
          |
          v
Data Ingestion + Real-Time Monitoring
          |
          v
Parametric Trigger Decision Engine
          |
          v
Event Generation Engine (EGM)
          |
          v
Worker Impact Validation Engine (WIVE)
          |
          v
ZyroCredit: Claim, Payout, Payment Execution
```

The worker interacts only at onboarding and to view payouts. Everything between disruption detection and payout transfer is automatic.

---

## Weekly Premium Model

### Why Weekly

Delivery workers plan finances in 5–7 day cycles. Their income arrives weekly from the platform. A monthly premium is both harder to absorb and misaligned with their actual planning horizon. Weekly coverage also resets protection frequently, which means the worker is never far from their next coverage window.

### Premium Calculation Logic

The weekly premium is derived from five inputs:

| Input | Description |
|---|---|
| `weekly_income_estimate` | Estimated weekly income from activity data |
| `disruption_probability` | Probability of a qualifying disruption in the worker's zones this week |
| `expected_hours_lost` | Mean hours of earning opportunity expected to be lost per disrupting event |
| `replacement_fraction` | Partial income replacement ratio (capped at 0.7 for sustainability) |
| `loading_factor` | Covers insurer cost of capital, operations, and sustainability margin |

**Core formula:**

```
expected_weekly_loss = weekly_income_estimate × disruption_probability × (expected_hours_lost / weekly_hours)

base_premium = expected_weekly_loss × replacement_fraction × loading_factor

final_premium = clip(base_premium, min=₹19, max=₹149)
```

The clip function enforces affordability bounds. No worker pays more than ₹149/week regardless of risk score. No premium drops below ₹19 regardless of low exposure.

### Numerical Example

| Parameter | Value |
|---|---|
| Weekly income estimate | ₹5,000 |
| Disruption probability (rain zone) | 22% |
| Expected hours lost per event | 3.5 hours |
| Weekly working hours | 56 hours |
| Replacement fraction | 0.65 |
| Loading factor | 1.4 |

```
expected_weekly_loss = 5000 × 0.22 × (3.5 / 56) = ₹68.75

base_premium = 68.75 × 0.65 × 1.4 = ₹62.56

final_premium = clip(62.56, 19, 149) = ₹63/week
```

This worker pays ₹63/week and can receive up to ₹449 in a disruption event (payout is bounded by hourly benefit and weekly cap).

### Insurer Sustainability

The loading factor absorbs:
- Operational cost of the platform
- Reinsurance cost (production mode)
- Capital reserve contribution
- Fraud loss buffer

The weekly cap and partial replacement fraction ensure that even a correlated mass-disruption event (e.g., city-wide rain affecting 10,000 workers simultaneously) does not produce unbounded payout exposure. This is the structural difference between Zyro and naive parametric products.

### Policy Values Fixed at Activation

Once a weekly policy is activated, the following values are locked for the entire week:

- Weekly premium
- Hourly benefit
- Coverage tier (Basic / Standard / Premium)
- Weekly payout cap
- Covered trigger types

No mid-week re-pricing. No post-event recalculation. The contract is fixed.

---

## End-to-End Workflow

### Stage 1 — Onboarding and Policy Recommendation (APRE-XAI)

**Input:** Worker identity, platform ID, operating zones, active hours, recent earnings, income volatility, zero-income days, peak-hour participation, preferred covered triggers.

**Processing:**

1. The system constructs a worker risk profile from the collected inputs.
2. The Adaptive Policy Recommendation and Explainability Engine (APRE-XAI) runs risk segmentation and produces:
   - Recommended weekly premium (via the pricing formula above)
   - Recommended hourly benefit (proportional to income baseline and coverage tier)
   - Recommended coverage tier: Basic, Standard, or Premium
3. A plain-language reason is generated and shown to the worker.
4. Worker selects or adjusts the plan, activates via UPI, and is enrolled.

**Cold-Start Handling:**

New workers with no earnings history are handled with a cold-start protocol:
- Initial risk tier is set using zone-level historical disruption data and platform join-date heuristics
- Conservative benefit values are assigned
- Premium is bounded by the affordability floor
- As the worker builds activity history over 2–3 weeks, the model refines their profile at each renewal

**Output:** Active weekly policy with locked coverage parameters.

---

### Stage 2 — Data Ingestion and Real-Time Monitoring

**Purpose:** Continuous ingestion of multi-source disruption signals, transformed into a single trusted disruption signal for downstream logic.

**Signal Sources:**

| Category | Signal Type | Source |
|---|---|---|
| Environmental | Rainfall, flood alerts, heat index, AQI | IMD, OpenWeatherMap, CPCB AQI API |
| Kinetic telemetry | Heartbeat packets, speed bucket, motion signature | Mobile SDK (passive, background) |
| Mobility / Traffic | Congestion index, zone-level slowdown, route accessibility | Google Maps Platform, HERE Traffic |
| Platform activity | Active session, order availability, recent delivery activity | Simulated / mock platform feed (MVP) |

**Geospatial Layer — H3 Indexing:**

All zone logic uses Uber H3 hexagonal indexing at resolution 8–9 (approximately 450m–85m hex diameter). This enables:
- Hyperlocal disruption detection at the neighborhood level
- Precise worker-to-zone matching without overbroad city-level triggers
- Spatial smoothing across neighboring hex rings
- Fraud cluster detection across spatio-temporal patterns

**Degraded Mode:**

External APIs fail most often during severe weather — exactly when Zyro needs them most. The system handles this by:
- Maintaining a fallback priority list per signal type
- Substituting proxy signals when primary sources go down
- Reducing the confidence score of the disruption signal proportionally
- Continuing probabilistic validation without halting

A rain event at 3 AM taking out the weather API does not stop Zyro from detecting and validating the disruption through traffic and telemetry proxies.

**Output:** Verified Disruption Signal containing: `disruption_type`, `zone_h3_id`, `timestamp`, `severity`, `confidence_score`, `source_combination`, `degraded_mode_flag`.

---

### Stage 3 — Parametric Trigger Decision Engine

**Purpose:** Convert verified disruption signals into high-confidence trigger decisions while aggressively filtering false positives.

**Trigger Hierarchy:**

| Level | Examples | Path |
|---|---|---|
| Level 1 — Direct | Curfew, severe flooding, platform outage in active zone, complete zone closure | Fast-tracked, minimal validation required |
| Level 2 — Validated | Heavy rain, extreme heat, severe pollution, traffic-linked disruption | Full Tri-Gate validation required |
| Level 3 — Noise | Low-intensity, sub-threshold conditions | Filtered and discarded |

**Tri-Gate Validation Framework:**

- **Gate 1 — Environmental Detection:** Is the measured disruption value above the activation threshold for its category? (e.g., rainfall > 15mm/hr, AQI > 300, temperature > 43°C)
- **Gate 2 — Economic Impact Verification:** Is the earning opportunity in the zone actually reduced? Verified using proxy signals: order-drop rate, traffic slowdown index, demand reduction estimate, delivery latency anomaly. A rain event that does not reduce orders does not qualify.
- **Gate 3 — Temporal Persistence:** Has the disruption lasted long enough to constitute meaningful income loss? This prevents one-minute anomalies from triggering claims.

All three gates must clear before a trigger is confirmed.

**Hysteresis and Recovery Logic:**

The trigger does not end the moment one signal recovers. Recovery logic requires:
- Multiple signals to return to baseline
- A minimum recovery hold time
- No re-trigger within a minimum inter-event gap

This prevents flapping (trigger-end-trigger cycles), premature event closure, and under-compensation during recovery dips.

**Output:** Validated trigger status — passed to EGM.

---

### Stage 4 — Event Generation Engine (EGM)

**Purpose:** Convert validated trigger outputs into structured, immutable event objects that serve as the system-wide reference for claims, payouts, and analytics.

**Event Object:**

```
event_id, zone_h3_id, disruption_type, severity, status,
confidence_score, signal_composition, severity_timeline,
event_start_ts, event_end_ts, source_ids, traceability_refs
```

**Event Lifecycle:**

```
DETECTED → ACTIVE → STALE → ENDED → FINALIZED
```

Only FINALIZED events are used for claim creation and payout execution.

**Design Constraints:**

- One active event per zone at a time (event locking prevents duplicates)
- Overlapping disruption signals merge into a single composite event
- Spatial smoothing applies to target H3 cell plus its neighboring ring
- Retroactive timestamp handling for delayed or buffered data feeds

**Why This Matters:**

Without a structured event object, downstream modules could disagree on event duration, severity, or boundary — causing inconsistent payout amounts, duplicate claims, and audit failures. EGM is the system's single source of truth for every disruption event.

**Output:** Immutable FINALIZED event object.

---

### Stage 5 — Worker Impact Validation Engine (WIVE)

**Purpose:** Confirm that a specific worker actually lost earning opportunity due to a specific event. Zone-level disruption does not automatically mean every worker in the zone qualifies.

**Four Validation Pillars:**

1. **Geospatial Presence:** Was the worker's last confirmed location within the event's H3 cell or its neighboring ring during the event window?

2. **Temporal Overlap:** Did the worker's active session overlap with the event window for at least a minimum qualifying duration? (Prevents late-join exploitation and micro-claims from minimal exposure.)

3. **Work Intent and Activity State:** Was the worker in a valid earning state — either waiting for orders or mid-delivery and impacted? Workers who were offline, on break, or inactive by choice are excluded. Zyro insures loss of income opportunity, not physical presence in a zone.

4. **Policy Validation:** Did the worker have an active weekly policy that covers the specific trigger type at the time of the event?

**Effective Loss Ratio:**

WIVE computes the fraction of the event window that meaningfully overlapped with the worker's active, policy-covered earning window. This ratio is the `effective_loss_ratio` in the payout formula.

```
effective_loss_ratio = (qualifying_overlap_minutes) / (event_duration_minutes)
```

**Output:** Deterministic, auditable Eligibility Object — `eligibility_status`, `validation_flags`, `overlap_duration`, `effective_loss_ratio`.

---

### Stage 6 — ZyroCredit: Claim, Payout, and Payment Execution

**Purpose:** Convert eligible worker-event pairs into payout transfers. This stage is deterministic, idempotent, and financially bounded.

**Step 1 — Claim Creation:**

- Validate input (event must be FINALIZED, worker must be ELIGIBLE)
- Enforce uniqueness via composite key: `worker_id + event_id`
- Duplicate claim attempts return the existing claim (idempotent)
- Create and lock the claim object

**Step 2 — Payout Calculation:**

```
payout = hourly_benefit × event_duration_hours × severity_multiplier × effective_loss_ratio
```

Safety controls:
- `payout >= minimum_floor` (no micro-payouts below ₹50)
- `payout <= weekly_cap` (enforced per policy window)
- Partial replacement only — payout cannot exceed 70% of estimated income loss
- Payout is calculated once and locked. No recomputation after initial calculation.

**Step 3 — Payment Execution:**

- Payment transaction initialized per claim
- Executed via UPI ID, direct bank transfer, or wallet rail
- Safe retry logic (exponential backoff, max 3 retries within 15 minutes)
- Reconciliation job catches unresolved transactions
- One claim maps to exactly one payment transaction (idempotency enforced via Redis keys)

**Payment Stack:**

| Mode | Stack |
|---|---|
| MVP / Hackathon | Razorpay test mode, Stripe sandbox, mock UPI simulation |
| Production | Razorpay Payouts, Cashfree Payouts, bank transfer APIs |

---

## AI/ML Integration Map

AI is not a layer added on top of Zyro. It is embedded in specific decision points where rule-based logic alone is insufficient.

| Module | AI/ML Role | Model / Approach | Output | Why AI is Needed |
|---|---|---|---|---|
| APRE-XAI (Onboarding) | Premium prediction and risk segmentation | XGBoost regressor on worker behavioral features | Recommended premium, tier, and hourly benefit | Income patterns are nonlinear; zone-level risk interactions cannot be captured by flat rate tables |
| APRE-XAI (Onboarding) | Explainable recommendation | SHAP-style feature attribution | Plain-language reason for recommended plan | Workers will not trust a black-box price. Explainability builds adoption. |
| APRE-XAI (Cold Start) | New-user risk estimation | Cluster-based cold-start using zone and platform cohort | Temporary risk profile for new workers | No earnings history exists; ML must infer appropriate tier from cohort signals |
| Trigger Engine | Trigger confidence support | Gradient-boosted classifier on multi-signal input | Trigger confidence score per gate | Rule-based thresholds alone cannot handle sensor noise and API inconsistency |
| Trigger Engine | Economic impact estimation | Regression model on historical baseline vs. current signal | Estimated demand drop and latency anomaly | Gate 2 verification requires quantifying earning impact, not just detecting disruption |
| WIVE | Activity state classification | Lightweight classifier on kinetic and platform signals | Work intent label (active / inactive / ambiguous) | Platform feed may be delayed or incomplete; ML infers true activity state |
| Fraud Detection | Anomaly detection | Isolation Forest on claim-time behavioral features | Anomaly score per claim event | Rule-based fraud detection cannot handle novel attack vectors or coordinated behavior |
| Fraud Detection | Trust scoring | Gradient-boosted model updated incrementally per worker | Dynamic trust score (0–100) | Trust must evolve over time as workers build verified histories |
| Fraud Detection | Spatio-temporal cluster detection | DBSCAN-style clustering on claim coordinates and timestamps | Suspicious cluster flags | Coordinated fraud rings submit geographically dense, temporally synchronized claims |
| Analytics | Zone risk trend modeling | Time-series forecasting on historical disruption and claim data | Predicted disruption probability per zone per week | Insurers need forward-looking risk exposure, not just historical reporting |

---

## Fraud Detection and Anti-Spoofing Strategy

Parametric insurance is inherently more vulnerable to fraud than traditional insurance because the trigger is external and verifiable, but the worker's actual presence and state are not directly observable. GPS spoofing and session staging are the primary attack vectors.

Zyro's response is a multi-modal verification system that goes far beyond location checking.

**The Core Principle:**

The system does not ask: "Is the GPS coordinate inside the zone?"  
It asks: "Does the complete picture of this worker's state — motion, platform activity, device signals, historical behavior — look like a real worker who was genuinely impacted?"

**Anti-Spoofing Signal Stack:**

| Signal | What It Detects |
|---|---|
| Kinetic heartbeat signature | Physical motion pattern consistent with two-wheeler travel |
| Speed-to-motion correlation | Reported GPS speed matches inertial sensor motion |
| Device integrity flags | Device is not rooted, emulated, or running location mock apps |
| Platform activity feed | Worker account shows genuine active session, not staged activation |
| Session continuity | Worker was active before the event, not just during it |
| Network region consistency | IP/network region matches claimed GPS zone |
| H3 zone history | Worker has a prior visit history in this zone, not a first-time appearance |
| Spatio-temporal cluster analysis | Multiple claims do not originate from the same device, network, or tight spatial cluster |
| Historical trust score | Worker's cumulative record of verified, uncontested claims |

**Confidence-Based Action Model:**

| Confidence Level | Fraud Indicators | Action |
|---|---|---|
| High | None flagged, trust score strong | Instant payout |
| Medium | One or two weak anomalies, new profile | Soft quarantine — deferred to delayed processing lane |
| Low / Suspicious | Multiple strong anomaly flags | Claim rejected or escalated to fraud review queue |

**Fairness Constraint:**

Missing data is not treated as fraud. A worker with a dropped network connection during a rainstorm should not be penalized for data gaps. The system attributes missing signals to environmental cause first, and raises the anomaly score only when multiple independent signals are simultaneously suspicious.

**Trust Recovery:**

A medium-confidence flag does not permanently mark a worker. Trust scores recover through subsequent clean sessions. Workers can regain full fast-lane access over time, preventing the system from alienating legitimate workers after one ambiguous event.

**False Positive and False Negative Controls:**

- False positives (legitimate workers denied): Controlled by the soft quarantine lane and manual review queue, not outright rejection
- False negatives (fraudulent claims paid): Controlled by the multi-signal anomaly stack and cluster detection
- The system is calibrated to prefer false negatives over false positives during legitimate mass-disruption events, reversing the bias during low-disruption high-claim-rate scenarios

---

## Parametric Trigger Framework

**Covered Disruption Types:**

| Category | Examples | Trigger Source |
|---|---|---|
| Environmental | Heavy rain (>15mm/hr), flooding, extreme heat (>43°C), severe pollution (AQI >300) | IMD, OpenWeatherMap, CPCB AQI |
| Social / Administrative | Curfews, local strikes, sudden zone closures, market shutdowns | Government alert feeds, mobility signal drop |
| Operational | Platform-level order outage or delivery suspension in a zone | Platform activity feed, order-drop detection |

**What Activates a Trigger:**

Each trigger type has a defined threshold. Crossing the threshold alone is not sufficient — the Tri-Gate framework requires:
1. Environmental threshold breach
2. Measurable economic impact on worker earning opportunity
3. Persistence of the disruption for a minimum qualifying duration

**What Happens Immediately After Trigger Confirmation:**

1. EGM receives the validated trigger and creates a new event object
2. Zone is locked to prevent duplicate events from overlapping signals
3. All workers with active policies in the affected zone enter validation queue
4. WIVE runs eligibility checks in parallel
5. Eligible workers are flagged for claim creation

The worker receives a push notification: "Disruption detected in your zone. Your coverage is active."

---

## Integrations Architecture

| Integration | Where It Enters the Pipeline | What It Powers |
|---|---|---|
| OpenWeatherMap / IMD | Stage 2 — Data Ingestion | Rainfall, flood, heat threshold detection for Gate 1 |
| CPCB AQI API | Stage 2 — Data Ingestion | Pollution severity detection for Gate 1 |
| Google Maps / HERE Traffic | Stage 2 — Data Ingestion | Congestion index and zone-level slowdown for Gate 2 |
| Mobile SDK telemetry | Stage 2 — Data Ingestion | Kinetic heartbeat, speed bucket, device integrity for fraud detection and WIVE |
| Platform activity feed (simulated/mock) | Stage 2 — Data Ingestion | Active session state, order availability for Gate 2 and WIVE |
| H3 Spatial Library | Stages 2, 3, 4, 5 | Zone-level precision, event boundary management, fraud clustering |
| Razorpay / Cashfree (test or production) | Stage 6 — ZyroCredit | UPI payout, bank transfer execution |
| Firebase Cloud Messaging | Post-payout | Push notifications: disruption alert, payout confirmation |
| KYC / Identity (optional, production) | Stage 1 — Onboarding | Platform ID verification, delivery partner identity check |
| Redis | Stages 5, 6 | Idempotency keys, retry state, claim deduplication |

**MVP vs Production Distinction:**

In the hackathon prototype:
- Platform activity feed is simulated via a mock event generator
- Payment execution runs through Razorpay test mode or mock UPI rails
- KYC is bypassed with a simplified identity capture

In production:
- Platform API integration would be negotiated with aggregator relationships or a third-party data broker
- Payment executes through live Razorpay Payouts or Cashfree Payouts
- KYC integrates with DigiLocker or UIDAI Aadhaar-based verification

---

## Analytics Dashboard

The analytics system serves two distinct user groups with different informational needs.

### Worker Dashboard

The worker-facing dashboard gives delivery partners clear visibility into the real financial value of their policy.

**Key views:**

| Metric | Description |
|---|---|
| Active policy summary | Current plan, covered triggers, weekly premium, remaining weekly cap |
| Disruption history | List of events in their zones with status |
| Payout history | Amount, event date, trigger type, transfer status |
| Estimated income protected | Total payout received across policy windows |
| Estimated income lost vs. covered | Comparison of estimated loss to actual Zyro payout |
| Protection ratio | `payout_received / estimated_income_loss` — a simple measure of policy value |
| Recommended policy adjustment | Suggested plan upgrade or downgrade based on updated earnings history |
| Next renewal date and amount | Clear upcoming cost |

**"Saved vs Lost" View** (primary insight for retention):

> "This week, heavy rain cost you an estimated ₹900 in lost income. Zyro covered ₹620. Your uncovered loss was ₹280 — this is due to your weekly cap and partial replacement terms."

This view directly addresses the most common question workers have: "Is this policy actually helping me?"

### Insurer / Admin Dashboard

The insurer-facing dashboard supports operational oversight, risk management, and compliance audit.

**Key views:**

| Metric | Description |
|---|---|
| Active policies | Count and tier breakdown, renewal rate |
| Live disruption map | H3 heatmap of active events, severity, affected worker count |
| Trigger activity | Trigger-wise claim count, approval rate, average payout |
| Payout volume | Total payout per zone, per event, per time period |
| Payout-to-premium ratio | Overall and per-zone loss ratio |
| Fraud alert panel | Active anomaly flags, cluster detections, escalation queue size |
| Approval rate breakdown | By confidence tier, by disruption type |
| Workers protected per event | Eligible-to-enrolled ratio per disruption |
| Zone risk trends | Historical and projected disruption probability per zone |
| System health | API availability, degraded mode status, processing latency, retry queue depth |

During a crisis event:
- Dashboard updates in near-real-time
- Confidence tier distribution of active claims is visible
- Fraud cluster alerts appear immediately
- Payout exposure against reserve estimate is tracked

---

## Persona-Based Scenarios

### Scenario 1 — Ramesh, Swiggy partner, Bengaluru (Established worker)

**Profile:** 3 years on Swiggy, operates across Koramangala and Indiranagar, earns ₹900–1,100/day, works 10 hours. APRE-XAI detects moderate income volatility and high rain exposure across his zones. Recommended plan: **Standard — ₹63/week, ₹120 hourly benefit, ₹600 weekly cap.**

**Event:** Tuesday 6:30 PM. Rainfall hits 18mm/hr in his zone. Order volume drops 52% (Gate 2 confirmed). Event persists 2.8 hours (Gate 3 confirmed).

**Flow:**
1. EGM creates FINALIZED event for Indiranagar H3 cluster
2. WIVE confirms Ramesh was active and online across the full event window
3. `effective_loss_ratio = 1.0` (full overlap)
4. Payout: `120 × 2.8 × 1.2 (severity) × 1.0 = ₹403.20`
5. Weekly cap not breached
6. UPI transfer executes. Push notification received in 4 minutes.

**Worker sees:** "Zyro sent ₹403 to your UPI — heavy rain, 2.8 hours covered."

---

### Scenario 2 — Priya, Zomato partner, Chennai (High-disruption zone)

**Profile:** Operates in Anna Nagar. Frequent zero-income days due to local strikes and market closures. APRE-XAI flags high zone-closure exposure. Recommended plan: **Premium — ₹89/week, ₹150/hr, ₹750 cap, covering environmental + social disruptions.**

**Event:** Saturday 7:00 PM. Zone curfew declared. Level 1 direct trigger — fast-tracked without Gate 2 requirement. EGM creates event immediately.

**Flow:**
1. 38 workers in zone with active Premium or Standard plans enter validation
2. WIVE confirms Priya was active mid-delivery when curfew hit
3. Payout: `150 × 3.0 × 1.5 (curfew severity) × 0.88 = ₹594`
4. Weekly cap not breached
5. Batch UPI execution across all 38 eligible workers within 18 minutes

**Worker sees:** "Curfew in your zone. Payout of ₹594 is on the way."

---

### Scenario 3 — Arjun, new Zomato partner, Hyderabad (Cold-start worker)

**Profile:** Joined Zomato 10 days ago. No meaningful earnings history. APRE-XAI assigns cold-start tier using zone cohort data. Recommended plan: **Basic — ₹29/week, ₹80/hr, ₹320 cap.**

**Event:** Thursday 2:00 PM. Heat advisory triggers (44°C, sustained 2.1 hours). Arjun is active and in zone.

**Flow:**
1. Trust score is low but not suspicious — new profile, not anomalous
2. Claim routed through medium-confidence path (extra telemetry check)
3. Kinetic and session signals confirm presence and activity
4. Payout: `80 × 2.1 × 1.1 × 0.95 = ₹175.56`
5. Payment delayed by 22 minutes due to verification path — still resolves within the hour

**Worker sees:** "Heat alert confirmed. Payout of ₹175 sent — your identity verification will improve your plan over coming weeks."

---

## 24-Hour Market Shift: Crisis Handling

This section addresses the scenario where a sudden, city-scale disruption generates thousands of simultaneous claims within a short window. This is the highest-stakes test of any parametric insurance system.

### The Scenario

**Situation:** City-wide flash flooding at 7:00 PM on a Friday in a major metro. Three H3 zone clusters across the city are simultaneously affected. Approximately 2,400 delivery workers with active Zyro policies are operating in the affected zones at the time of onset.

---

### Step-by-Step System Response

**T+0 min:** Rainfall crosses threshold simultaneously in three H3 clusters. Ingestion layer detects signal from weather API, confirmed by traffic congestion spike (Gate 2) and order-drop signal from platform feed.

**T+8 min:** Gate 3 persistence confirmed. Tri-Gate validation completes for all three zones. Three validated trigger statuses produced.

**T+9 min:** EGM creates three separate FINALIZED event objects (one per zone cluster). Zone locking prevents duplicate events from sub-zone signal bursts and API retries.

**T+10 min:** 2,400 active workers enter WIVE validation queue. WIVE runs per-worker validation in stateless, horizontally scaled workers. Each worker's geospatial presence, temporal overlap, activity state, and policy status is checked independently.

**T+14 min:** WIVE produces eligibility objects for all 2,400 workers. 1,847 workers are eligible. 553 are excluded (offline, inactive, no active policy, or no zone overlap).

**T+15 min:** ZyroCredit queues 1,847 claim-payout pairs. Idempotency keys assigned to all pending claims.

**T+15 min — T+42 min:** Payment execution runs in batches of 200, with rate-limited gateway calls to avoid payment provider throttling. Redis retry queues handle transient failures.

**T+42 min:** First batch of payouts confirmed. Final batch completes at T+71 min. 98.2% of eligible claims paid within 75 minutes.

---

### Financial Sustainability During Surge

A mass-disruption event is also a mass-payout event. This is the fundamental correlated risk problem in parametric insurance. Zyro handles it through structural constraints:

**Payout exposure is pre-bounded:**
- Every policy has a weekly cap — the maximum any single worker can receive in one week
- The loading factor in the premium formula explicitly prices in the expected cost of correlated events
- Partial replacement limits payout to 70% of estimated income loss

**Capital reserve logic:**
- The loading factor (1.4 in the pricing model) builds a margin above pure expected loss
- This margin funds a reserve pool
- At hackathon stage: reserve is simulated as a fixed pool fraction
- At production stage: reinsurance contracts absorb correlated exposure above defined thresholds

**Example exposure calculation for the scenario above:**

| Parameter | Value |
|---|---|
| Eligible workers | 1,847 |
| Average payout per worker | ₹340 |
| Total payout required | ~₹6.28 lakh |
| Assuming weekly premium pool from same worker cohort | ~₹1.4 lakh |
| Reserve pool top-up required | ~₹4.88 lakh |

In production, this top-up is covered by the reserve pool and reinsurance trigger if total payout exceeds a predefined threshold percentage of the premium pool. This is a standard parametric reinsurance structure.

---

### Fraud Control During Surge

A mass-disruption event is also the highest-risk window for coordinated fraud. When thousands of claims arrive simultaneously, fraud rings attempt to submit claims that are indistinguishable from legitimate ones.

**Crisis mode fraud controls:**

- Confidence thresholds are automatically tightened during surge processing
- New accounts (< 2 weeks old) are automatically routed to medium-confidence path regardless of signal strength
- Spatio-temporal clustering runs continuously — accounts from the same device subnet or appearing in the zone for the first time during the event are flagged
- High-trust workers (trust score > 80) receive instant processing without additional scrutiny
- Medium-confidence claims (estimated 12–18% of total) are routed to a delayed lane and processed within 2–4 hours after primary surge

**Prioritization logic:**

1. High-trust, high-confidence workers — processed immediately in primary batch
2. Medium-trust, medium-confidence workers — delayed lane, same-night resolution
3. Low-confidence, anomaly-flagged workers — claim held for fraud team review within 24 hours

**System does not collapse:**

- Event objects are immutable after FINALIZED — downstream modules read without lock contention
- WIVE runs in a stateless, horizontally scaled compute pool — capacity scales with queue depth
- ZyroCredit batches payment execution to avoid payment gateway exhaustion
- Redis queue absorbs burst volume and provides back-pressure to prevent downstream flooding

---

### Post-Crisis Recalibration

After a major event:

- Zone disruption probability models are updated with the new event data
- Premium recalculation runs at the next weekly renewal for affected zone workers
- Workers in high-disruption zones may see minor premium increases at renewal
- Fraud review outcomes from the delayed lane feed back into trust score updates

---

## Tech Stack

**Frontend**
- React Native (iOS and Android, worker-facing mobile app)

**Backend**
- FastAPI (Python microservices for ML-heavy modules)
- Node.js / Fastify (event-driven services for ingestion and payout)

**Database**
- PostgreSQL + PostGIS (structured data, geospatial queries, policy and claim records)
- MongoDB (flexible event documents from EGM, audit logs)
- Redis (idempotency keys, retry queues, session caching, real-time telemetry buffer)

**Geospatial**
- Uber H3 library (hexagonal zone indexing, resolution 8–9)

**AI / ML**
- XGBoost / gradient-boosted trees (premium prediction, fraud scoring, trigger confidence)
- Isolation Forest (anomaly detection on claim-time behavioral features)
- DBSCAN (spatio-temporal cluster detection for fraud rings)
- SHAP-style feature attribution (explainability for policy recommendations and claim decisions)
- Lightweight time-series model (zone risk trend forecasting for insurer dashboard)

**APIs and Integrations**
- Weather: OpenWeatherMap, IMD feed
- Pollution: CPCB AQI API
- Traffic: Google Maps Platform, HERE Traffic
- Platform activity: Mock / simulated delivery platform feed (MVP)
- Payment: Razorpay test mode / Stripe sandbox (MVP) → Razorpay Payouts / Cashfree Payouts (production)
- Notifications: Firebase Cloud Messaging

**Event and Async Layer**
- Redis queue (MVP)
- Kafka-compatible architecture (production scaling)

---

## MVP vs Production Feasibility

| Component | MVP (Hackathon) | Production |
|---|---|---|
| Platform activity feed | Mock event generator | Negotiated API or data broker integration |
| Payment execution | Razorpay test mode / mock UPI | Live Razorpay Payouts / Cashfree Payouts |
| KYC / identity | Simplified capture form | DigiLocker / Aadhaar-based eKYC |
| Reinsurance | Reserve pool simulation | Structured parametric reinsurance contract |
| Mobile telemetry | Simulated heartbeat signals | Full mobile SDK with passive background collection |
| ML models | Trained on synthetic or historical open data | Retrained on live worker and claim data |
| Scale | Single-city simulation | Multi-city, horizontally scaled microservices |
| Compliance | Architecture documented | IRDAI sandbox path | IRDAI regulatory approval |

The hackathon submission explicitly demonstrates a credible production path, not just a prototype. Every mock or sandbox component has a defined production equivalent.

---

## Development Roadmap

**Phase 1 — Architecture and Concept (Current)**
- Complete system architecture across all six modules
- Persona definition, user journey, platform rationale
- Weekly pricing model with formula and numerical example
- Trigger framework with Tri-Gate validation design
- Fraud and anti-spoofing architecture
- Crisis scenario design
- README and documentation

**Phase 2 — Core Pipeline Prototype**
- Worker onboarding flow and policy creation (React Native)
- APRE-XAI premium recommendation engine (FastAPI + XGBoost)
- Data ingestion layer with live weather and traffic APIs
- Parametric trigger engine with Tri-Gate validation (Python)
- Claim creation pipeline and WIVE validation logic
- Mock payout execution (Razorpay test mode)

**Phase 3 — Execution, Fraud, and Dashboards**
- Fraud detection pipeline (Isolation Forest + trust scoring)
- Anti-spoofing signal stack with mobile SDK telemetry
- Worker dashboard: Saved vs Lost view
- Insurer analytics dashboard with live disruption map
- Load testing and surge simulation
- End-to-end demo with real API integration

---

## Key Differentiators

| What Zyro Does | Why It Matters |
|---|---|
| Worker-level impact validation (WIVE) | Zone-level disruption does not automatically pay everyone. Each worker's earning state is validated individually, preventing financial leakage. |
| Multi-modal anti-spoofing beyond GPS | Kinetic signature, device integrity, session continuity, and platform state together are far harder to fake than a GPS coordinate alone. |
| Tri-Gate trigger validation | Gates 2 and 3 specifically require economic impact and temporal persistence. This eliminates false triggers from brief or non-impactful disruptions. |
| Degraded-mode resilience | The ingestion layer continues probabilistic operation when external APIs fail — the most critical time for the system to keep working. |
| Policy-to-payout contract consistency | What the worker sees at onboarding is exactly what governs payout. No hidden re-pricing, no post-event recalculation. |
| Confidence-tiered payout lanes | High-trust workers get instant payouts. Suspicious claims are quarantined, not rejected. Workers are not punished for data gaps. |
| Structural payout exposure control | Weekly caps, partial replacement bounds, and a loading factor-built reserve prevent correlated mass-disruption events from causing platform insolvency. |
| H3 hyperlocal zone logic | Neighborhood-scale precision means a rain event in one district does not trigger payouts for workers five kilometers away. |
| Explainable AI recommendations | Workers see a plain-language reason for their premium. Insurers see feature attribution for fraud scores. Both sides trust the system more. |

---

## Risks and Safeguards

| Risk | Safeguard |
|---|---|
| External API failure during disruption | Degraded mode continues validation with reduced confidence; proxy signal substitution |
| Coordinated fraud during surge events | Spatio-temporal cluster detection; new account routing to medium-confidence path |
| Correlated mass-payout event | Weekly caps, partial replacement bounds, reserve pool, reinsurance framing |
| Cold-start worker miscategorization | Conservative tier assignment; recalibration after 2–3 weeks of activity |
| False trigger from brief anomaly | Gate 3 temporal persistence requirement eliminates sub-threshold duration events |
| Legitimate worker unfairly rejected | Soft quarantine lane and manual review before any final rejection; trust recovery path |
| Platform activity feed latency | Fallback to kinetic and traffic signals for activity inference |
| Payment gateway failure | Redis-backed retry queue with exponential backoff and reconciliation job |

---

## Compliance and Auditability Direction

Zyro is designed with regulatory readiness as a long-term architectural goal:

- Every claim decision is deterministic and traceable to source signals, policy parameters, and validation outputs
- Payout formulas are locked at policy activation — no post-event discretionary adjustment
- Eligibility objects from WIVE are immutable audit records
- Explainability layer in APRE-XAI satisfies draft IRDAI AI/ML guidelines for customer-facing decisions
- The production path includes an IRDAI Insurance Regulatory Sandbox application for a parametric income protection product

---

## Final Positioning

Zyro is the only system in this space specifically engineered around three constraints that traditional insurance cannot satisfy for gig workers: claims must be automatic because workers cannot file paperwork mid-shift; triggers must be hyperlocal because a disruption in one zone is irrelevant to a worker two kilometers away; and payout exposure must be structurally bounded because correlated weather events can affect thousands of workers simultaneously.

By combining worker-level impact validation, multi-modal anti-spoofing, Tri-Gate trigger confirmation, degraded-mode resilience, and explainable AI-driven pricing, Zyro turns an event that should cause a wage shock into a fast, predictable, automatic safety net. The architecture is designed to be built in phases, demonstrated in a prototype, and scaled into a regulated product — not a conceptual exercise, but a real system with a clear path from hackathon demo to production deployment.
