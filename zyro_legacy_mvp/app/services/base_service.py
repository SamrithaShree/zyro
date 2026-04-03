import random
from app.schemas.input_schema import ClaimInputSchema, PayoutRequestSchema, PaymentRequestSchema
from app.models.claim_model import ClaimModel
from app.models.payment_model import PaymentModel
from app.db.in_memory_db import (
    insert_claim_atomic, get_claim_by_worker_event,
    get_claim, update_claim_payout_atomic, events_db, policies_db,
    insert_transaction_atomic, get_transaction_by_claim, get_payment, finalize_payment_atomic
)
from app.utils.id_generator import generate_claim_id, generate_transaction_id
from app.utils.time_utils import get_current_utc_time
from app.config.settings import MIN_PAYOUT, RETRY_LIMIT

def create_claim(input_data: ClaimInputSchema) -> dict:
    if input_data.final_status != "ELIGIBLE":
        return {"status": "REJECTED", "message": "Worker not eligible"}
    existing_claim_id = get_claim_by_worker_event(input_data.worker_id, input_data.event_id)
    if existing_claim_id:
        return {"status": "SUCCESS", "claim_id": existing_claim_id, "message": "Existing claim returned"}
    new_claim_id = generate_claim_id()
    new_claim = ClaimModel(
        claim_id=new_claim_id, worker_id=input_data.worker_id, event_id=input_data.event_id,
        status="APPROVED", effective_loss_ratio=input_data.effective_loss_ratio,
        severity_multiplier=input_data.severity_multiplier, created_at=get_current_utc_time()
    )
    inserted = insert_claim_atomic(input_data.worker_id, input_data.event_id, new_claim_id, new_claim.model_dump())
    if not inserted:
        return {"status": "SUCCESS", "claim_id": get_claim_by_worker_event(input_data.worker_id, input_data.event_id), "message": "Existing claim returned"}
    return {"status": "SUCCESS", "claim_id": new_claim_id, "message": "Claim created successfully"}

def calculate_payout(payload: PayoutRequestSchema) -> dict:
    claim_id = payload.claim_id
    claim = get_claim(claim_id)
    if not claim or claim.get("status") != "APPROVED":
        return {"status": "ERROR", "message": "Invalid input"}
    if claim.get("payout_status") == "CALCULATED":
        return {"status": "SUCCESS", "payout": claim.get("payout_amount")}
    worker_id, event_id = claim.get("worker_id"), claim.get("event_id")
    event_data, policy_data = events_db.get(event_id), policies_db.get(worker_id)
    if not event_data or not policy_data:
        return {"status": "ERROR", "message": "Invalid input"}
    duration, hourly_benefit = event_data.get("duration", 0.0), policy_data.get("hourly_benefit", 0.0)
    loss_ratio, severity = claim.get("effective_loss_ratio", 0.0), claim.get("severity_multiplier", 0.0)
    if duration <= 0 or hourly_benefit <= 0 or not (0 < loss_ratio <= 1) or not (0 <= severity <= 1):
        return {"status": "ERROR", "message": "Invalid input"}
    duration = min(duration, 24.0)
    final_payout = int(round(hourly_benefit * duration * severity * loss_ratio))
    if final_payout < MIN_PAYOUT:
        return {"status": "NO_PAYOUT", "message": "Below threshold"}
    if not update_claim_payout_atomic(claim_id, final_payout, "CALCULATED"):
        return {"status": "SUCCESS", "payout": get_claim(claim_id).get("payout_amount")}
    return {"status": "SUCCESS", "payout": final_payout}

def execute_payment(payload: PaymentRequestSchema) -> dict:
    """Hook: Simulate physically executing payments safely ensuring idempotency mappings resolving accurately bounding ~75% odds pseudo-random simulated limits."""
    claim_id = payload.claim_id
    claim = get_claim(claim_id)
    
    # 1. Validation Logic
    if not claim or claim.get("payout_status") != "CALCULATED":
        return {"status": "ERROR", "message": "Invalid claim"}
    amount = claim.get("payout_amount", 0)
    if amount <= 0:
        return {"status": "ERROR", "message": "Invalid claim"}
        
    # 2. Idempotency Overwrite
    existing_txn_id = get_transaction_by_claim(claim_id)
    if existing_txn_id:
        payment = get_payment(existing_txn_id)
        if payment and payment.get("status") in ["SUCCESS"]:
            return {"status": "SUCCESS", "transaction_id": existing_txn_id, "message": "Already processed", "amount": amount}
        elif payment and payment.get("status") == "FAILED":
            # Just mapped duplicate behavior. Usually a system might retry failed automatically? 
            # Prompt states: Duplicate execution -> Return same transaction mapping. Ensure no dual modifications duplicate.
            # Assuming any duplicated call to a FAILED transaction just replies identically preserving trace.
            return {"status": "FAILED", "message": "Retries exhausted"}
        return {"status": "SUCCESS", "transaction_id": existing_txn_id, "message": "Already processed", "amount": amount}

    # 3. Initialization Safe Execution State Insertion O(1) Guarantee 
    new_txn_id = generate_transaction_id()
    new_payment = PaymentModel(
        transaction_id=new_txn_id, claim_id=claim_id, worker_id=claim.get("worker_id"),
        amount=amount, status="INITIATED", timestamp=get_current_utc_time()
    )
    inserted = insert_transaction_atomic(claim_id, new_txn_id, new_payment.model_dump())
    if not inserted:
        concurrent_txn = get_transaction_by_claim(claim_id)
        return {"status": "SUCCESS", "transaction_id": concurrent_txn, "message": "Already processed", "amount": amount}
        
    # 4. Physical Network Operation Simulation (Retry logic bounds)
    success = False
    for attempt in range(RETRY_LIMIT):
        outcome = random.choice([True, True, True, False]) # ~75% static odds simulating latency crashes resolving accurately natively
        if outcome:
            success = True
            break
            
    # 5. Outcome Resolve States Mapping Updates Inherently
    if success:
        finalize_payment_atomic(claim_id, new_txn_id, "SUCCESS")
        return {"status": "SUCCESS", "transaction_id": new_txn_id, "amount": amount}
    else:
        finalize_payment_atomic(claim_id, new_txn_id, "FAILED")
        return {"status": "FAILED", "message": "Retries exhausted"}
