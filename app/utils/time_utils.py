from datetime import datetime, timezone

def get_current_utc_time() -> str:
    """Returns current time in UTC ISO format."""
    return datetime.now(timezone.utc).isoformat()
