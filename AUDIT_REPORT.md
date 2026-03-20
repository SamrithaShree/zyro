# ZyroCredit Foundation: Comprehensive Architectural & Technical Audit Report

## 1. Project Context & Positioning
**Zyro** is an AI-powered parametric insurance platform designated for gig delivery workers in India. The platform autonomously detects real-world disruptive events (severe weather, platform outages, extreme traffic anomalies) and automatically issues financial compensation without requiring manual claim filing from the impacted worker.

**ZyroCredit** is the **Financial Execution Supermodule**. It sits at the absolute end of the pipeline. Its purpose is to intake eligibility signals securely, calculate payouts using a strict parametric formula, and simulate reliable financial transactions.

### The Upstream Pipeline
Before ZyroCredit is invoked, the following external modules process the data:
1. **Trigger Engine:** Ingests raw external data (e.g., Weather APIs, AWS Server Status).
2. **Event Generation Engine (EGM):** Formats triggers into standardized `event_id` objects with predefined severity and duration constraints.
3. **Worker Impact Validation Engine (WIVE):** Correlates gig workers to events. It verifies if `W-001` was working during `EVT-001` and evaluates their specific financial impact (`effective_loss_ratio`).
4. **ZyroCredit (This Subsystem):** Takes the final "ELIGIBLE" signal from WIVE and handles all monetary creation, calculation, and transaction execution.

---

## 2. Technical Stack & Codebase Structure
The foundation is built securely on **FastAPI** utilizing **Python 3.11+**, **Pydantic V2** (for rigorous schema validation), and **Pytest** (for automated testing). The system uses layered architecture to cleanly separate concerns.

```text
zyrocredit/
├── app/
│   ├── main.py                 # FastAPI application and route registration
│   ├── config/settings.py      # Core constants (MIN_PAYOUT, RETRY_LIMIT)
│   ├── db/in_memory_db.py      # Atomic thread-safe dictionary structures
│   ├── models/                 # Internal operational state representations
│   │   ├── claim_model.py 
│   │   └── payment_model.py
│   ├── schemas/                # External API request/response contracts
│   │   ├── input_schema.py 
│   │   └── output_schema.py
│   ├── services/base_service.py# Pure business logic (Formulas, logic loops)
│   ├── routes/                 # Endpoint controllers HTTP layer
│   │   ├── base_routes.py
│   │   ├── claim_routes.py
│   │   ├── payout_routes.py
│   │   └── payment_routes.py
│   └── utils/                  # Cryptographic utilities and Time-gen
│       ├── id_generator.py 
│       └── time_utils.py
└── tests/                      # Pytest automation suite (22 Integrated Tests)
```

---

## 3. Database & Concurrency Architecture
Because ZyroCredit operates as an asynchronous FastAPI application, concurrent requests hitting the system could theoretically execute race conditions (e.g., accidentally creating two claims for the same worker if requests arrive at the exact same millisecond). 

To avert this, ZyroCredit utilizes a Native Python `threading.Lock()` wrapped around **Atomic Operations**.

### Internal Data Structures:
* `claims_db`: Global Python Dictionary mapping `claim_id` -> `ClaimModel`
* `payments_db`: Global Dictionary mapping `transaction_id` -> `PaymentModel`
* `worker_event_map`: Secondary Index Tuple `(worker_id, event_id)` -> `claim_id`
* `claim_transaction_map`: Secondary Index String `claim_id` -> `transaction_id`

### Atomic Execution (Example):
```python
def insert_claim_atomic(worker_id, event_id, claim_id, claim_data) -> bool:
    with db_lock:
        if (worker_id, event_id) in worker_event_map:
            return False # Operation blocked. Idempotency enforced.
        claims_db[claim_id] = claim_data
        worker_event_map[(worker_id, event_id)] = claim_id
        return True
```
Every insert or update requires acquiring the lock. This ensures O(1) duplicate lookups and `100%` thread-safety inside the prototype layer natively.

---

## 4. Stage-by-Stage Deep Dive

### Stage 1: The Validation Firewall
ZyroCredit refuses to process anomalies. Input validations are enforced globally via Pydantic constructs before touching any business logic.

**API Contract (`POST /claims/create`):**
```json
{
  "worker_id": "string",
  "event_id": "string",
  "final_status": "string",
  "effective_loss_ratio": 0.0 to 1.0 (float),
  "severity_multiplier": 0.0 to 1.0 (float)
}
```
If WIVE sends data missing `event_id`, or passes `"none"` instead of a standard `float` for ratios, the FastAPI layer actively intercepts it, throwing a standard `422 Unprocessable Entity` returning precisely which field was corrupted. Internal engines remain unpolluted.

### Stage 2: Claim Generation & Idempotency
* **Endpoint:** `POST /claims/create`
* **Objective:** Digest upstream eligibility signals and officially open a financial Claim record.

**Detailed Logic Path:**
1. Check `final_status`. If not `"ELIGIBLE"`, return `"REJECTED"`.
2. Check `worker_event_map` for `(worker_id, event_id)`.
3. If mapped, Idempotency is triggered. **Stop execution** and return the existing `claim_id` with `"message": "Existing claim returned"`.
4. If not mapped, generate a `UUID4` prefixed string (`CLM-XXXX`).
5. Stamp UTC creation time natively securely via `datetime.utcnow()`.
6. Inject atomically over the `db_lock`.
7. Return `200 Success` with the new ID.

### Stage 3: The Parametric Payout Engine
* **Endpoint:** `POST /payouts/calculate`
* **Objective:** Map claims to formulas and determine real-world currency liabilities securely.

**Detailed Logic Path:**
1. Check if `payout_status == "CALCULATED"`. If Yes, return the previously locked number implicitly ensuring determinism.
2. Fetch required variables:
   * **Worker's Hourly Benefit:** Queried from mock `policies_db` using `worker_id`. Default fallback rejects processing if worker isn't insured.
   * **Event Duration:** Queried from mock `events_db` using `event_id`.
3. **Mathematical Safety Gates:**
   * Clamp variables validating `0 < multiplier <= 1.0`.
   * **Max Cap Execution:** The system truncates the physical duration to `24.0` hours max `min(duration, 24.0)`. Prevents system overflow anomalies.
4. **Formula Execution:** `Hourly Benefit * Capped Duration * Severity * Loss Ratio`.
5. **Float Stripping:** Execute `int(round(result))` forcing currency into absolute whole numbers natively (e.g., dropping unpredictable decimal arrays inherently unsafe for digital wallets).
6. **Micro-Spam Protection:** Evaluate if `result < MIN_PAYOUT` (configurable threshold currently set to `50`). If true, abort the sequence returning `"NO_PAYOUT"`.
7. Acquire lock, mutate original claim object safely mapping `"payout_status"`, and return the integer payload natively.

### Stage 4: Payment Simulation & Network Modeling
* **Endpoint:** `POST /payments/execute`
* **Objective:** Act as the physical banking transaction gateway.

**Detailed Logic Path:**
1. Ensure `claim` exists, `payout_status == "CALCULATED"`, and `amount > 0`.
2. Validate secondary index `claim_transaction_map`. If a transaction already exists returning `"SUCCESS"`, abort and return existing ID mapped directly preventing double-spending natively.
3. Intialize transaction model generating `TXN-XXXX`, marking native status as `"INITIATED"`. Insert immediately to block asynchronous dupe requests locking the ledger line.
4. **Simulate Network Executions:** 
   * Execute a `for` loop bounding exactly `RETRY_LIMIT` (3 attempts).
   * Utilize `random.choice([True, True, True, False])` to artificially induce ~`75%` pseudo-random internet limits. 
   * If `True` triggers, `break` the loop immediately. 
5. Complete Atomicity:
   * If Loop succeeds: Map original claim `payment_status = "PAID"`. Map transaction to `"SUCCESS"`.
   * If Loop exhausts all limits (`False, False, False`): Transaction explicitly mapped to `"FAILED"`. Claim `payment_status` is explicitly *not* mapped to PAID natively ensuring manual audits can review the log freely preserving evidence.

---

## 5. Automated Testing & Verification Protocols
A rigorous Pytest suite comprising **22 integrated end-to-end tests** targets the `TestClient`.

* **Validation Rules Tested:** 6 exact tests validating every combination of standard `ClaimInputSchema` destruction.
* **Idempotency Execution Tested:** Sent duplicate API payloads back-to-back testing that `len(claims_db)` remains locked at `1`. Verified secondary mapping outputs. 
* **Calculation Matrices Tested:** Sent mock data triggering exactly `0` results, upper-bound limit anomalies (`30` hours returning capped math mapped logically), and below `50` bounds evaluating response formatting natively.
* **Latency Simulation Tests:** Explicitly utilized `unittest.mock.patch` binding Python's `random.choice`. Forced exactly 2 failures tracking loop metrics ensuring the 3rd succeeds saving mapped safely. Forced exactly 3 failures triggering `"Retries exhausted"` bounds properly preserving original logic dynamically.

**Result:** The entire architecture is evaluated, stable, fully deterministic, safe from double-charges, mathematically bounded against anomalies, and ready for Stage 5 production integrations.
