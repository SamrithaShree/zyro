import uuid

def generate_claim_id() -> str:
    """Generates a unique claim identifier with CLM prefix."""
    return f"CLM-{uuid.uuid4().hex[:12].upper()}"

def generate_transaction_id() -> str:
    """Generates a unique transaction identifier with TXN prefix."""
    return f"TXN-{uuid.uuid4().hex[:12].upper()}"
