import threading
from typing import Dict, Any

# In-memory database structures
# Keyed by primary ID (worker_id, policy_id, session_token, or phone)
workers: Dict[str, Any] = {}
policies: Dict[str, Any] = {}
sessions: Dict[str, Any] = {}
otps: Dict[str, str] = {}  # phone -> otp_code (mock)

# Secondary index for phone lookups
phone_to_worker_id: Dict[str, str] = {}

# Global lock for thread-safety during atomic operations
db_lock = threading.Lock()
