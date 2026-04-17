"""
app/db.py — Re-export shim for backward-compatible imports.

Allows both:
    from app.db import session
    from app.db import db_lock, workers, ...
"""

from app.db import session  # noqa: F401 — module alias preserved

# Flat re-exports so callers can do `from app.db import workers`
from app.db.session import (  # noqa: F401
    workers,
    policies,
    sessions,
    events,
    claims,
    otps,
    phone_to_worker_id,
    db_lock,
)
