"""
app/schemas/generic.py — Global response wrapper.

All API responses MUST be wrapped in GlobalResponse per API contract:
{
    "status": "SUCCESS|ERROR|PENDING",
    "message": "...",
    "data": {...},
    "timestamp": "ISO-8601",
    "request_id": "uuid"
}
"""

from pydantic import BaseModel, Field
from typing import Any, Literal, Optional
from datetime import datetime
import uuid


class GlobalResponse(BaseModel):
    status: Literal["SUCCESS", "ERROR", "PENDING"] = "SUCCESS"
    message: str
    data: Optional[Any] = None
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat() + "Z")
    request_id: str = Field(default_factory=lambda: str(uuid.uuid4()))


def success(message: str, data: Any = None) -> GlobalResponse:
    """Convenience constructor for SUCCESS responses."""
    return GlobalResponse(status="SUCCESS", message=message, data=data)


def error(message: str, data: Any = None) -> GlobalResponse:
    """Convenience constructor for ERROR responses."""
    return GlobalResponse(status="ERROR", message=message, data=data)


def pending(message: str, data: Any = None) -> GlobalResponse:
    """Convenience constructor for PENDING responses."""
    return GlobalResponse(status="PENDING", message=message, data=data)


# ── Backward compat alias (used by existing endpoints) ────────────────────────
class GenericResponse(BaseModel):
    status: str = "SUCCESS"
    message: str
    data: Optional[Any] = None
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat() + "Z")
    request_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
