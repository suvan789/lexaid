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


# ─── Document / Analysis Schemas ─────────────────────────────

class ClauseSchema(BaseModel):
    clause_number: int
    heading: str
    original_text: str
    risk_level: str
    plain_explanation: str
    what_it_means_for_you: str
    your_rights: str


class AnalysisResponse(BaseModel):
    document_type: str
    overall_risk: str
    risk_summary: str
    total_clauses: int
    high_risk_count: int
    medium_risk_count: int
    low_risk_count: int
    clauses: List[ClauseSchema]
    document_text: str
    document_id: Optional[str] = None


class DocumentHistory(BaseModel):
    id: UUID
    filename: str
    document_type: Optional[str] = None
    overall_risk: Optional[str] = None
    risk_summary: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class TranslationRequest(BaseModel):
    target_language: str = Field(..., pattern="^(tamil|hindi)$")


# ─── Generator Schemas ─────────────────────────────────────────

class DocumentGenerateRequest(BaseModel):
    doc_type: str = Field(..., min_length=1)
    form_data: Dict[str, Any]


class GeneratedDocResponse(BaseModel):
    id: UUID
    doc_type: str
    title: str
    content: str
    form_data: Optional[Dict[str, Any]] = None
    created_at: datetime

    class Config:
        from_attributes = True


class DocumentTypeInfo(BaseModel):
    type: str
    name: str
    description: str
    required_fields: List[str]


# ─── Lawyer Schemas ─────────────────────────────────────────────

class LawyerResponse(BaseModel):
    id: UUID
    name: str
    specialization: Optional[List[str]] = None
    city: str
    state: str
    experience_years: int
    fee_min: int
    fee_max: int
    fee_currency: str = "INR"
    rating: float
    reviews_count: int
    bio: Optional[str] = None
    verified: bool = False
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class LawyerDetailResponse(LawyerResponse):
    phone: Optional[str] = None
    email: Optional[str] = None


class LawyerContactResponse(BaseModel):
    name: str
    phone: Optional[str] = None
    email: Optional[str] = None


class FeeEstimateRequest(BaseModel):
    case_type: str = Field(..., min_length=1)
    city: str = Field(..., min_length=1)
    complexity: str = Field(..., pattern="^(simple|medium|complex)$")


class FeeEstimateResponse(BaseModel):
    min_fee: int
    max_fee: int
    average_fee: int
    factors: List[str]


# ─── Forum Schemas ─────────────────────────────────────────────

class ForumCategory(str, Enum):
    general = "general"
    rent = "rent"
    employment = "employment"
    consumer = "consumer"
    family = "family"
    criminal = "criminal"
    property = "property"
    other = "other"


class ForumPostCreate(BaseModel):
    title: str = Field(..., min_length=5, max_length=500)
    content: str = Field(..., min_length=10)
    category: str = "general"
    tags: Optional[List[str]] = None


class ForumReplyResponse(BaseModel):
    id: UUID
    post_id: UUID
    user_id: UUID
    user_name: Optional[str] = None
    content: str
    upvotes: int = 0
    is_accepted: bool = False
    created_at: datetime

    class Config:
        from_attributes = True


class ForumPostResponse(BaseModel):
    id: UUID
    user_id: UUID
    user_name: Optional[str] = None
    title: str
    content: str
    category: str
    tags: Optional[List[str]] = None
    views: int = 0
    upvotes: int = 0
    is_answered: bool = False
    reply_count: int = 0
    replies: Optional[List[ForumReplyResponse]] = None
    created_at: datetime

    class Config:
        from_attributes = True


class ForumReplyCreate(BaseModel):
    content: str = Field(..., min_length=5)


# ─── News Schemas ─────────────────────────────────────────────

class NewsResponse(BaseModel):
    id: UUID
    title: str
    summary: Optional[str] = None
    source: Optional[str] = None
    url: Optional[str] = None
    category: Optional[str] = None
    published_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ─── Chat Schemas ─────────────────────────────────────────────

class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000)
    document_text: Optional[str] = None


class ChatLegalRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000)
    conversation_history: Optional[List[ChatMessage]] = None


class ChatResponse(BaseModel):
    reply: str


# ─── Appointment Schemas ─────────────────────────────────────────────

class AppointmentCreate(BaseModel):
    lawyer_id: UUID
    appointment_date: datetime
    issue_description: Optional[str] = None


class AppointmentStatusUpdate(BaseModel):
    status: str


class AppointmentResponse(BaseModel):
    id: UUID
    user_id: UUID
    lawyer_id: UUID
    appointment_date: datetime
    status: str
    issue_description: Optional[str] = None
    lawyer: Optional[LawyerResponse] = None
    user: Optional[UserResponse] = None
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Direct Messaging Schemas ─────────────────────────────────────────

class DirectMessageCreate(BaseModel):
    receiver_id: UUID
    appointment_id: Optional[UUID] = None
    message: str = Field(..., min_length=1)


class DirectMessageResponse(BaseModel):
    id: UUID
    sender_id: UUID
    receiver_id: UUID
    appointment_id: Optional[UUID] = None
    message: str
    created_at: datetime
    is_read: bool = False
    sender_name: Optional[str] = None
    receiver_name: Optional[str] = None

    class Config:
        from_attributes = True


# ─── Notification Schemas ─────────────────────────────────────────────

class NotificationResponse(BaseModel):
    id: UUID
    title: str
    message: str
    type: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True

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
