from pydantic import BaseModel, Field
from typing import Optional, List, Dict

class PermissionRequest(BaseModel):
    location_consent: bool
    notification_consent: bool
    data_consent: bool

class AadhaarOTPRequest(BaseModel):
    aadhaar_number: str = Field(..., pattern=r"^\d{12}$")

class AadhaarOTPVerify(BaseModel):
    otp: str = Field(..., min_length=6, max_length=6)

class SelfieRequest(BaseModel):
    selfie_mock_payload: str

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

class OnboardingStatusResponse(BaseModel):
    onboarding_state: str
    completed_flags: Dict[str, bool]
    missing_steps: List[str]
    worker_exists: bool
    has_mpin: bool
    can_activate_policy: bool
