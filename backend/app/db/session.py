"""
app/db/session.py — Thread-safe in-memory database.

Extended with:
  - payout_idempotency: set  → Redis-fallback idempotency cache for payouts
  - Redis client (optional)
"""

import threading
from typing import Dict, Any, Set

try:
    import redis as _redis
    _redis_client = _redis.Redis(host="localhost", port=6379, db=1, decode_responses=True)
    _redis_client.ping()
    redis_client = _redis_client
except Exception as _e:
    redis_client = None  # type: ignore[assignment]

# ──────────────────────────────────────────────
# In-memory database structures
# ──────────────────────────────────────────────
workers: Dict[str, Any] = {}
policies: Dict[str, Any] = {}
sessions: Dict[str, Any] = {}
events: Dict[str, Any] = {}
claims: Dict[str, Any] = {}
otps: Dict[str, str] = {}           # phone → otp_code (mock)

# Secondary index for phone lookups
phone_to_worker_id: Dict[str, str] = {}

# ──────────────────────────────────────────────
# Idempotency cache (payout deduplication)
# Key format: "{worker_id}:{event_id}:{week_id}"
# ──────────────────────────────────────────────
payout_idempotency: Set[str] = set()

# ──────────────────────────────────────────────
# Global lock — ALL read/write ops inside this
# ──────────────────────────────────────────────
db_lock = threading.Lock()


# ──────────────────────────────────────────────
# Redis-backed idempotency helpers (fallback safe)
# ──────────────────────────────────────────────
PAYOUT_TTL_SECONDS = 60 * 60 * 24 * 7  # 7 days


def mark_payout_done(idempotency_key: str) -> None:
    """Record a completed payout. Thread-safe, Redis-or-memory."""
    with db_lock:
        payout_idempotency.add(idempotency_key)
    if redis_client:
        try:
            redis_client.set(
                f"payout:{idempotency_key}", "1", ex=PAYOUT_TTL_SECONDS
            )
        except Exception:
            pass  # Redis optional


def is_payout_done(idempotency_key: str) -> bool:
    """Check if payout already executed. Redis primary, memory fallback."""
    if redis_client:
        try:
            if redis_client.exists(f"payout:{idempotency_key}"):
                return True
        except Exception:
            pass
    with db_lock:
        return idempotency_key in payout_idempotency
