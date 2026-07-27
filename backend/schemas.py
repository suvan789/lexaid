from datetime import datetime
from typing import List, Optional, Dict, Any
from enum import Enum
from pydantic import BaseModel, EmailStr, Field
from uuid import UUID


# ─── Auth Schemas ─────────────────────────────────────────────

class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)
    full_name: str = Field(..., min_length=1, max_length=255)
    phone: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    role: Optional[str] = "client"
    specialization: Optional[List[str]] = None
    experience_years: Optional[int] = None
    fee_min: Optional[int] = None
    fee_max: Optional[int] = None
    bio: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: UUID
    email: str
    full_name: str
    phone: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    is_verified: bool = False
    role: str = "client"
    lawyer_profile_id: Optional[UUID] = None
    created_at: datetime

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Optional[UserResponse] = None

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(..., min_length=8, max_length=128)

class VerifyEmailRequest(BaseModel):
    token: str

class SendOTPRequest(BaseModel):
    phone: str

class VerifyOTPRequest(BaseModel):
    phone: str
    otp: str
    role: Optional[str] = "client"

class GoogleAuthRequest(BaseModel):
    email: EmailStr
    full_name: str
    google_id: Optional[str] = None
    role: Optional[str] = "client"
