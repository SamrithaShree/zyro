# Zyro

**AI-powered parametric income protection for food delivery gig workers — automatic triggers, zero paperwork, instant payout.**

---

## Problem Context

Food delivery workers on platforms like Swiggy and Zomato lose income the moment a disruption hits — heavy rain, extreme heat, a curfew, or a platform outage. There is no filing process fast enough to match that loss. Traditional insurance does not serve them: premiums are monthly, claims require proof, and settlement takes days.

Zyro solves this directly. When a verified disruption affects a worker's earning zone, the system detects it, validates their presence and active status, computes a fair payout, and transfers money — without the worker doing anything.

---

## Target Persona and Platform Choice

**Who Zyro is built for**

An urban two-wheeler delivery partner working 8–10 hours a day, earning on a weekly cash-flow cycle, operating across dense city zones. This worker:

- cannot afford slow or complex claims processes
- works across multiple high-risk exposure windows every day
- plans earnings weekly, not monthly
- interacts entirely through a smartphone while on the move

**Why mobile-first**

A web app does not fit this persona. Delivery workers are rarely at a desk. The product needs to work on a phone, mid-shift, with minimal interaction. Mobile enables:

- OTP-based onboarding in under two minutes
- background telemetry and location validation
- real-time disruption alerts and push notifications
- instant payout confirmation on the lock screen

A web dashboard exists for admin and insurer analytics. The worker-facing product is exclusively mobile.

---

## Weekly Premium Model

**Why weekly instead of monthly**

Gig workers plan their finances in short cycles. A monthly premium feels distant and expensive. A weekly premium is affordable, predictable, and aligned with how they actually earn and spend. Coverage resets every week, so protection always matches the current earning window.

**How the premium is calculated**

During onboarding, the system estimates:

1. The worker's expected weekly income based on their activity pattern
2. Their disruption exposure based on the zones they operate in
3. Their expected weekly income loss risk from those disruptions
4. A risk-adjusted premium that is bounded by an affordability ceiling

This produces a personalized premium that reflects the worker's actual situation — not a flat rate for everyone.

**Factors that affect pricing**

| Factor | Effect |
|---|---|
| Average hourly and daily income | Sets the benefit baseline |
| Income volatility | Higher volatility increases risk score |
| Frequency of zero-income days | More zero-income days raise exposure |
| Operating zone risk | High-disruption zones cost more |
| Work consistency | Irregular workers may carry higher risk |
| Disruption probability in active zones | Directly scales exposure estimate |

**Guardrails**

- Premium is bounded within an affordability range regardless of risk score
- Benefit is always partial income replacement, not full replacement
- A weekly payout cap prevents runaway compensation
- Plans are presented as Basic, Standard, or Premium — workers never need to understand the math

---

## End-to-End Workflow

The full flow from disruption to payout runs through six connected stages.

```
Worker Onboarding
      |
      v
Data Ingestion & Real-Time Monitoring
      |
      v
Parametric Trigger Decision Engine
      |
      v
Event Generation Engine
      |
      v
Worker Impact Validation Engine
      |
      v
ZyroCredit — Claim, Payout & Payment
```

Each stage is described in detail below.

---

## Module 1 — Onboarding and Policy Recommendation (APRE-XAI)

**What happens here**

When a worker signs up, the system collects:

- Identity and delivery platform ID
- Operating zones and active hours
- Recent earning pattern (average hourly and daily income)
- Income volatility and frequency of zero-income days
- Peak-hour participation rate
- Preferred disruption types to cover

This data feeds the **Adaptive Policy Recommendation and Explainability Engine (APRE-XAI)**, which produces:

- A recommended weekly premium
- A recommended hourly benefit
- A coverage tier (Basic, Standard, or Premium)
- A plain-language explanation the worker can actually read

**Example output**

> Recommended Plan: Standard — Weekly Premium: ₹49  
> Reason: Moderate income volatility detected. You operate in two high-rain zones. Your recent zero-income days suggest meaningful disruption exposure.

**Policy contract consistency**

Once a worker activates a weekly policy, the following values are locked for the entire coverage window:

- Weekly premium
- Hourly benefit
- Coverage tier
- Weekly payout cap
- Covered trigger types

Payout is never recomputed from a different model later. The recommendation defines the contract, and the payout layer simply executes it.

**Payout formula**

```
payout = hourly_benefit × event_duration × severity_multiplier × effective_loss_ratio
```

---

## Module 2 — Data Ingestion and Real-Time Monitoring

**What this layer does**

This is the continuous sensing layer. It ingests signals from multiple sources, normalizes them, and produces a trusted disruption signal that downstream modules can act on safely.

**Signal sources**

| Category | What is collected |
|---|---|
| Environmental | Rainfall level, flood alerts, heat index, pollution readings, curfew feeds |
| Kinetic telemetry | Heartbeat packets, speed buckets, motion signature, connectivity state |
| Mobility and traffic | Congestion index, zone-level slowdowns, route accessibility |
| Platform activity | Active session state, order availability, delivery activity, availability status |

**Geospatial layer**

Zyro uses **H3 hexagonal indexing** for all zone logic. H3 allows:

- Hyperlocal trigger evaluation at the neighborhood level
- Accurate worker-to-zone matching at scale
- Fraud cluster detection across spatial rings
- Smooth event boundary handling

**Degraded mode**

External APIs fail most often during severe disruptions — exactly when Zyro needs them most. This layer handles that by:

- Switching to proxy signals when a primary source goes down
- Reducing confidence scores proportionally
- Continuing probabilistic validation without collapsing

**Output**

A Verified Disruption Signal with: disruption type, affected H3 zone, timestamp, severity, confidence score, source combination, and degraded mode flag.

---

## Module 3 — Parametric Trigger Decision Engine

**What this module does**

Converts the verified disruption signal into a high-confidence trigger decision. Detection alone is not enough — the engine confirms that the disruption is real, persistent, and economically meaningful before any event is created.

**Trigger hierarchy**

| Level | Examples | Handling |
|---|---|---|
| Level 1 — Direct | Curfew, severe flood, platform outage, zone closure | Fast-tracked toward event creation |
| Level 2 — Validated | Heavy rain, extreme heat, severe pollution, traffic disruption | Requires multi-signal validation |
| Level 3 — Weak | Low-severity conditions | Filtered out |

**Tri-Gate Validation**

- **Gate 1 — Environmental detection:** Is the disruption threshold breached?
- **Gate 2 — Economic impact verification:** Is earning opportunity actually reduced? (checked via order drop, traffic slowdown, demand reduction)
- **Gate 3 — Temporal persistence:** Has this disruption lasted long enough to be meaningful, or is it transient noise?

All three gates must clear before a trigger is confirmed.

**Recovery logic**

The trigger does not end immediately when one signal recovers. Hysteresis logic prevents premature event closure and under-compensation from brief signal dips.

**Output**

A validated trigger status (not the event itself) — passed to the Event Generation Engine.

---

## Module 4 — Event Generation Engine (EGM)

**What this module does**

Converts a validated trigger into a structured, immutable event object that the rest of the system references. Without a formal event object, claims can duplicate, duration boundaries become ambiguous, and downstream modules may disagree on severity.

**Event object fields**

- `event_id`, `zone_id`, `status`, `severity`, `confidence_score`
- Signal composition, severity timeline, source IDs
- Traceability references to trigger and ingestion stages

**Event lifecycle (strict state machine)**

```
DETECTED → ACTIVE → STALE → ENDED → FINALIZED
```

Only FINALIZED events are used for claims and payouts.

**Key design constraints**

- One active event per zone at a time (event locking)
- Overlapping signals merge into one composite event (no duplicate events)
- Spatial smoothing across target H3 cell and neighboring rings
- Retroactive timestamp handling for delayed data feeds

---

## Module 5 — Worker Impact Validation Engine (WIVE)

**What this module does**

Zone-level disruption is confirmed by EGM. WIVE answers a different and more precise question:

> Did this specific worker actually lose earning opportunity because of this specific event?

Not every worker in a disrupted zone qualifies for a payout. If WIVE is skipped, the system pays everyone in the zone — causing massive financial leakage.

**Four validation pillars**

1. **Geospatial presence** — Was the worker in the affected H3 cell or its neighboring ring during the event?

2. **Temporal overlap** — Did their active window overlap with the event window long enough to constitute meaningful loss?

3. **Work intent and activity** — Was the worker in an active earning state (waiting for orders, mid-delivery)? Workers who were offline, on break, or inactive by choice are excluded. Zyro insures the opportunity to work, not physical presence alone.

4. **Policy validation** — Did the worker have an active weekly policy covering this trigger type at this time?

**Effective loss ratio**

WIVE computes the proportion of the event window that meaningfully impacted the worker's earning exposure. This ratio feeds directly into the payout formula.

**Output**

An Eligibility Object with: validation flags, overlap duration, effective loss ratio, and final eligibility status. This object is deterministic and auditable.

---

## Module 6 — ZyroCredit: Claim, Payout, and Payment Execution

**What this module does**

Turns validated worker-event pairs into actual money reaching the worker's account. It is the final, financially critical stage of the pipeline.

**Step 1 — Claim creation**

For each eligible worker-event pair:
- Input is validated
- Uniqueness is enforced using `worker_id + event_id` (no duplicate claims)
- A claim object is created and locked

**Step 2 — Payout calculation**

```
payout = hourly_benefit × event_duration × severity_multiplier × effective_loss_ratio
```

Safety controls:
- Minimum payout threshold (no micro-payouts below a floor)
- Weekly cap enforcement
- No full income replacement (always partial)
- Payout is not recomputed after initial calculation

**Step 3 — Payment execution**

- Payment transaction is initialized per claim
- Executed via UPI, direct bank transfer, or wallet through the payment gateway
- Safe retry logic handles transient failures
- Reconciliation catches unresolved transactions
- One claim maps to at most one payment transaction (idempotency enforced)

**Payment stack**

| Context | Stack |
|---|---|
| MVP / Hackathon | Razorpay test mode, Stripe sandbox, mock UPI simulation |
| Production | Razorpay Payouts, Cashfree Payouts, bank transfer APIs |

Redis-backed idempotency keys ensure retries never double-pay.

---

## Persona-Based Usage Scenarios

### Persona 1 — Ramesh, Swiggy partner, Bengaluru

Ramesh works 9 hours a day across Koramangala and HSR Layout. He earns approximately ₹800–1,000 on a good day. During onboarding, APRE-XAI detects moderate income volatility and two high-rain-exposure zones, and recommends the Standard plan at ₹49/week. He activates it through UPI auto-debit.

On a Tuesday afternoon, heavy rain floods his delivery zone. The ingestion layer detects rainfall crossing the threshold, confirms order-drop and traffic slowdown through Gate 2, and validates persistence through Gate 3. EGM creates a FINALIZED event for his zone. WIVE confirms Ramesh was active and online during the event. ZyroCredit computes his payout at ₹620 and transfers it to his UPI within minutes. He receives a notification: "Zyro payout of ₹620 sent to your UPI for rain disruption — 3.1 hours covered."

### Persona 2 — Priya, Zomato partner, Chennai

Priya operates in a dense market zone near Anna Nagar. Her income is consistent but she frequently loses hours to local market shutdowns and political events. APRE-XAI flags her high zone-closure exposure and frequent zero-income days, recommending the Premium plan at ₹89/week covering environmental and social disruptions.

When a sudden zone curfew is imposed on a Saturday evening, the ingestion layer picks up the alert immediately (Level 1 trigger — direct), skipping to event creation without requiring multi-signal validation. All 47 workers with active policies in the affected zone are validated through WIVE simultaneously. Payouts are computed and queued in batch. Priya receives ₹740 within the hour.

### Persona 3 — Arjun, new delivery partner, Hyderabad

Arjun joined Zomato three weeks ago. He has limited earnings history, so APRE-XAI flags him as a new-profile worker and recommends the Basic plan at ₹29/week with a conservative hourly benefit.

During his second week, a heat advisory hits his zone mid-afternoon. The system validates the event, confirms his active status and zone overlap, and triggers a payout proportional to his Basic plan benefit. Because his trust score is new but not suspicious, he goes through a standard-confidence path and receives his payout within the hour.

---

## Urgent Scenario — 24-Hour Market Shift

**The situation**

A major rain event floods three high-density delivery zones in a metro city at 7:00 PM on a weekday — peak delivery hour. Platform order volumes drop 60% in those zones. Approximately 800 active delivery workers with Zyro policies are impacted simultaneously.

**How the system responds**

**7:02 PM** — The ingestion layer detects rainfall crossing threshold across three H3 zone clusters. Traffic slowdown and order-drop signals confirm Gate 2. Persistence is confirmed by Gate 3 at the 12-minute mark.

**7:14 PM** — EGM creates three FINALIZED event objects, one per zone cluster. Zone-locking prevents duplicate events from parallel signal bursts.

**7:15 PM — 7:22 PM** — WIVE runs validation in parallel across all 800 workers. Each worker's presence, active state, overlap duration, and policy status is checked independently. Workers offline or on break are excluded. 614 workers qualify.

**7:22 PM** — ZyroCredit queues 614 claim-payout pairs. Idempotency keys prevent any duplicate transactions. Redis-backed retry logic handles transient payment gateway failures.

**7:45 PM** — Payouts are processed and workers begin receiving UPI notifications.

**Fraud control during the surge**

A rain event of this scale is a high-value fraud target. The anti-spoofing layer responds by:
- Flagging workers whose location appeared in the zone only during the event window (no prior zone history)
- Detecting coordinated claim clusters — multiple new accounts from the same device or network subnet
- Routing medium-confidence claims to a soft-quarantine path for deferred payment and review
- Instant-paying high-trust workers without delay, preserving a fair experience for legitimate claims

**System load handling**

- Event objects are immutable after FINALIZED — downstream modules read, not write
- WIVE runs per-worker validation in a stateless, horizontally scalable manner
- ZyroCredit processes claims in batches with rate-limited payment gateway calls
- Redis queues absorb burst volume without blocking the ingestion layer

---

## Adversarial Defense and Anti-Spoofing Strategy

Simple GPS location checking is not enough. A worker can spoof a coordinate without being present. Zyro's anti-spoofing system does not ask "Is the GPS in the zone?" It asks:

> Does the full worker-state picture look real?

**Signals used beyond GPS**

| Signal | What it detects |
|---|---|
| Kinetic heartbeat signature | Is the device actually moving in a way consistent with a worker on a bike? |
| Speed-to-motion correlation | Does reported speed match sensor-based motion patterns? |
| Device integrity flags | Is the device emulated or rooted? |
| Platform activity feed | Is the worker's account showing active session state? |
| Session continuity | Did the worker have a continuous session before the event, or appear only during it? |
| Network region consistency | Does the network location match the claimed GPS zone? |
| Spatio-temporal cluster analysis | Are multiple account claims arriving from the same physical network or device cluster? |
| Historical trust score | Has this worker been reliable across past verified sessions? |

**How confidence is handled**

| Confidence level | Action |
|---|---|
| High | Instant payout |
| Medium | Soft quarantine — deferred payment, manual review queue |
| Low / Suspicious | Claim rejected or escalated to fraud team |

Missing data is not automatically treated as fraud. A weak network signal during a rainstorm is expected. Workers in genuine distress should not be penalized for poor connectivity.

**Trust recovery**

A low-confidence flag does not permanently mark a worker as fraudulent. Trust scores recover through subsequent verified sessions. This prevents the system from unfairly locking out honest workers after one ambiguous event.

---

## Tech Stack

**Frontend**
- React Native (mobile-first worker app)

**Backend**
- FastAPI or Node.js / Fastify (microservices per module)

**Database**
- PostgreSQL with PostGIS (structured records, geospatial queries)
- MongoDB (flexible event documents from EGM)
- Redis (caching, idempotency keys, retry queues)

**Geospatial**
- H3 hexagonal indexing (Uber H3 library)

**AI/ML**
- XGBoost / gradient boosted trees — premium calculation and fraud scoring
- Isolation Forest — anomaly detection during validation
- SHAP-style explainability — policy recommendation transparency

**APIs and Integrations**
- Weather: OpenWeatherMap, IMD feeds
- Pollution: CPCB or equivalent AQI API
- Traffic: Google Maps Platform, HERE Traffic
- Platform activity: Simulated / mock delivery platform feed
- Payment: Razorpay test mode / Stripe sandbox (MVP), Razorpay Payouts / Cashfree Payouts (production)

**Event and async layer**
- Redis queue (MVP)
- Kafka-compatible architecture for production scaling

---

## Key Differentiators

| What Zyro does | Why it matters |
|---|---|
| Zero-touch parametric claims | Workers never file anything. The system detects, validates, and pays automatically. |
| Worker-level impact validation (WIVE) | Payout is tied to the individual's actual earning state, not just zone membership. |
| Multi-signal fraud defense | Goes beyond GPS — kinetic, behavioral, platform, and network signals all contribute. |
| Weekly pricing aligned to gig earning cycles | Matches how delivery workers actually think about money. |
| Degraded-mode resilience | System continues when external APIs fail — exactly when they are needed most. |
| Explainable AI recommendations | Workers understand why they were quoted a price and why a claim was approved or rejected. |
| Policy-to-payout consistency | The onboarding recommendation and the final payout are contractually linked. No hidden re-pricing. |
| H3 hyperlocal zone logic | Neighborhood-level precision — not city-wide blunt triggers. |

---

## Development Plan

**Phase 1 — Architecture and Concept (Current)**

- Finalized system architecture across all six modules
- Defined persona, user journey, and platform rationale
- Specified weekly pricing logic and trigger framework
- Designed adversarial defense and anti-spoofing strategy
- Produced README and concept documentation

**Phase 2 — Core Pipeline Prototype**

- Worker onboarding flow and policy creation
- APRE-XAI premium recommendation engine
- Data ingestion layer with mock weather and traffic APIs
- Parametric trigger engine with Tri-Gate validation
- Claim creation pipeline and WIVE validation logic
- Dynamic premium prototype

**Phase 3 — Execution and Polish**

- Advanced fraud detection and trust scoring
- ZyroCredit payout simulation with Razorpay test mode
- Worker dashboard: Saved vs Lost view
- Admin and insurer analytics dashboard
- System load testing and optimization

---

## Future Scope

- **Broader disruption coverage:** Extend trigger types to include road accidents affecting a zone, political disruptions, and infrastructure failures
- **Cross-platform identity:** Support delivery partners working across multiple platforms (Swiggy and Zomato simultaneously)
- **Cooperative premium pooling:** Community-based risk pools for worker collectives to reduce individual premiums
- **Earnings-linked dynamic benefit:** Automatically adjust hourly benefit as the worker's income pattern changes week over week
- **Regulatory path:** Work toward IRDAI sandbox compliance for a regulated insurance product in India
- **Two-wheeler fleet extension:** Expand into hyperlocal logistics fleets where the same income-disruption model applies

---

## Final Statement

Zyro is a mobile-first, AI-powered parametric insurance platform built for food delivery gig workers. It protects lost income caused by environmental and social disruptions through weekly-priced coverage, real-time multi-signal monitoring, intelligent fraud defense, and zero-touch payout automation. By combining explainable risk assessment, hyperlocal trigger logic, worker-level impact validation, and adversarial anti-spoofing architecture, Zyro turns disruption from an unpredictable wage shock into a fast, reliable safety net.
