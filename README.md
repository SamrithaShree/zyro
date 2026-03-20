# Zyro

**Parametric income protection for food delivery partners — weekly-priced, AI-driven, zero paperwork, automatic payout.**

Zyro is purpose-built for one user: a Swiggy or Zomato delivery partner who loses income the moment heavy rain floods their zone, a curfew shuts down their area, or a platform outage kills order flow. When a verified disruption hits, Zyro detects it, confirms the worker was active and affected, and transfers a payout — without the worker filing anything.

This is not traditional insurance. There is no claim form. There is no adjuster. There is no waiting period. Zyro is a parametric income protection system where the trigger is objective, the payout is automatic, and the entire cycle from disruption to payment completes in under 90 minutes.

**What Zyro covers:** Loss of income opportunity caused by verified external disruptions.  
**What Zyro strictly excludes:** Health, life, accidents, vehicle damage, or any physical loss.  
**Pricing model:** Weekly — aligned to how delivery workers actually earn and plan.

---

## Problem Statement Compliance

This section maps Zyro's solution directly to the Guidewire DEVTrails 2026 requirements.

| Requirement | Zyro's Response |
|---|---|
| Single delivery partner sub-category | Food delivery partners (Swiggy / Zomato) — two-wheeler-based, urban, India |
| Coverage: income loss only | Zyro covers only loss of earning opportunity |
| Excluded: health, life, accidents, vehicle | Explicitly and architecturally excluded |
| Weekly pricing model | Premium calculated, activated, and renewed weekly |
| AI-powered risk assessment | APRE-XAI engine: XGBoost-based premium prediction, SHAP explainability, cold-start ML |
| Intelligent fraud detection | Multi-signal anomaly scoring, trust score evolution, duplicate prevention, cluster detection |
| Parametric automation | External signals trigger claims automatically — no manual filing |
| Integration capabilities | Weather APIs (IMD, OpenWeatherMap), traffic (Google Maps / HERE), mock platform feed, Razorpay payment gateway |
| Optimized onboarding | OTP login + AI plan recommendation in under 2 minutes on mobile |
| Policy creation with weekly pricing | Locked weekly contract: premium, benefit, cap, trigger types |
| Claim triggering through parametric events | Tri-Gate validation engine → automatic event creation → batch validation |
| Payout processing | ZyroCredit: deterministic, idempotent, UPI / bank transfer via Razorpay |
| Analytics dashboard | Dual-view: worker "Saved vs Lost" dashboard + admin disruption heatmap and fraud panel |
| Crisis / market shift scenario | Dedicated section with timestamped surge response, fraud tightening, financial controls |

---

## The Worker Zyro Is Built For

A Swiggy or Zomato delivery partner operating in a high-density Indian city looks like this in practice:

- Earns ₹700–1,200 per day, settled weekly by the platform
- Works 8–10 hours, entirely on a two-wheeler, entirely on a phone
- Has no fixed employer, no HR, and no structured financial safety net
- Loses income the same day a disruption hits — not gradually, immediately
- Cannot take two weeks to file insurance paperwork; they may not have a printer, a laptop, or a claims vocabulary
- Makes financial decisions in short cycles — "can I afford this week?" not "can I afford this year?"

When heavy rain shuts down their zone for 3 hours on a Friday evening, that is ₹300–500 gone. There is no mechanism that currently compensates that loss quickly. Most do not have emergency savings to absorb it. Most would benefit enormously from even a partial, fast payout.

**Why this persona is ideal for Zyro's first version:**

- Workers are digitally observable through platform apps — their activity state is a real signal
- They operate in geographically bounded zones — hyperlocal triggers are feasible
- Their income cycle is weekly — weekly coverage windows map naturally
- The disruption risk is concrete, frequent, and data-driven
- The scale is enormous: tens of millions of delivery partners across India, with near-zero income protection coverage today

Zyro starts with two-wheeler food delivery partners specifically because this segment is where the problem is sharpest, the signals are richest, and the product-market fit is most immediate.

---

## Why Mobile-First

**For the worker:** A delivery partner on a bike in the rain does not open a laptop. They need a phone app that is fast, simple, and works on a weak connection. Zyro's worker product is mobile because that is the only form factor their work context supports.

Key mobile-specific capabilities:
- OTP login — no username/password setup
- Plan activation via UPI auto-debit — no bank form, no NEFT details
- Push alerts when a disruption is detected in their zone
- Payout confirmation on the lock screen
- Background telemetry collection (passive, not intrusive) for eligibility and fraud validation

**For the insurer/admin:** Web dashboard for insurer analytics, risk oversight, fraud monitoring, and compliance audit. No operational use case for an insurer requires a mobile-only interface.

This split is intentional and product-correct. It is not a technical simplification — it is the right UX architecture for the two audiences.

---

## End-to-End Application Workflow

The complete flow from worker signup to payout transfer, from both the worker's and system's perspective.

### From the Worker's Perspective

| Step | What the Worker Does | What the Worker Sees |
|---|---|---|
| 1. Onboarding | Opens Zyro app, enters OTP, answers 6 questions | Fast, guided form on mobile |
| 2. Plan Recommendation | Reviews AI-suggested plan with plain-language explanation | "Recommended: Standard Plan — ₹63/week. Reason: rain-heavy zone, moderate income variability." |
| 3. Policy Activation | Selects plan, authorizes UPI auto-debit | Policy active. Coverage starts immediately. |
| 4. Disruption Monitoring | Nothing — system runs in background | Push notification: "Heavy rain detected in Koramangala. Your coverage is active." |
| 5. Automatic Claim | Nothing — system validates and creates claim | "Validating your eligibility for rain disruption..." |
| 6. Payout | Nothing — UPI transfer executes | "₹403 sent to your UPI — 2.8 hours of rain coverage." |
| 7. Dashboard | Reviews policy, payout history, protection ratio | "This week, Zyro protected ₹403 of an estimated ₹680 loss." |

**The worker does not file a claim. They never need to.**

### From the System's Perspective

```
1. Onboarding + Risk Profiling (APRE-XAI)
          |
2. Data Ingestion: environmental, traffic, telemetry, platform signals
          |
3. Parametric Trigger Decision Engine (Tri-Gate Validation)
          |
4. Event Generation Engine (EGM): creates FINALIZED event object
          |
5. Worker Impact Validation Engine (WIVE): confirms individual eligibility
          |
6. ZyroCredit: claim creation → payout calculation → payment execution
          |
7. Dashboard: updates worker view and admin analytics in near-real-time
```

Each stage has a defined input, defined processing logic, and defined output. There are no ambiguous handoffs.

---

## Module 1 — Onboarding and Policy Recommendation (APRE-XAI)

### What the Onboarding Collects

Onboarding is designed to complete in under 2 minutes on mobile.

**Required inputs:**
- Phone number (OTP verification)
- Delivery platform selection (Swiggy / Zomato / other)
- Primary operating city and zone(s)
- Approximate daily working hours

**Optional but improves recommendation:**
- Linked platform ID (for activity data enrichment)
- Typical daily income estimate
- Preferred disruption types to cover

**What the worker does not need to provide:**
- Bank account details (UPI ID only for payout)
- Physical documents at onboarding (simplified KYC; full eKYC in production)
- Income proof or employment letters

### How Plan Recommendation Works

The Adaptive Policy Recommendation and Explainability Engine (APRE-XAI) uses the collected inputs to:

1. Construct the worker's risk profile (income baseline, zone disruption exposure, income variability)
2. Run the weekly premium formula (see Weekly Premium Model)
3. Map the output to a plan tier: **Basic**, **Standard**, or **Premium**
4. Generate a plain-language explanation the worker can read and understand

**What the worker sees:**

> **Recommended: Standard Plan**  
> Weekly Premium: ₹63 | Hourly Benefit: ₹120 | Weekly Cap: ₹600  
> Covered: Heavy Rain, Extreme Heat, Severe Pollution, Curfews  
> Why: You operate in rain-heavy zones with moderate income variability. This plan balances cost and protection.  
> [Activate Standard Plan] [Compare All Plans]

The worker can accept the recommendation, select a different tier, or learn more. Plan activation triggers UPI payment setup.

### Policy Contract — Locked at Activation

Once activated, the following are fixed for the weekly window:

- Weekly premium amount
- Hourly benefit rate
- Coverage tier
- Weekly payout cap
- Covered trigger types

No mid-week re-pricing. No post-event recalculation. What the worker agreed to is what governs payout.

### Cold-Start Handling

New workers with no earnings history are not rejected or given a default-minimum plan. Instead:
- Zone-level historical disruption data and platform cohort patterns set a temporary risk profile
- Conservative benefit values are assigned
- The premium stays within the affordability floor
- After 2–3 weekly cycles, the profile is refined using real activity data

---

## Weekly Premium Model

### Why Weekly Pricing

Delivery workers settle their income weekly. Their financial decisions are weekly. A monthly premium is harder to commit to, harder to absorb in a bad week, and misaligned with how they think about money. A weekly premium is small, predictable, and resets protection every 7 days.

### The Premium Formula

```
expected_weekly_loss = weekly_income_estimate
                       × disruption_probability
                       × (expected_hours_lost / weekly_working_hours)

base_premium = expected_weekly_loss × replacement_fraction × loading_factor

final_premium = clip(base_premium, min=₹19, max=₹149)
```

**Input definitions:**

| Input | Description |
|---|---|
| `weekly_income_estimate` | Estimated from activity data or worker input |
| `disruption_probability` | Probability of a qualifying disruption in their zones this week |
| `expected_hours_lost` | Historical average hours lost per disruption event in the zone |
| `replacement_fraction` | Partial replacement cap — set at 0.65, never exceeds 0.70 |
| `loading_factor` | Covers platform operations, reserve contribution, and fraud buffer — set at 1.4 |

**Affordability clip:** No worker pays more than ₹149/week regardless of risk. No premium falls below ₹19 regardless of low exposure.

### Numerical Example

A Bengaluru worker earning ₹5,000/week in a rain-heavy zone:

```
expected_weekly_loss = 5000 × 0.22 × (3.5 / 56) = ₹68.75
base_premium         = 68.75 × 0.65 × 1.4       = ₹62.56
final_premium        = clip(62.56, 19, 149)       = ₹63/week
```

This worker pays ₹63/week. Their maximum weekly payout is capped at ₹600 (Standard tier).

### Why Payout Exposure Stays Bounded

Even in a city-wide disruption affecting 10,000 workers:
- Every policy has a weekly cap — no single worker can receive more than their tier maximum
- Partial replacement (max 70%) ensures payouts are not full income replacement
- The loading factor in the premium funds a reserve margin above pure expected loss
- Production deployment adds a reinsurance layer for correlated mass-disruption exposure

This is not a theoretical control — it is embedded in the formula and the policy contract.

---

## Parametric Trigger Framework

### Covered Disruption Types

| Category | Examples | Threshold / Signal Source |
|---|---|---|
| Environmental | Heavy rain, flooding, extreme heat, severe pollution | Rainfall > 15mm/hr; Temp > 43°C; AQI > 300 — IMD, OpenWeatherMap, CPCB |
| Social / Administrative | Curfews, local strikes, zone closures, market shutdowns | Government alert feeds; sharp mobility drop |
| Operational | Platform-level order outage in a zone | Order-drop detection > 50%; mock platform feed |

### Why Threshold Alone Is Not Enough

A trigger threshold breach — even a confirmed one — does not automatically mean a valid claim. A brief 5-minute rain spike does not meaningfully disrupt deliveries. A rain event in one city corner may not affect order flow in another. A heat advisory at 10 PM has no impact on a worker who finished their shift at 8 PM.

Zyro uses the **Tri-Gate Validation Framework** to ensure every trigger is:
1. Real (environmental signal confirmed)
2. Economically meaningful (earning opportunity actually reduced)
3. Persistent enough to matter (not transient noise)

### Tri-Gate Validation

- **Gate 1 — Environmental Detection:** Measured disruption crosses defined threshold for its type and zone.
- **Gate 2 — Economic Impact Verification:** Proxy signals confirm actual earning opportunity reduction. Checks: order-drop rate, traffic congestion index, demand reduction estimate, delivery latency anomaly. A disruption that does not demonstrably reduce orders does not proceed.
- **Gate 3 — Temporal Persistence:** The disruption must persist for a minimum qualifying duration. Prevents one-minute anomalies from becoming claims.

**Level 1 direct triggers** (curfew, complete zone closure, severe flood) skip Gate 2 and are fast-tracked to event creation. Level 2 triggers (rain, heat, pollution, traffic disruption) require all three gates.

### Hysteresis and Recovery

The trigger does not end when one signal briefly dips. Recovery logic requires multiple signals to return to baseline simultaneously, enforcing a minimum recovery hold time before the event closes. This prevents premature closure and under-compensation during recovery dips.

### After Trigger Confirmation

1. Event Generation Engine receives validated trigger
2. FINALIZED event object is created for the affected H3 zone
3. Zone is locked — one active event per zone prevents duplicates
4. All workers with active policies in the zone enter validation queue
5. Worker receives push: "Disruption confirmed in your zone. Coverage active."

---

## Worker Impact Validation Engine (WIVE)

**Most parametric insurance products would pay every worker in the disrupted zone. Zyro does not.**

Zone-level disruption is a necessary but not sufficient condition for payout. A worker who was offline, asleep, or on voluntary break during the event did not lose earning opportunity. Paying them would be financially wasteful, unfair to the insurer, and architecturally wrong.

WIVE is Zyro's answer to this problem. It answers a precise question:

**"Did this specific worker actually lose earning opportunity because of this specific event?"**

### Four Validation Checks

1. **Geospatial Presence** — Was the worker within the event's H3 zone or immediate neighboring ring during the event window?

2. **Temporal Overlap** — Did the worker's active session overlap with the event for a minimum qualifying duration? Prevents late-join exploitation and negligible-impact micro-claims.

3. **Work Intent and Activity State** — Was the worker in a valid earning state: waiting for orders or mid-delivery and disrupted? Workers who were offline by choice, on break, or inactive are excluded. Zyro covers the opportunity to work, not physical proximity.

4. **Policy Validation** — Did an active policy, covering this trigger type, exist at the time of the event?

### Effective Loss Ratio

WIVE computes the overlap fraction:

```
effective_loss_ratio = qualifying_overlap_minutes / event_duration_minutes
```

A worker who was active for 60% of a 2-hour event has an effective loss ratio of 0.6. This feeds directly into the payout formula, ensuring payout is proportional to actual exposure.

**Output:** Deterministic, auditable Eligibility Object — `eligibility_status`, `validation_flags`, `overlap_duration`, `effective_loss_ratio`. Every decision is traceable.

WIVE is a core innovation. Without it, Zyro would overpay and become financially unsustainable after the first major disruption event.

---

## Event Generation Engine (EGM)

Once a trigger is validated, EGM converts it into a structured, immutable event object that serves as the system-wide reference for all downstream operations.

**Why this matters:** Without a single, consistent event object, different modules could disagree on event duration, severity, or boundaries — causing inconsistent payouts, duplicate processing, and audit failures.

**Event object includes:** `event_id`, `zone_h3_id`, `disruption_type`, `severity`, `status`, `confidence_score`, `signal_composition`, `event_start_ts`, `event_end_ts`, `traceability_refs`

**Event lifecycle (strict state machine):**
```
DETECTED → ACTIVE → STALE → ENDED → FINALIZED
```

Only FINALIZED events are used for claim creation.

**Design rules:**
- One active event per zone (event locking)
- Overlapping signals merge into one composite event — no duplicates
- Spatial smoothing across target H3 cell and neighboring ring
- Retroactive timestamp handling for delayed data feeds

---

## AI/ML Integration

AI is used at specific decision points where rule-based logic either produces wrong answers or fails to generalize. Every AI insertion in Zyro has a clear justification.

### MVP — Core AI Components

| Role | Where Used | Approach | Why Rules Are Insufficient |
|---|---|---|---|
| Premium prediction | Onboarding (APRE-XAI) | XGBoost regressor on worker behavioral features | Income patterns and zone risk are nonlinear and interdependent |
| Plan explainability | Onboarding output | SHAP-style feature attribution | Workers and regulators need to understand why they received a specific price |
| Cold-start profile | New worker onboarding | Cohort clustering from zone and platform join-date | No individual history exists; inference from similar workers is needed |
| Activity state inference | WIVE validation | Lightweight classifier on kinetic and platform signals | Platform feed can be delayed; ML infers true work state from motion and session signals |
| Basic anomaly scoring | Fraud detection | Rule-enhanced anomaly scoring, lightweight Isolation Forest | Simple rules miss novel spoofing patterns and coordinated behavior |
| Trigger confidence support | Trigger engine | Gradient-boosted classifier on multi-signal input | Sensor noise and API inconsistency produce borderline signals that rules cannot resolve |

### Advanced — Production AI Components

| Role | Where Used | Approach |
|---|---|---|
| Fraud trust scoring | All claim events | Gradient-boosted model, updated incrementally per worker history |
| Spatio-temporal cluster fraud detection | ZyroCredit / fraud layer | DBSCAN-style clustering on claim location + timestamp |
| Zone risk trend forecasting | Insurer dashboard | Time-series model on historical disruption and claim data |
| Economic impact quantification | Gate 2 validation | Regression model comparing real-time signals to historical baselines |

**The principle:** AI is used where it matters. Premium pricing, fraud detection, and activity inference are genuinely nonlinear problems. Claim deduplication, event locking, and payout calculation are deterministic operations that rules handle correctly.

---

## Fraud Detection and Anti-Spoofing

Parametric insurance has a structural vulnerability: the trigger is external and objective, but the worker's presence and activity state must be inferred from signals. GPS coordinates can be spoofed. Sessions can be staged.

### MVP Fraud Controls (Hackathon Prototype)

These are implemented in the Phase 2 prototype:

- **Duplicate claim prevention:** `worker_id + event_id` composite key prevents double-processing
- **Zone overlap validation:** Worker location must match event H3 zone — not just city-level
- **Session continuity check:** Worker must have been active before the event began, not just during it
- **New account caution:** Workers with fewer than 2 weeks of history are auto-routed to medium-confidence path
- **Basic anomaly scoring:** Lightweight anomaly rules flag timing bursts and zone-first-appearance patterns
- **Policy existence check:** No policy = no claim, enforced before validation begins

### Advanced Anti-Spoofing (Production Layer)

These are defined in architecture and demonstrated as stubs in prototype, fully built in production:

| Signal | What It Detects |
|---|---|
| Kinetic heartbeat signature | Physical motion consistent with two-wheeler travel |
| Speed-to-motion correlation | GPS speed matches inertial sensor data |
| Device integrity flags | Device is not rooted or running location mock apps |
| Network region consistency | IP/network region matches claimed GPS zone |
| H3 zone history | Worker has prior visit history in this zone |
| Spatio-temporal cluster detection | Multiple accounts from same device/network subnet claiming simultaneously |
| Trust score evolution | Incremental ML model tracking lifetime claim reliability per worker |

### Confidence-Based Payout Routing

| Confidence Level | Condition | Action |
|---|---|---|
| High | Trust score strong, no anomaly flags | Instant payout — primary processing lane |
| Medium | New profile, one weak anomaly, or data gap | Deferred — delayed processing lane, resolved same night |
| Low / Suspicious | Multiple strong anomaly flags | Claim held — fraud review queue within 24 hours |

**Fairness rule:** Missing data is not treated as fraud. A weak network signal during a rainstorm is expected. Anomaly score increases only when multiple independent signals are simultaneously suspicious.

**Trust recovery:** Workers recover trust score through subsequent verified sessions. No permanent penalty from one ambiguous event.

---

## Integrations Architecture

| Integration | Pipeline Stage | What It Powers | MVP Status |
|---|---|---|---|
| OpenWeatherMap / IMD | Stage 2 — Ingestion | Rainfall, heat threshold for Gate 1 | Live API (MVP) |
| CPCB AQI API | Stage 2 — Ingestion | Pollution threshold for Gate 1 | Live API (MVP) |
| Google Maps / HERE Traffic | Stage 2 — Ingestion | Congestion index for Gate 2 | Live API (MVP) |
| Mobile SDK telemetry | Stage 2 — Ingestion | Kinetic heartbeat, device data for fraud + WIVE | Simulated in MVP |
| Platform activity feed | Stage 2 — Ingestion | Order availability, active session for Gate 2 | Mock generator (MVP) |
| H3 Spatial Library | Stages 2–5 | Zone precision, event boundaries, fraud clustering | Fully implemented |
| Razorpay (test mode) | Stage 6 — ZyroCredit | UPI payout, bank transfer execution | Test mode (MVP) |
| Firebase Cloud Messaging | Post-payout | Push notifications for disruption + payout | Integrated in prototype |
| DigiLocker / Aadhaar eKYC | Stage 1 — Onboarding | Identity verification | Production only |
| Redis | Stages 5–6 | Idempotency keys, retry state, claim deduplication | Fully implemented |

---

## Analytics Dashboard

### Worker Dashboard — "Saved vs Lost" View

The worker dashboard shows one primary thing: is this policy actually helping me?

| View | Content |
|---|---|
| Active policy | Plan, covered triggers, weekly cap remaining |
| This week's disruptions | Events in their zones, status (covered / not covered) |
| Payout history | Amount, event, transfer status, trigger type |
| Income protected | Total payout received across all policy weeks |
| Protection ratio | `payout / estimated_income_loss` — displayed as a percentage |
| Uncovered loss (honest) | Amount not covered due to cap or partial replacement — shown transparently |
| Next renewal | Date and auto-debit amount |

**Example worker summary:**

> "This week, heavy rain in your zone caused an estimated ₹680 in income loss. Zyro covered ₹403. Your remaining ₹277 was not covered due to your Standard plan's weekly cap. Renew your plan to stay protected next week."

The honesty of showing uncovered loss is intentional — it builds worker trust and motivates appropriate plan upgrades.

### Insurer / Admin Dashboard

| Metric | Description |
|---|---|
| Active policies | Count, tier distribution, weekly renewal rate |
| Live disruption map | H3 heatmap of active events, severity, affected worker count |
| Trigger activity | Trigger-wise claim volume, approval rate, average payout |
| Payout-to-premium ratio | Loss ratio per zone, per event, per period |
| Fraud alert panel | Active anomaly flags, cluster detections, escalation queue |
| Confidence tier distribution | % of claims in high / medium / low lane |
| Zone risk trends | Historical and projected disruption probability per zone |
| System health | API availability, degraded mode flag, processing latency |

During a crisis event, all of these metrics update in near-real-time, giving insurers full operational visibility.

---

## Persona-Based Scenarios

### Scenario 1 — Ramesh, Swiggy, Bengaluru (Established Worker)

Ramesh has been delivering for Swiggy for 3 years. He earns around ₹950/day, works 10 hours, and operates across Koramangala and Indiranagar — both high-rain-exposure zones. APRE-XAI recommends the **Standard Plan at ₹63/week** based on his income pattern and zone risk.

**What happens:** It is Tuesday evening, 6:30 PM. Rainfall hits 18mm/hr. Traffic in his zone spikes 70%. Order volume drops 52%. Gate 1, Gate 2, and Gate 3 all clear within 8 minutes.

**System response:** EGM creates a FINALIZED event. WIVE confirms Ramesh was active and in-zone for the full 2.8-hour event. Payout: `₹120 × 2.8 × 1.2 × 1.0 = ₹403`.

**What Ramesh experiences:** At 6:42 PM, he gets a push notification: "Heavy rain in your zone — coverage active." At 7:08 PM: "₹403 sent to your UPI." He checks the app and sees the payout on his dashboard.

He did not file anything. He received compensation faster than the rain event ended.

---

### Scenario 2 — Priya, Zomato, Chennai (Frequent Disruption Zone)

Priya operates near Anna Nagar, where local political events and market strikes are common. She has many zero-income days. APRE-XAI flags her high zone-closure exposure and recommends the **Premium Plan at ₹89/week**, covering both environmental and social disruptions.

**What happens:** Saturday 7:00 PM. A zone curfew is declared. This is a Level 1 direct trigger — no Gate 2 or Gate 3 required. EGM creates a FINALIZED event immediately.

**System response:** 38 workers with active Standard or Premium plans in the zone enter validation. WIVE confirms Priya was mid-delivery when the curfew hit. Payout: `₹150 × 3.0 × 1.5 × 0.88 = ₹594`.

**What Priya experiences:** Push at 7:04 PM: "Curfew declared — your coverage is active." By 7:22 PM, her UPI receives ₹594. "Zyro paid me before I even made it home."

---

### Scenario 3 — Arjun, Zomato, Hyderabad (New Worker)

Arjun joined Zomato 10 days ago. He has no meaningful earnings history. APRE-XAI's cold-start protocol assigns him a zone-cohort-derived risk profile and recommends the **Basic Plan at ₹29/week**.

**What happens:** Thursday 2 PM. A heat advisory triggers (44°C, sustained 2.1 hours). Arjun is in zone and active.

**System response:** Because Arjun is a new account, his claim routes through the medium-confidence path. Kinetic and session signals confirm he is genuinely active. Payout: `₹80 × 2.1 × 1.1 × 0.95 = ₹175`. Delayed by 22 minutes due to the verification path.

**What Arjun experiences:** Push at 2:08 PM: "Heat alert confirmed — verifying your eligibility." At 2:31 PM: "₹175 sent to your UPI." Dashboard note: "Your trust profile is building — faster payouts ahead."

---

## 24-Hour Market Shift: Crisis Handling

This section demonstrates Zyro's ability to handle the hardest scenario in parametric insurance: a sudden city-scale disruption generating thousands of simultaneous claims while fraud risk peaks and financial exposure must remain bounded.

### The Scenario

**7:00 PM, Friday, major Indian metro.** Flash flooding begins simultaneously across three H3 zone clusters. Approximately 2,400 delivery workers with active Zyro policies are working in these zones. This is peak earning time, peak claim risk, and peak fraud risk — simultaneously.

---

### Timeline: System Response

| Time | System Action |
|---|---|
| T+0 min | Rainfall crosses threshold. Weather API + traffic congestion spike + order-drop signal all ingested. |
| T+8 min | Gate 3 persistence confirmed across all three zones. Three validated trigger statuses produced. |
| T+9 min | EGM creates three FINALIZED event objects. Zone locking prevents sub-zone signal duplicates from creating redundant events. |
| T+10 min | 2,400 workers enter WIVE validation queue. WIVE runs per-worker checks in a stateless, horizontally scalable compute pool. |
| T+14 min | WIVE completes. 1,847 workers eligible; 553 excluded (offline, inactive, uncovered, no zone overlap). |
| T+15 min | ZyroCredit queues 1,847 claim-payout pairs. Idempotency keys assigned. |
| T+15–42 min | Payment executes in batches of 200 with rate-limited gateway calls. Redis retry queue handles transient failures. |
| T+42–71 min | First batch through final batch confirmed. 98%+ of eligible claims paid within 75 minutes. |

---

### Financial Controls During Surge

**Why the system does not overpay:**
- Every policy has a weekly cap. Maximum per-worker payout for the Standard tier is ₹600.
- Partial replacement (max 70%) is enforced per policy — not overridden during surge events.
- The loading factor in the premium formula was designed to price in correlated disruption events.

**Exposure calculation for this scenario:**

| Parameter | Value |
|---|---|
| Eligible workers | 1,847 |
| Average payout | ~₹340 |
| Total payout required | ~₹6.28 lakh |
| Weekly premium pool from this cohort | ~₹1.4 lakh |
| Reserve pool draw required | ~₹4.88 lakh |

In hackathon mode, this reserve is simulated. In production, a parametric reinsurance treaty would cover correlated exposure beyond a defined threshold of the premium pool.

**Post-crisis recalibration:** Zone disruption probability models update after the event. Workers in affected zones may see minor premium increases at next weekly renewal. Fraud review outcomes feed back into trust score updates.

---

### Fraud Controls During Surge

A mass-disruption event is the highest-value fraud target: thousands of legitimate claims provide cover for coordinated fraudulent ones.

**Crisis-mode fraud response:**
- Confidence thresholds are tightened automatically when claim volume exceeds baseline by 3x or more
- New accounts (< 2 weeks old) route to medium-confidence regardless of signal quality
- Spatio-temporal cluster detection runs continuously — same device subnet or zone-first-appearance flags are escalated immediately
- High-trust workers (trust score > 80) process without additional scrutiny

**Three-lane prioritization:**
1. **Primary lane** — High-trust, high-confidence workers: instant payment within the first 42 minutes
2. **Delayed lane** — Medium-confidence workers: resolved within 2–4 hours
3. **Review queue** — Anomaly-flagged workers: fraud team review within 24 hours; claim held

---

### What the Worker Sees During Crisis

- Push notification within minutes of event FINALIZED
- Status updates through app: "Detected → Validating → Processing → Paid"
- No action required
- If in delayed lane: "We are verifying your eligibility — payout expected within 4 hours"
- Payout notification with event details when complete

### What the Admin/Insurer Sees

- Live H3 heatmap lighting up across affected zones in near-real-time
- Event confidence scores, affected worker counts, validation progress
- Fraud alert panel showing cluster detection results and escalations
- Reserve pool exposure tracker: running total payout vs. available reserve margin
- Lane distribution: % of claims in primary / delayed / review queue
- System health: API availability, processing latency, queue depth during surge

---

## Why Zyro Can Actually Be Built

This is a prototypable system, not a theoretical architecture.

**What makes it buildable now:**
- Weather, pollution, and traffic APIs are publicly available (OpenWeatherMap, IMD open data, Google Maps, HERE Traffic)
- Razorpay test mode supports mock UPI payout flows without regulatory approval
- H3 is an open-source library (Uber) with Python, JavaScript, and PostGIS integrations
- XGBoost and Isolation Forest are standard ML frameworks with well-documented documentation
- React Native handles both iOS and Android from a single mobile codebase
- FastAPI supports rapid iteration for ML-serving microservices
- PostgreSQL + PostGIS handles geospatial data without specialized infrastructure

**What is simulated in the prototype:**
- Platform activity feed: mock event generator producing active session and order-availability signals
- Mobile telemetry: simulated heartbeat and motion signals (full mobile SDK in production)
- KYC: simplified identity capture form (DigiLocker eKYC in production)

**What the prototype can credibly demonstrate without production-level integrations:**
- Complete onboarding and plan recommendation flow
- Live trigger detection with real weather and traffic APIs
- End-to-end claim pipeline using simulated worker + mock event data
- Payout simulation via Razorpay test mode
- Worker and admin dashboards rendering live data from the pipeline

Every production-stage component has a defined mock equivalent in the prototype. The architecture is the same; the data sources are simulated where necessary.

---

## What We Will Demonstrate in the Hackathon Prototype

| Capability | Status |
|---|---|
| Mobile onboarding (OTP + AI plan recommendation) | Built in Phase 2 |
| Weekly policy creation and UPI activation | Built in Phase 2 |
| Live weather + traffic trigger monitoring | Live API integration in Phase 2 |
| Tri-Gate parametric trigger engine | Built in Phase 2 |
| Mock platform activity feed | Simulated in Phase 2 |
| Worker Impact Validation Engine (WIVE) | Built in Phase 2 |
| Event Generation Engine with lifecycle | Built in Phase 2 |
| Claim creation with idempotency | Built in Phase 2 |
| Payout simulation (Razorpay test mode) | Integrated in Phase 2 |
| Worker "Saved vs Lost" dashboard | Built in Phase 3 |
| Admin disruption heatmap and fraud panel | Built in Phase 3 |
| Crisis surge simulation (scripted scenario) | Demonstrated in Phase 3 |
| Basic fraud anomaly scoring | Built in Phase 3 |
| XGBoost-based premium recommendation | Built in Phase 2 |

---

## Tech Stack

| Layer | Technology | Rationale |
|---|---|---|
| Mobile app | React Native | Cross-platform (iOS + Android), single codebase, fast development |
| Backend services | FastAPI (Python) | ML model serving, data processing; async performance |
| Event services | Node.js / Fastify | High-throughput event ingestion and payout orchestration |
| Primary database | PostgreSQL + PostGIS | Structured records, geospatial queries, policy and claim storage |
| Document store | MongoDB | Flexible EGM event documents, audit logs |
| Cache / Queue | Redis | Idempotency keys, retry queues, telemetry buffer, real-time state |
| Geospatial indexing | Uber H3 | Hexagonal zone logic at resolution 8–9 (~85–450m precision) |
| ML — Premium / Fraud | XGBoost, Isolation Forest | Premium prediction, anomaly scoring; well-validated in fintech |
| ML — Clustering | DBSCAN | Spatio-temporal fraud cluster detection |
| Explainability | SHAP-style attribution | Policy recommendation transparency for workers and regulators |
| Payment | Razorpay (test/production) | UPI payout, bank transfer — India-native, widely integrated |
| Push notifications | Firebase Cloud Messaging | Real-time worker alerts and payout confirmations |
| Weather | OpenWeatherMap, IMD | Gate 1 environmental threshold detection |
| Pollution | CPCB AQI API | Gate 1 pollution threshold |
| Traffic | Google Maps Platform, HERE | Gate 2 economic impact verification |
| Async scaling | Kafka-compatible (production) | Redis queue for MVP; Kafka for multi-city production scale |

---

## MVP vs Production Feasibility

| Component | MVP (Hackathon Prototype) | Production |
|---|---|---|
| Platform activity feed | Mock event generator | Negotiated delivery platform API or third-party data broker |
| Payment execution | Razorpay test mode, mock UPI | Live Razorpay Payouts, Cashfree Payouts |
| Worker telemetry | Simulated heartbeat and motion signals | Full mobile SDK with passive background collection |
| KYC / Identity | Simplified form with phone OTP | DigiLocker / Aadhaar-based eKYC |
| ML models | Trained on synthetic or open historical data | Retrained on live worker and claim data |
| Reinsurance | Reserve pool simulated as fixed fraction | Parametric reinsurance contract with defined exposure triggers |
| Scale | Single-city scenario | Multi-city, horizontally scaled microservices |
| Compliance | Architecture documented, IRDAI sandbox path identified | IRDAI regulatory sandbox application |

---

## Development Roadmap

**Phase 1 — Foundation (Current)**
- Complete system architecture across all six modules
- Persona research and product strategy
- Weekly premium formula with numerical validation
- Tri-Gate trigger framework definition
- Fraud detection architecture — MVP and advanced layers
- Crisis handling scenario design
- README and concept documentation

**Phase 2 — Core Prototype**
- React Native mobile app: onboarding, plan recommendation, policy activation
- APRE-XAI engine: XGBoost premium prediction + SHAP explainability
- Data ingestion: live weather, traffic, and AQI APIs
- Trigger engine: Tri-Gate validation with mock platform feed
- EGM: event lifecycle management
- WIVE: worker eligibility validation logic
- ZyroCredit: claim creation + Razorpay test-mode payout
- Basic fraud controls: deduplication, zone validation, session continuity

**Phase 3 — Execution and Showcase**
- Advanced fraud detection: Isolation Forest anomaly scoring, trust score model
- Worker dashboard: Saved vs Lost view, payout history
- Insurer admin dashboard: disruption heatmap, fraud panel, loss ratio
- Crisis surge simulation: scripted flood scenario with live pipeline
- Load testing and end-to-end demo with real APIs

---

## Key Differentiators

| Differentiator | Why It Matters |
|---|---|
| Worker Impact Validation Engine (WIVE) | Pays workers who were actually active and affected — not everyone in the zone. Prevents financial leakage and unfair overcompensation. |
| Tri-Gate Trigger Validation | Requires environmental evidence, economic impact confirmation, and temporal persistence before any event is valid. Eliminates false triggers from noise. |
| Degraded-mode resilience | The ingestion layer continues operation when external APIs fail — the most critical time for the system to function. |
| Bounded payout architecture | Weekly caps, partial replacement limits, and loading factor reserve prevent correlated mass-disruption events from causing financial collapse. |
| Confidence-tiered payout lanes | High-trust workers receive instant payouts. Questionable claims are quarantined, not rejected. Workers are not punished for data gaps. |
| H3 hyperlocal zone logic | Neighborhood-scale precision. A disruption 2 kilometers away does not trigger payouts in an unaffected zone. |
| Policy-to-payout contract consistency | What the worker agreed to at onboarding governs payout exactly. No post-event recalculation, no hidden re-pricing. |
| Explainable AI recommendations | Workers understand their premium. Insurers have feature attribution for every fraud score. Neither side faces a black box. |

---

## Compliance and Auditability

Zyro is designed with regulatory readiness as an explicit architectural property:

- Every claim decision traces to source signals, policy parameters, WIVE validation outputs, and ZyroCredit execution — fully auditable
- Policy values are locked at activation and cannot be changed mid-week
- WIVE eligibility objects are immutable records
- APRE-XAI recommendations include human-readable explanations aligned with draft IRDAI AI/ML guidelines for customer-facing financial decisions
- Production path includes an IRDAI Insurance Regulatory Sandbox application for parametric income protection

---

## Final Positioning

Zyro is not another weather insurance concept. It is a complete, architecturally coherent parametric income protection system, built around three insights that most insurance products never address for gig workers:

**First:** Claims must be automatic because a delivery worker mid-shift cannot file paperwork. The trigger, the validation, and the payout must all happen without any worker action.

**Second:** Triggers must be hyperlocal. A rain event in one zone is not equivalent to a rain event in a neighboring zone, and zone-level eligibility never justifies paying every worker within a broad radius. WIVE validates individual impact — not aggregate presence.

**Third:** Payout exposure must be structurally bounded. When 2,000 workers claim in the same 75-minute window, the system must remain financially viable. Weekly caps, partial replacement, loading factors, and reinsurance framing are not afterthoughts — they are embedded in the product's mathematical foundation.

Zyro is prototype-ready, implementation-phased, and production-legible. The architecture is credible for a hackathon demo and coherent as a long-term regulated product. The worker it is built for earns weekly, moves fast, and cannot wait for traditional insurance to catch up. Zyro was designed specifically so they do not have to.
