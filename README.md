<p align="center"><img src="https://raw.githubusercontent.com/SamrithaShree/zyro/main/assets/zyro-logo.png" width="300" alt="Zyro Logo"></p>

# Zyro

**Parametric income protection for food delivery partners - weekly-priced, trigger-driven, designed for automatic payout without the worker filing anything.**

> Zyro is a Phase 1 hackathon concept and architecture submission for Guidewire DEVTrails 2026.
> A working prototype is under active development. Sections labelled *Advanced / Production* are architecture-defined but not yet implemented.

---
## Quick Navigation

- [Problem Context](#problem-context)
- [Who Zyro Is Built For](#who-zyro-is-built-for)
- [Research and Data Justification](#research-and-data-justification)
- [Solution Overview](#solution-overview)
- [End-to-End System Workflow](#end-to-end-system-workflow)
- [Onboarding Flow](#onboarding-flow)
- [Weekly Premium Model](#weekly-premium-model)
- [Parametric Trigger Framework](#parametric-trigger-framework)
- [AI/ML Integration](#aiml-integration)
- [Fraud Prevention and Validation](#fraud-prevention-and-validation)
- [Payout Logic](#payout-logic)
- [Risk Governance and Force Majeure](#risk-governance-and-force-majeure)
- [Financial Resilience Model](#financial-resilience-model)
- [Crisis / Market-Shift Scenario](#crisis--market-shift-scenario)
- [Dashboard Views](#dashboard-views)
- [Platform Choice](#platform-choice)
- [Tech Stack](#tech-stack)
- [MVP vs. Advanced Architecture](#mvp-vs-advanced-architecture)
- [Development Plan](#development-plan)
- [Problem Statement Compliance](#problem-statement-compliance)
- [Key Differentiators](#key-differentiators)
- [Future Scope](#future-scope)
- [Closing Summary](#closing-summary)

---

## Problem Context

India has an estimated 12 million food delivery workers on platforms like Swiggy and Zomato. They are digitally observable, geographically bounded, and paid on weekly settlement cycles. They are also almost entirely without income protection.

When heavy rain shuts down a zone for three hours on a Friday evening, a delivery partner loses Rs. 300–500 from their weekly settlement — immediately. They cannot file a claim form mid-shift. They do not have a claims vocabulary, a printer, or an HR desk. And no current product compensates that loss in any timeframe that is useful to them.

Traditional insurance is structurally incompatible with this worker: monthly commitment cycles, paper-based processes, and claims resolution that takes weeks. The problem is not that good products exist but workers do not know about them — it is that no suitable product exists at all for this segment.

Zyro is designed to address this gap with a parametric approach: the trigger is external and objective, the payout is calculated automatically, and the worker does not take any action.

---

## Who Zyro Is Built For

### Financial Profile

| Metric | Typical Value |
|---|---|
| Daily earnings | Rs. 700 – 1,200 |
| Weekly income (settled by platform) | Rs. 4,900 – 8,400 |
| Monthly fuel and vehicle maintenance costs | Rs. 3,000 – 5,500 |
| Monthly smartphone EMI | Rs. 800 – 1,800 |
| Monthly micro-loan repayment | Rs. 1,500 – 3,500 |
| Total fixed monthly obligations (estimated) | Rs. 5,300 – 10,800 |
| Liquid savings buffer | Rs. 0 – 2,000 (typically under one week's income) |
| Working hours per day | 8 – 10 hours, two-wheeler, phone-dependent |

*Figures drawn from NITI Aayog gig worker reports, Swiggy/Zomato partner program public disclosures, and platform-based earnings reporting in consumer finance research.*

### Why a Single Disruption Creates Cascading Risk

A three-hour rain disruption on a peak evening removes Rs. 300-500 from the weekly settlement. For a worker whose fixed obligations consume Rs. 5,000-10,000 per month, and whose liquid buffer is near zero, this is not a manageable setback. A single disruption can lead to a missed smartphone EMI payment, which triggers a late fee, which compounds into a micro-loan default the following week. There is no HR desk to advance salary. There is no employer to absorb the gap.

### Income Risk: Delivery Worker vs. Salaried Employee

| Factor | Food Delivery Partner | Salaried Employee |
|---|---|---|
| Income when disruption hits | Drops to zero immediately | Unaffected |
| Recovery mechanism | None | Paid leave, employer cover |
| Financial safety net | None to minimal | EPF, ESI, group insurance |
| Ability to file an insurance claim mid-disruption | Practically impossible | Standard HR process |
| Time to receive any compensation | Weeks to never, under traditional insurance | Often immediate |
| Estimated disruption days per monsoon month | 4-6 | Rare |

---

## Research and Data Justification

Zyro's trigger thresholds are drawn from published government data - not set by internal assumption.

| Source | Authority | Data Used | Why This Threshold |
|---|---|---|---|
| IMD Rainfall Records | India Meteorological Department | Rainfall > 15 mm/hr classified as heavy rain | IMD's own urban rainfall classification; above this threshold, road saturation and reduced visibility materially affect two-wheeler delivery feasibility |
| CPCB AQI Database | Central Pollution Control Board | AQI > 400 = Severe band; GRAP-IV activates at AQI > 450 | CPCB's own six-tier index; above 400, CPCB recommends avoiding outdoor physical exertion |
| NITI Aayog Gig Economy Report | NITI Aayog, 2022 | 7.7 million gig workers; < 5% have income protection | Establishes market size and protection gap |
| CAQM GRAP Framework | Commission for Air Quality Management | GRAP-IV bans and commercial vehicle restrictions | Legal basis for zone closure triggers; LCVs and two-wheelers restricted first |
| NDMA Urban Flood Guidelines | National Disaster Management Authority | Rainfall thresholds for traffic advisories | Secondary validation of the 15 mm/hr threshold |
| Platform Settlement Disclosures | Swiggy / Zomato partner program | Weekly settlement cycles, per-order earnings bands | Validates the weekly premium model's alignment with actual income timing |

### Why the Thresholds Are Operationally Grounded

**15 mm/hr (rainfall):** Below this level, surface flooding is localised and two-wheeler movement is mildly restricted but largely manageable. Above it, road saturation levels and platform-side demand collapse combine to produce a measurable drop in delivery earnings. The 15 mm/hr mark is not a Zyro choice — it is IMD's own "heavy rain" classification used in urban weather advisories.

**AQI 400 (pollution):** This is the boundary between the "Very Poor" and "Severe" bands in CPCB's index. At Severe and above, CPCB explicitly recommends avoiding outdoor physical activity. A delivery worker on a two-wheeler for eight hours at AQI 400+ faces genuine health risk, and platform-side demand in the same area also drops as customers reduce outdoor orders.

---

## Solution Overview

Zyro works in five steps from the worker's perspective:

1. **Onboard once.** The worker downloads the app, verifies via OTP, answers a short form about their platform, zone, and earnings, and activates a weekly plan via UPI auto-debit. This is designed to complete in under two minutes on a mobile device.

2. **Coverage is active weekly.** Each week, a small premium is deducted automatically. The policy parameters — premium, payout rate, weekly cap, covered trigger types — are fixed at activation and do not change during the week.

3. **The system monitors continuously.** Weather, air quality, traffic, and platform demand signals are ingested in real time. The worker does nothing.

4. **When a verified disruption hits, the system validates automatically.** It confirms the disruption is real (environmental), economically meaningful (demand impact), and sustained (not transient). It then checks whether this specific worker was active and in the affected zone.

5. **Payout transfers to UPI.** If the worker passes eligibility checks, the payout is calculated and sent. The worker receives a push notification. No paperwork, no claim form, no follow-up needed.

This is the core value proposition: a delivery partner earns money all week with their phone in their pocket, and if a disruption hits, Zyro handles the entire protection cycle without them needing to do anything.

---

## End-to-End System Workflow

```
Step 1 — Onboarding and Risk Profiling
  Worker completes OTP login and a short onboarding form.
  APRE-XAI engine builds a risk profile from zone, income band, and activity history.
  Output: recommended plan tier with a plain-language explanation.
          |
Step 2 — Policy Subscription
  Worker selects plan and authorises UPI auto-debit.
  Policy contract locked for the week: premium, hourly benefit rate,
  weekly payout cap, and covered trigger types.
  No mid-week changes. No post-event recalculation.
          |
Step 3 — Continuous Data Ingestion
  Environmental: IMD / OpenWeatherMap (rainfall, temperature), CPCB AQI.
  Economic: Google Maps / HERE traffic congestion index.
  Working-state proxy: platform order-volume signals (mocked in prototype).
  Worker state: mobile SDK motion signals (lightweight in prototype; full SDK in production).
  All streams ingested per H3 zone into the Trigger Decision Engine.
          |
Step 4 — Parametric Trigger Detection (Tri-Gate Validation)
  Gate 1: Environmental threshold crossed and confirmed?
  Gate 2: Economic impact confirmed? (order-drop proxy, congestion spike)
  Gate 3: Disruption persistent for qualifying minimum duration?
  Level 1 events (curfew, complete zone closure) fast-track Gate 2 by design.
  Output: validated trigger status, per H3 zone.
          |
Step 5 — Event Object Creation (EGM)
  Event Generation Engine creates a FINALIZED, immutable event object.
  One active event per zone — overlapping signals merge, no duplicates.
  Workers with active, matching policies enter the WIVE validation queue.
          |
Step 6 — Individual Worker Validation (WIVE)
  Per-worker checks:
    - Geospatial: was the worker in the affected H3 zone?
    - Temporal: did their active session overlap the event window?
    - Work state: were they in an earning-intent state, not voluntarily offline?
    - Policy: is there an active policy covering this trigger type?
  Output: Eligibility Object with effective_loss_ratio per worker.
          |
Step 7 — Fraud Scoring
  Rule-layer checks: duplicate claim prevention, new-account flags, zone-visit history.
  Anomaly scoring: lightweight isolation forest on behavioural signals.
  Motion check: GPS vs. motion signal consistency (prototype: basic; full kinetic SDK: production).
  Output: confidence tier per worker - High, Medium, or Review.
          |
Step 8 — Payout Execution (ZyroCredit)
  High-confidence: UPI transfer executes immediately.
  Medium-confidence: deferred 2–4 hours for secondary verification, no rejection.
  Review lane: claim held pending manual fraud review within 24 hours.
  Idempotency keys prevent double execution.
  Redis retry queue handles transient payment gateway failures.
          |
Step 9 — Dashboard Update and Post-Event Recalibration
  Worker dashboard: payout confirmed, protection ratio updated.
  Admin dashboard: event log, loss ratio, fraud flag status, reserve pool draw.
  Post-event: zone disruption probability inputs updated for next renewal cycle.
```

---

## Onboarding Flow

Onboarding is designed to complete in under two minutes on a mobile device, with no documents required upfront.

### What the Worker Provides

**Required fields:**
- Phone number (OTP verification — no password setup)
- Delivery platform (Swiggy, Zomato, or other)
- Primary city and operating zone(s) — used to set the zone disruption risk profile
- Typical daily working hours (morning / afternoon / evening / full day)
- Estimated weekly income band (six options: < Rs. 3,000 / Rs. 3,000–5,000 / Rs. 5,000–7,000 and so on) — self-reported; not verified at onboarding
- UPI ID for payouts

**Optional fields (improve recommendation accuracy):**
- Linked platform partner ID (enables richer activity signal enrichment in future)
- Preferred trigger types to cover — useful for workers who want to exclude certain event types from coverage
- Consent to passive background motion signals (used for eligibility validation; battery-light, no continuous streaming)

### What the Worker Does Not Need to Provide

At onboarding, workers are not asked for income proof, bank account statements, employer letters, or physical documents. KYC is handled via phone OTP (simplified). Full eKYC via DigiLocker / Aadhaar is planned for the production deployment.

### What the System Does

The Adaptive Policy Recommendation and Explainability Engine (APRE-XAI) takes the onboarding inputs and:
1. Constructs a risk profile: zone disruption probability, estimated income variability
2. Runs the weekly premium formula
3. Maps the output to a plan tier: Basic, Standard, or Premium
4. Generates a plain-language explanation the worker can read on-screen

**Example recommendation screen:**

> **Recommended: Standard Plan**
> Weekly Premium: Rs. 63 | Hourly Benefit: Rs. 120 | Weekly Cap: Rs. 600
> Covered: Heavy Rain, Extreme Heat, Severe Pollution, Curfews
> Why this plan: You operate in zones with moderate-to-high rain exposure.
> This plan balances weekly cost and income protection.
> [Activate — Rs. 63 auto-debited weekly] [Compare All Plans]

### Cold-Start Handling

New workers with no individual history are not rejected or given a default-minimum plan. The system assigns a zone-cohort-derived risk profile based on historical disruption data for their declared zone and platform join-date cohort. Conservative benefit values are applied. After two to three weekly cycles with verified activity, the profile is refined using real signal data.

---

## Weekly Premium Model

### Why Weekly Pricing

Delivery workers are paid weekly by their platforms. Their financial planning horizon is weekly. A monthly premium creates a larger single payment that is harder to absorb in a low-earning week and is misaligned with how workers actually think about money. A weekly premium stays small, commits the worker for only seven days at a time, and resets protection automatically each cycle.

### Premium Formula

```
expected_weekly_loss = weekly_income_estimate
                       × disruption_probability
                       × (expected_hours_lost / weekly_working_hours)

base_premium = expected_weekly_loss × replacement_fraction × loading_factor

final_premium = clip(base_premium, floor=Rs. 19, ceiling=Rs. 149)
```

### Input Definitions

| Input | Description | Source in Prototype |
|---|---|---|
| weekly_income_estimate | Worker-reported income band midpoint | Onboarding form |
| disruption_probability | Estimated probability of a qualifying trigger event in their zones this week | Historical IMD, CPCB, zone event records |
| expected_hours_lost | Average hours lost per disruption event in the zone, by event type | Zyro zone database, seeded with historical data |
| replacement_fraction | Partial income replacement cap (0.65 base; never exceeds 0.70) | Fixed in policy contract |
| loading_factor | Multiplier covering operating costs, reserve contribution, and reinsurance buffer | Fixed at 1.4 |

### Numerical Example

A Bengaluru Standard-tier worker estimating Rs. 5,000/week, in a zone with 22% disruption probability and a historical 3.5-hour average event:

```
expected_weekly_loss = 5,000 × 0.22 × (3.5 / 56) = Rs. 68.75
base_premium         = 68.75 × 0.65 × 1.4         = Rs. 62.56
final_premium        = clip(62.56, 19, 149)         = Rs. 63 / week
```

Weekly payout cap for Standard tier: Rs. 600.

### Affordability Bounds

No worker pays more than Rs. 149/week regardless of zone risk. No premium falls below Rs. 19 regardless of low exposure. The ceiling keeps the product affordable for the persona. The floor prevents the reserve pool from becoming structurally underfunded at low-premium cohorts.

### Why Payout Exposure Stays Bounded

Even during a city-scale disruption affecting thousands of workers simultaneously:
- Every policy has a fixed weekly cap that does not increase during a surge
- The replacement fraction (max 70%) ensures payouts are never full income replacement
- The loading factor of 1.4 means premium revenue exceeds pure expected loss by 40%, creating a reserve margin
- Above the stop-loss threshold, a reinsurance layer is intended to absorb excess correlated liability

---

## Parametric Trigger Framework

### Covered Disruption Types

| Category | Specific Events | Threshold | Data Source (Prototype) |
|---|---|---|---|
| Environmental — Rainfall | Heavy rain, urban flooding | Rainfall > 15 mm/hr, sustained | Live: OpenWeatherMap; secondary: IMD open data |
| Environmental — Heat | Extreme heat advisory | Temperature > 43°C, sustained | Live: OpenWeatherMap |
| Environmental — Pollution | Severe AQI | AQI > 400 (Severe band, CPCB) | Live: CPCB AQI API |
| Social / Administrative | Curfew, bandh, zone closure, market shutdown | Government alert or confirmed mobility halt > 2 hours | Mobility proxy signal; government feed (future) |
| Operational | Platform-level order outage in a zone | Order-volume drop > 50%, sustained | Mocked in prototype; live platform API is future-scope |

### Pollution Coverage: Two Cases

AQI above 400 is CPCB's Severe band. At this threshold, CPCB recommends against outdoor physical exertion. For a two-wheeler delivery worker on an eight-hour outdoor shift, choosing not to work at AQI > 400 is a rational decision, not a voluntary absence. Zyro is designed to cover two distinct outcomes under this trigger:

**Case A — Worker stops for health reasons.** The worker is in-zone, policy is active, AQI threshold is confirmed and sustained. WIVE detects that the worker was active before the event and their activity dropped during it. Payout is computed for the covered hours.

**Case B — Worker is present but earns nothing.** AQI > 400 depresses platform-side demand as customers avoid outdoor interactions. The worker may continue trying to work but receives few or no orders. Gate 2 (economic impact) detects the order-volume drop signal. Both the health-stoppage and the demand-collapse scenario are covered within the same trigger logic.

### Tri-Gate Validation

A threshold breach alone is not sufficient for a valid trigger. A five-minute rain spike does not meaningfully disrupt deliveries. A heat advisory at 10 PM does not affect a worker who finished their shift at 8 PM. To reduce false triggers, Zyro requires:

**Gate 1 — Environmental Detection.** The measured disruption must cross the defined threshold for its type and zone, confirmed by at least one live data feed.

**Gate 2 — Economic Impact Verification.** Proxy signals must confirm that earning opportunity was actually reduced: order-volume drop, traffic congestion index spike, delivery latency anomaly. A disruption that does not demonstrably reduce orders does not proceed to event creation.

**Gate 3 — Temporal Persistence.** The disruption must sustain for a minimum qualifying duration (varies by trigger type). This prevents one-minute anomalies from becoming valid events.

Level 1 events (curfew, complete zone closure) fast-track Gate 2 — their economic impact is immediate and does not require proxy confirmation.

### Hysteresis on Recovery

The trigger engine does not close an event the moment one signal briefly dips below threshold. Recovery requires multiple signals to return to baseline simultaneously, and a minimum recovery hold time must pass before the event is marked ENDED. This prevents premature event closure and under-compensation during recoveries that briefly dip and resume.

### After Trigger Confirmation

1. Event Generation Engine receives the validated trigger.
2. A FINALIZED, immutable event object is created for the affected H3 zone.
3. Zone is locked — one active event per zone; overlapping signals merge, not duplicate.
4. All workers with active, matching policies in the zone enter the WIVE eligibility queue.
5. Workers receive a push notification: "Disruption confirmed in your zone. Your coverage is active."

---

## AI/ML Integration

AI is used where rule-based logic produces unreliable outputs. Each component below lists its purpose, the features it uses, its predicted output, the prototype data source, and the reason a fixed rule is insufficient.

### Premium Calculation

**APRE-XAI — Weekly Premium Prediction**

| Field | Detail |
|---|---|
| Purpose | Predict the worker-specific weekly premium for each plan tier |
| Input features | Declared income band, operating zone(s), historical disruption frequency for those zones, estimated working hours, platform and join-date cohort |
| Output | Predicted expected weekly loss → mapped to a final premium within the affordability bounds |
| Prototype data source | Synthetic worker profiles calibrated to NITI Aayog earnings ranges and IMD/CPCB zone disruption history |
| Why not a rule | Zone disruption probability, income variability, and activity patterns are nonlinearly interdependent; a flat rate per zone misrepresents risk for workers with different schedules or multi-zone exposure |

**APRE-XAI — Cold-Start Cohort Inference**

| Field | Detail |
|---|---|
| Purpose | Assign a provisional risk profile to new workers with no individual history |
| Input features | Operating zone, platform, join-date cohort, declared income band |
| Output | Cohort-matched risk parameters for premium calculation |
| Prototype data source | Cluster labels derived from synthetic worker population by zone |
| Why not a rule | A default-minimum plan for all new workers would systematically underprice high-risk zones and overprice low-risk ones |

**APRE-XAI — Plan Explainability**

| Field | Detail |
|---|---|
| Purpose | Provide a worker-readable explanation of why their plan was recommended at this price |
| Approach | SHAP-style feature attribution: lists the top two or three features driving the premium (e.g., "rain-heavy zone," "moderate income variability") |
| Output | Plain-language explanation in the app recommendation screen |
| Why needed | IRDAI draft guidelines on AI in financial products require explainability for customer-facing decisions |

### Trigger Validation

**Activity State Inference (in WIVE)**

| Field | Detail |
|---|---|
| Purpose | Determine whether a worker was in an active earning state when the event occurred, when platform signals are delayed or unavailable |
| Input features | Motion sensor readings (speed, lateral acceleration, vibration frequency), app session state, last GPS timestamp |
| Output | Inferred activity state: active-earning, waiting-for-order, voluntarily-offline, or ambiguous |
| Prototype data source | Simulated telemetry with injected motion profiles for active vs. stationary states |
| Why not a rule | Platform feed latency means session data can be minutes behind real state; ML inference from motion fills this gap reliably |

**Trigger Confidence Scoring**

| Field | Detail |
|---|---|
| Purpose | Assign a confidence score to each validated trigger when sensor or API data is noisy or partially missing |
| Input features | Rainfall value, source agreement (IMD vs. OpenWeatherMap), order-volume delta, congestion index, duration of sustained threshold breach |
| Output | Confidence score (0–1); below a minimum threshold, event is held for human review |
| Prototype data source | Historical API response data with injected noise to simulate sensor disagreement |
| Why not a rule | A binary threshold produces many borderline false positives and false negatives at the edges; confidence scoring allows proportional response |

### Fraud Detection

**Anomaly Scoring**

| Field | Detail |
|---|---|
| Purpose | Assign an anomaly score to each claim, supporting the confidence-tier routing decision |
| Input features | GPS-motion consistency flag, zone visit history, new-account age, session continuity score, payout-destination repeat flag |
| Output | Anomaly score (0–1); high score routes to Review lane |
| Prototype data source | Rule-generated labelled examples (known-good vs. known-suspicious) for training |
| Why not a rule | Novel spoofing patterns and low-frequency coordinated behaviour are not predictable by fixed rules |

**Trust Score Evolution**

| Field | Detail |
|---|---|
| Purpose | Track each worker's cumulative claim reliability over time; used to accelerate or restrict payout lane routing |
| Input features | Claim outcome history, fraud flag count, anomaly score trend, session verification rate |
| Output | Trust score (0–100); influences confidence-tier assignment for future claims |
| Prototype scope | Simulated with seeded trust scores; live incremental updates in production |
| Why not a rule | A fixed rule cannot track a worker's reputation trajectory or distinguish a first-time anomaly from a pattern |

---

## Fraud Prevention and Validation

Parametric insurance has a structural vulnerability: the trigger is external and objective, but worker presence and activity state must be inferred from device signals. GPS coordinates can be mocked. Sessions can be staged.

### MVP Fraud Controls (Built in Prototype)

These controls are implemented in the Phase 2 prototype:

| Control | What It Does |
|---|---|
| Duplicate claim prevention | Composite key `worker_id + event_id` prevents the same claim from being processed twice |
| Zone overlap validation | Worker's GPS location at event time must match the event's H3 zone; city-level match is not sufficient |
| Session continuity check | Worker must have had an active session before the event began, not only during it |
| New account caution | Workers with fewer than two weeks of history are automatically routed to medium-confidence, regardless of other signals |
| Policy existence gate | No valid policy covering this trigger type means no claim is created, enforced before any eligibility check runs |

### Advanced Fraud Controls (Production Layer)

The following controls are architecturally defined in this submission. They are partially stubbed in the prototype and targeted for full implementation in production:

**Kinetic Signature Analysis**

A genuine delivery partner on a two-wheeler produces a consistent accelerometer pattern: lateral sway on turns, vibration at engine frequency, correlating speed and inertial readings. A stationary phone — or a spoofing device — produces a flat or artificially regular signature. The prototype collects this signal; the classification model is trained on labelled profiles in production.

| Signal | Intended Detection |
|---|---|
| Accelerometer pattern | Physical motion consistent with two-wheeler travel vs. stationary device |
| GPS-to-motion correlation | GPS reported speed matched against inertial readings; divergence suggests GPS injection with no physical movement |
| Cell tower triangulation | Network-level location independent of GPS chip; app-based location mocking cannot override cell tower placement |
| IP / network region | IP geolocation matched against declared zone; VPN and proxy use detectable |
| H3 zone visit history | Workers with no prior presence in a zone triggering a first-time claim in that zone are flagged for additional review |
| Device integrity | Device rooting or active location-mock applications detected via device attestation |

These signals are intended to raise the cost and complexity of coordinated spoofing. No single signal alone constitutes proof of fraud — the anomaly score increases only when multiple signals are simultaneously inconsistent.

**Coordinated Fraud Ring Detection**

During active disruptions, the system is designed to analyse the claim population for syndicate patterns:
- Claim timing clustering: statistically implausible bursts of claims within a short window
- Shared network infrastructure: multiple accounts appearing to originate from the same device or IP
- GPS trajectory entropy: spoofed paths tend to show low entropy (perfect straight lines, repetitive arcs)
- Payout destination clustering: multiple accounts routing to a small set of UPI IDs

Streaming cluster analysis is intended to run every five minutes during events. Accounts converging on multiple suspicious dimensions simultaneously trigger a Syndicate Alert and payout freeze pending review. In the prototype, this runs as a batch scan post-event.

### Confidence-Based Payout Routing

| Confidence Level | Condition | Action |
|---|---|---|
| High | Trust score above threshold; no anomaly flags | Immediate payout — primary lane |
| Medium | New profile, one weak anomaly, or data gap | Deferred 2–4 hours — delayed lane; no rejection |
| Low / Suspicious | Multiple strong anomaly signals | Claim held — fraud review queue within 24 hours |

Signal degradation during bad weather (weak GPS, dropped network) is treated as expected, not suspicious. Anomaly score increases only when multiple independent signals are simultaneously inconsistent with genuine outdoor work activity.

---

## Payout Logic

### Payout Formula

Once a worker passes WIVE eligibility checks:

```
payout = hourly_benefit_rate
         × effective_hours_affected
         × severity_factor
         × trust_multiplier

effective_hours_affected = event_duration_hours × effective_loss_ratio
```

Where `effective_loss_ratio` is the fraction of the event window during which the worker was confirmed active:

```
effective_loss_ratio = qualifying_overlap_minutes / event_duration_minutes
```

### Payout Bounds

- Payout is capped at the weekly maximum for the worker's plan tier
- Maximum payout per event: Basic Rs. 300 / Standard Rs. 600 / Premium Rs. 900
- Partial replacement fraction is enforced (max 70% income replacement) — not overridden during surge conditions
- Trust multiplier adjusts between 0.85 and 1.0 based on trust score, not below 0.85

### Example Calculation

Ramesh — Standard tier, trust score 87, 2.8 hours confirmed in a rain event, severity factor 1.2:

```
payout = 120 × 2.8 × 1.2 × 1.0 = Rs. 403.20
```

Capped at Rs. 600 for Standard tier. Rs. 403 is below cap. UPI transfer executes.

### Execution Architecture

Payouts are submitted to Razorpay Payouts in batches of 200 workers. Each claim carries an idempotency key (`worker_id + event_id + week_id`) to prevent double execution on retry. A Redis retry queue handles transient payment gateway failures. In prototype mode, Razorpay test mode is used — no live money is transferred.

---

## Risk Governance and Force Majeure

### Explicit Exclusions

| Excluded Category | Reason |
|---|---|
| War and armed conflict | Duration-indefinite; no objective pre-event signal exists; zone boundaries are legally contested and geographically unpredictable |
| Pandemics and public health emergencies | Simultaneous correlated impact across all zones; sustained indefinitely; parametric premium pricing cannot sustain universal correlated payouts |
| Terrorism and civil unrest | Instantaneous onset with no environmental data stream capable of generating a pre-event signal; post-event zone definition is ambiguous |
| Health, life, and accident | Zyro covers only income loss from external, environmental disruptions; personal health events require different underwriting models entirely |
| Vehicle damage | Physical asset damage requires an inspection-based assessment; parametric trigger logic is not a substitute for loss verification of a physical claim |

### Why These Exclusions Exist in the Design

Parametric insurance is feasible when the trigger is: (a) objective, (b) externally verifiable from a data feed, and (c) bounded in time and space. War, pandemics, and terrorism fail all three simultaneously. There is no threshold that can be set in advance and no data stream that can supply a pre-event signal.

Covering these events in a weekly, affordable product would require loss-ratio assumptions that cannot be sustained at Zyro's price points — and would expose the entire reserve pool to unlimited correlated liability.

### Reinsurance Architecture (Production Target)

**Layer 1 — Internal Reserve.** The loading factor of 1.4 in the premium formula means premium revenue is 1.4× the modelled expected loss. The surplus 0.4× accumulates as the reserve pool. This reserve is intended to absorb normal-week and moderate-disruption payouts without external support.

**Layer 2 — Parametric Reinsurance (planned for production).** When aggregate weekly payouts for a cohort exceed the stop-loss threshold — defined as 140% of that week's collected premium for that cohort — a parametric reinsurance treaty is designed to activate. The treaty itself is parametric: triggered by the verified aggregate payout metric, not by individual claims.

The stop-loss threshold of 140% is the point at which the reserve pool alone cannot sustain the payout obligation, corresponding to a correlated multi-zone disruption event affecting a large fraction of the covered worker population simultaneously.

In the hackathon prototype, the reserve pool and stop-loss threshold are simulated using the premium model parameters. No live reinsurance contract is in place.

---

## Financial Resilience Model

The table below shows how the system responds under different disruption intensities. Numbers assume a cohort of 10,000 active Standard-tier policies at an average premium of Rs. 63/week (total weekly premium pool: Rs. 6.3 lakh), and an average payout of Rs. 340 per eligible claim.

| Scenario | Claim Rate | Estimated Weekly Payout | Payout as % of Premium Pool | Reserve Impact | Reinsurance |
|---|---|---|---|---|---|
| Normal week | 3–5% (300–500 workers) | Rs. 1.0–1.7 lakh | 16–27% | Not drawn | Not triggered |
| Monsoon surge | 12–18% (1,200–1,800 workers) | Rs. 4.1–6.1 lakh | 65–97% | Partially drawn | Not triggered |
| Extreme event | 25–35% (2,500–3,500 workers) | Rs. 8.5–11.9 lakh | 135–189% | Fully drawn at 140% mark | Triggers above 140% |
| Catastrophic week | > 40% (4,000+ workers) | > Rs. 13.6 lakh | > 215% | Exhausted | Fully absorbs excess above stop-loss |

**Reserve pool logic:** The reserve is funded by the loading factor surplus (0.4× of each premium). For a 10,000-worker cohort at Rs. 63/week, this is approximately Rs. 2.52 lakh per week carried forward as operating reserve. The stop-loss activates at 140% of the weekly premium pool (Rs. 8.82 lakh in this cohort), at which point the reinsurance treaty is triggered to cover the excess.

This is a planning model, not a live actuarial study. In production, these parameters would be calibrated against real historical loss data before any treaty is negotiated.

---

## Crisis / Market-Shift Scenario

This section walks through how the Zyro system is designed to handle a sudden city-scale disruption generating thousands of simultaneous claims, with fraud risk and financial exposure both elevated.

### The Scenario

**7:00 PM on a Friday in a major Indian metro.** Flash flooding begins simultaneously across three H3 zone clusters. Approximately 2,400 delivery workers with active Zyro policies are working in those zones. This is peak earning time and peak claim-volume risk simultaneously.

### System Response Timeline

| Time | System Action |
|---|---|
| T+0 min | Rainfall crosses 15 mm/hr. IMD feed and OpenWeatherMap both confirm. Traffic congestion index spikes. Order-volume proxy shows a 55% drop. All three signals ingested simultaneously. |
| T+8 min | Gate 3 persistence confirmed across all three zones — sustained beyond the minimum qualifying duration. Three validated trigger statuses produced. |
| T+9 min | EGM creates three FINALIZED event objects. Zone locks placed. Overlapping signals within sub-zones merged into the parent event — no duplicate processing. |
| T+10 min | 2,400 workers enter WIVE validation queue. WIVE processes per-worker checks across a stateless compute pool. |
| T+14 min | WIVE completes. 1,847 workers are eligible; 553 excluded (offline, past policy expiry, no confirmed zone overlap, or voluntarily inactive). |
| T+15 min | Fraud scoring runs on all 1,847 eligible workers. Crisis mode activates: new accounts (< 2 weeks old) are automatically routed to medium-confidence. High-trust workers (trust score > 80) process without additional holds. |
| T+15–42 min | Primary lane: approximately 1,214 high-confidence workers. Payouts execute in batches of 200 with idempotency key enforcement. |
| T+42–75 min | Delayed lane: approximately 610 medium-confidence workers. Secondary verification resolves; payouts execute for confirmed cases. |
| T+75 min | Review queue: approximately 23 workers flagged for anomaly. Claims held; fraud review within 24 hours. |

### Financial Position in This Scenario

Using the 10,000-worker Standard-tier cohort model from the Financial Resilience section:

| Parameter | Value |
|---|---|
| Eligible workers | 1,847 |
| Average payout per eligible worker | Rs. 340 (estimated) |
| Total payout required | Rs. 6.28 lakh |
| Weekly premium pool for this cohort | Rs. 6.3 lakh |
| Payout as % of premium pool | ~100% |
| Stop-loss threshold (140% of Rs. 6.3 lakh) | Rs. 8.82 lakh |
| Reserve draw required | Minimal — payout is within the weekly premium pool |
| Reinsurance trigger | Not activated in this scenario |

In this scenario, the weekly premium pool alone is sufficient. No stop-loss trigger, no reserve draw beyond operating buffer. If the event had affected approximately 2,600+ eligible workers at the same average payout, the 140% threshold would have been crossed and reinsurance would have been triggered.

### Fraud Controls During Surge

A mass disruption event is the highest-value fraud opportunity: legitimate claims provide cover for coordinated fraudulent ones.

Crisis-mode fraud response (designed to activate automatically when claim volume exceeds 3× the baseline for the zone):
- Confidence thresholds tighten: borderline signals escalated to medium-confidence
- New accounts (< 2 weeks old) route to medium-confidence automatically
- Spatio-temporal cluster detection scans run every 5 minutes during the event
- High-trust workers (trust score > 80) continue through the primary lane without additional holds

### Worker Experience During Crisis

Push notification within minutes of event FINALIZED. App status flow: "Detected → Validating → Processing → Paid." No action required from the worker. If routed to the delayed lane: "We're verifying your eligibility — payout expected within 4 hours." Payout notification includes event type and amount when complete.

### Admin Experience During Crisis

Live H3 heatmap across affected zones. Event confidence scores, affected worker counts, and per-zone validation progress. Fraud alert panel with cluster detection results and escalation queue. Reserve pool exposure tracker showing running payout total vs. stop-loss proximity. Lane distribution showing percentage of claims in primary, delayed, and review. System health indicators: API availability, processing latency, queue depth.

---

## Dashboard Views

### Worker Dashboard

| View | Content |
|---|---|
| Active policy | Plan tier, covered trigger types, weekly cap and amount remaining |
| This week's disruptions | Events in their zones; status (covered / not covered / pending) |
| Payout history | Amount, event type, transfer status, date |
| Income protected | Cumulative payout received across all active policy weeks |
| Protection ratio | Payout divided by estimated income loss — shown as a percentage |
| Uncovered loss | Amount not covered due to cap or partial replacement — shown transparently |
| Next renewal | Date, auto-debit amount, option to change tier |

Example: "This week, heavy rain in your zone caused an estimated Rs. 680 in income loss. Zyro covered Rs. 403. Your remaining Rs. 277 was not covered under your Standard plan's weekly cap. Upgrade to Premium to increase your weekly cap."

Showing uncovered loss honestly is a deliberate design choice. It builds trust and gives the worker accurate information for plan-tier decisions at renewal.

### Insurer / Admin Dashboard

| Metric | Description |
|---|---|
| Active policies | Count, tier distribution, weekly renewal rate |
| Live disruption map | H3 heatmap of active events with severity and affected worker count |
| Trigger activity | Per-trigger claim volume, approval rate, average payout |
| Loss ratio | Payout-to-premium ratio per zone, event, and period |
| Fraud alert panel | Anomaly flags, cluster detection results, escalation queue |
| Confidence tier distribution | Percentage of claims in each lane |
| Reserve pool tracker | Running payout total, stop-loss proximity indicator |
| Zone risk trends | Historical and modelled disruption probability per zone |
| System health | API availability, degraded-mode status, processing latency |

---

## Platform Choice

### Worker-Facing: Mobile Application

A delivery partner on a two-wheeler in rain does not use a laptop or a web browser. The work context is a phone on a weak mobile connection in outdoor conditions. The worker product is mobile by necessity, not by design preference.

Mobile-specific capabilities:
- OTP login — no password to forget, no recovery flow to navigate
- Plan activation via UPI auto-debit — no bank form or NEFT details required
- Push notifications when a disruption is detected in their zone
- Payout confirmation on the lock screen
- Background telemetry for eligibility validation — passive, battery-conscious, on by default with consent at onboarding

### Insurer-Facing: Web Dashboard

Insurer analytics, risk oversight, fraud monitoring, and compliance audit are desktop-scale tasks. A web dashboard is the appropriate interface. This is not a cost simplification — it is the correct UX architecture for the two distinct audiences.

---

## Tech Stack

| Layer | Technology | Rationale |
|---|---|---|
| Mobile app | React Native | Cross-platform iOS and Android from a single codebase; handles background telemetry and push notifications |
| Backend — ML services | FastAPI (Python) | ML model serving, data processing, async performance |
| Backend — Event services | Node.js / Fastify | High-throughput event ingestion and payout orchestration |
| Primary database | PostgreSQL + PostGIS | Structured records, geospatial queries, policy and claim storage |
| Document store | MongoDB | Flexible EGM event objects and audit trail logs |
| Cache and queue | Redis | Idempotency keys, retry queues, telemetry buffer, real-time state management |
| Geospatial indexing | Uber H3 | Hexagonal zone logic at resolution 8–9 (~85–450 m precision); open-source |
| ML — Premium and anomaly | XGBoost, Isolation Forest | Premium prediction and anomaly scoring; both are well-documented and applicable in fintech |
| ML — Cluster fraud | DBSCAN | Spatio-temporal fraud pattern detection across claim populations |
| Explainability | SHAP-style attribution | Feature contribution output for plan recommendation, regulatory alignment |
| Payment gateway | Razorpay | UPI payout and bank transfer; test mode used in prototype |
| Push notifications | Firebase Cloud Messaging | Worker alerts and payout confirmations |
| Weather API | OpenWeatherMap, IMD open data | Gate 1 rainfall and temperature threshold detection |
| Pollution API | CPCB AQI API | Gate 1 AQI threshold detection |
| Traffic API | Google Maps Platform / HERE | Gate 2 economic impact via congestion index |
| Async scaling | Redis queue (prototype); Kafka (production) | Redis handles hackathon-scale throughput; Kafka is the production path for multi-city volume |

---

## MVP vs. Advanced Architecture

| Module | MVP / Hackathon Prototype | Advanced / Production Extension |
|---|---|---|
| Onboarding | OTP login, 6-field form, XGBoost plan recommendation on synthetic data | DigiLocker / Aadhaar eKYC; platform partner ID enrichment |
| Premium model | Formula-based with calibrated synthetic data | Retrained on real worker and claim history; dynamic seasonal adjustment |
| Weather trigger | Live OpenWeatherMap + IMD AQI API integration | Multi-source ensemble; sub-zone micro-weather stations |
| Social / admin trigger | Mobility proxy signal (traffic drop) | Government emergency alert feed integration |
| Platform order signal | Mock generator producing order-volume proxy | Negotiated Swiggy / Zomato API or third-party data broker |
| WIVE | Core eligibility logic: zone overlap, session continuity, policy check | Activity-state ML classifier; full platform feed integration |
| Fraud — kinetic | Basic motion signal collection; rule-layer anomaly scoring | Trained kinetic signature classifier on labelled device profiles |
| Fraud — clusters | Post-event batch scan for syndicate patterns | Streaming cluster analysis every 5 minutes during live events |
| Trust score | Seeded static scores for demo; incremental rule-based update | Gradient-boosted model retrained on live claim history |
| Payout execution | Razorpay test mode; simulated UPI transfers | Live Razorpay Payouts or Cashfree Payouts |
| Worker dashboard | Core views: payout history, protection ratio | Full "Saved vs. Lost" analytics, renewal nudges, plan upgrade recommendations |
| Admin dashboard | Static event log and claim summary | Live H3 heatmap, real-time reserve tracker, fraud escalation queue |
| Reinsurance | Configuration parameter; simulated reserve model | Live parametric reinsurance treaty with external reinsurer |
| Compliance | Architecture documented; IRDAI path identified | Full IRDAI Regulatory Sandbox application |
| Scaling | Single-city, Redis queue | Multi-city Kafka streaming, horizontal microservice scaling |

---

## Development Plan

### Phase 1 — Foundation (Current)

- Complete system architecture across all modules documented in this README
- Persona research with financial profile modelling and data source citations
- Weekly premium formula defined with numerical validation
- Tri-Gate trigger framework designed and documented
- Fraud detection architecture defined: MVP controls and production-layer controls
- Risk governance, force majeure exclusions, and reinsurance structure defined
- Crisis handling scenario designed with consistent financial modelling
- Problem statement compliance mapped

### Phase 2 — Core Prototype (In Progress)

- React Native mobile app: onboarding form, APRE-XAI plan recommendation, policy activation
- APRE-XAI engine: XGBoost premium prediction trained on synthetic worker profiles; SHAP-style explanation output
- Live data ingestion: OpenWeatherMap, CPCB AQI API, Google Maps traffic index
- Trigger Decision Engine: Tri-Gate validation using live environmental APIs and mock platform feed
- Event Generation Engine: event lifecycle management with zone locking
- WIVE: eligibility logic — zone overlap, session continuity, policy validation
- ZyroCredit: claim creation with idempotency keys, Razorpay test-mode payout
- MVP fraud controls: duplicate prevention, zone validation, session continuity, new-account routing

### Phase 3 — Showcase and Hardening

- Advanced fraud: Isolation Forest anomaly scoring, DBSCAN post-event cluster scan, seeded trust scores
- Worker dashboard: protection ratio view, payout history, uncovered loss display
- Admin dashboard: event log, claim summary, confidence tier distribution
- Crisis surge simulation: scripted multi-zone flood scenario with live pipeline, demonstrating lane routing
- End-to-end demo: real API data with synthetic worker population, Razorpay test-mode payouts

---

## Problem Statement Compliance

| Requirement | Zyro's Response |
|---|---|
| Single delivery partner sub-category | Food delivery partners on Swiggy and Zomato — two-wheeler, urban India |
| Coverage: income loss only | Zyro covers only loss of earning opportunity from verified external disruptions |
| Excluded: health, life, accidents, vehicle | Explicitly excluded with documented rationale; architecturally enforced |
| Weekly pricing model | Premium calculated, locked, and renewed every 7 days; aligned to platform settlement cycles |
| AI-powered risk assessment | APRE-XAI: XGBoost premium prediction, SHAP-style explainability, cold-start cohort inference |
| Intelligent fraud detection | Kinetic signature signals, multi-signal anomaly scoring, DBSCAN cluster detection, trust score evolution |
| Parametric automation | External data triggers claim processing automatically — no manual filing required from the worker |
| Integration capabilities | IMD, OpenWeatherMap, CPCB AQI, Google Maps / HERE, Razorpay, Firebase Cloud Messaging |
| Optimised onboarding | OTP login and plan recommendation designed to complete in under 2 minutes on mobile |
| Policy creation with weekly pricing | Locked weekly contract: premium, hourly benefit, weekly cap, covered trigger types |
| Claim triggering through parametric events | Tri-Gate validation → EGM event creation → WIVE eligibility → ZyroCredit payout |
| Payout processing | Deterministic, idempotent UPI transfer via Razorpay; targeting under 90 minutes for high-confidence claims |
| Analytics dashboard | Worker "saved vs. lost" view and admin disruption heatmap, fraud panel, reserve tracker |
| Crisis / market-shift scenario | Section present with timestamped surge response, lane routing, financial controls, and reinsurance logic |

---

## Key Differentiators

| Differentiator | Why It Matters |
|---|---|
| Worker Impact Validation Engine (WIVE) | Designed to pay workers who were actually active and affected — not everyone in the zone. Prevents overcompensation. Most parametric products do not implement this layer. |
| Tri-Gate Trigger Validation | Requires environmental confirmation, economic impact verification, and temporal persistence before any event is valid. Designed to reduce false triggers from transient noise. |
| Confidence-Tiered Payout Lanes | High-trust workers receive immediate payouts. Questionable claims are quarantined, not rejected. Workers are not penalised for signal degradation during bad weather. |
| Kinetic Signature Fraud Signal | Accelerometer and motion patterns are used as an additional fraud signal — devices in motion consistent with two-wheeler travel behave differently from stationary or spoofed devices. |
| Pollution as Health-Based Work Stoppage | Covers both the worker who stops working for health reasons and the worker who continues but earns nothing due to demand collapse — two distinct outcomes under the same trigger. |
| Reinsurance with Defined Stop-Loss | The financial architecture for correlated mass-disruption events is defined in advance. The system does not become financially undefined under surge conditions. |
| Explicit Force Majeure Exclusions | War, pandemics, and terrorism are excluded with documented reasoning, not left as vague policy language for adjuster discretion. |
| Degraded-Mode Resilience | The ingestion layer is designed to continue functioning when external APIs fail — the highest-risk time for correct operation. |
| H3 Hyperlocal Zone Logic | Neighbourhood-scale precision. A disruption 2 km away does not trigger payouts in an unaffected zone. |
| Policy-to-Payout Consistency | The terms agreed at onboarding govern the payout calculation exactly. No post-event re-pricing, no mid-week changes. |

---

## Future Scope

### Near-Term Production Extensions

- Direct Swiggy / Zomato platform API integration for live order-volume and session signals (replaces mock generator)
- Full passive background motion SDK replacing simulated telemetry
- DigiLocker / Aadhaar eKYC integrated at onboarding
- Multi-city horizontal scaling with Kafka event streaming
- IRDAI Regulatory Sandbox application for parametric income protection product category

### Medium-Term

- Auto-rickshaw and e-rickshaw as a separate sub-category with distinct event profiles (longer route exposure, different speed patterns)
- Sub-IMD-grid micro-weather zoning using community weather station data for higher precision
- Dynamic reinsurance treaty with parameters calibrated annually from live loss data
- Premium personalisation based on real platform activity patterns (with worker consent)

### Longer-Term

- Platform-embedded coverage: Swiggy / Zomato native in-app policy flow, removing the separate Zyro app for onboarded workers
- Micro-loan integration: automatic EMI buffer payment triggered alongside income protection payout during extended disruptions
- Cross-platform policy portability: worker coverage history is preserved when switching between platforms
- Rural last-mile extension: adapting the trigger and zone model for lower-density delivery zones with different disruption profiles

---

## Closing Summary

Zyro applies parametric insurance logic to a problem that traditional insurance has never addressed adequately: a delivery partner who loses income the moment a disruption hits, cannot file a claim mid-shift, and cannot wait two weeks for resolution.

The architecture is built around three design decisions that differentiate it from generic parametric concepts:

**Individual validation, not zone-level.** WIVE checks whether each specific worker was active and affected — not whether a disruption occurred in a broad area. This prevents overcompensation and makes the system financially sustainable.

**Bounded financial exposure.** Weekly caps, partial replacement limits, a loading-factor reserve, and a defined stop-loss threshold mean the system's financial behaviour under mass-disruption events is predictable and does not become undefined under crisis conditions.

**Prototype-realistic architecture.** Every component in this submission has a defined MVP equivalent. Live weather and AQI APIs are already integrated. Platform signals are mocked but replaceable. Razorpay test mode supports end-to-end payout demonstration without a live insurance licence.

The worker Zyro is built for earns weekly, works from a phone, and cannot wait for traditional insurance to catch up. The system is designed so they do not have to.
