from pydantic import BaseModel, Field
from typing import Optional

class OTPRequest(BaseModel):
    phone: str = Field(..., pattern=r"^\+91[6-9]\d{9}$")

class OTPVerify(BaseModel):
    phone: str = Field(..., pattern=r"^\+91[6-9]\d{9}$")
    otp: str = Field(..., min_length=6, max_length=6)

class MPinSetup(BaseModel):
    mpin: str = Field(..., min_length=4, max_length=4)

class MPinLogin(BaseModel):
    phone: str = Field(..., pattern=r"^\+91[6-9]\d{9}$")
    mpin: str = Field(..., min_length=4, max_length=4)

class AuthResponse(BaseModel):
    token: str
    is_registered: bool
    has_mpin: bool
    worker_id: Optional[str] = None
