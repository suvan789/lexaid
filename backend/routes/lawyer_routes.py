from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, or_
from sqlalchemy.ext.asyncio import AsyncSession

from auth import get_current_user
from database import get_db
from groq_service import estimate_lawyer_fee
from models import LawyerProfile, User
from schemas import (
    LawyerResponse, LawyerDetailResponse, LawyerContactResponse,
    FeeEstimateRequest, FeeEstimateResponse
)

router = APIRouter(prefix="/api/lawyers", tags=["Lawyers"])


@router.get("", response_model=list[LawyerResponse])
async def get_lawyers(
    city: Optional[str] = Query(None),
    specialization: Optional[str] = Query(None),
    min_fee: Optional[int] = Query(None),
    max_fee: Optional[int] = Query(None),
    sort_by: Optional[str] = Query("rating"),
    db: AsyncSession = Depends(get_db),
):
    """Search and filter lawyers. No auth required."""
    # Automatically purge static unlinked lawyer profiles (only true registered advocate users remain)
    try:
        from sqlalchemy import delete
        user_lawyer_ids_res = await db.execute(select(User.lawyer_profile_id).where(User.lawyer_profile_id.is_not(None)))
        valid_lawyer_ids = [row[0] for row in user_lawyer_ids_res.all() if row[0] is not None]
        if valid_lawyer_ids:
            await db.execute(delete(LawyerProfile).where(LawyerProfile.id.not_in(valid_lawyer_ids)))
        else:
            await db.execute(delete(LawyerProfile))
        await db.commit()
    except Exception:
        pass

    query = select(LawyerProfile).join(User, User.lawyer_profile_id == LawyerProfile.id)

    if city:
        query = query.where(LawyerProfile.city.ilike(f"%{city}%"))

    if min_fee is not None:
        query = query.where(LawyerProfile.fee_min >= min_fee)

    if max_fee is not None:
        query = query.where(LawyerProfile.fee_max <= max_fee)

    # Sort options
    if sort_by == "fee_low":
        query = query.order_by(LawyerProfile.fee_min.asc())
    elif sort_by == "fee_high":
        query = query.order_by(LawyerProfile.fee_max.desc())
    elif sort_by == "experience":
        query = query.order_by(LawyerProfile.experience_years.desc())
    else:  # default: rating
        query = query.order_by(LawyerProfile.rating.desc())

    result = await db.execute(query)
    lawyers = result.scalars().all()

    # Filter by specialization in-memory (JSON array in SQLite)
    if specialization:
        spec_lower = specialization.lower()
        lawyers = [
            l for l in lawyers
            if l.specialization and any(
                spec_lower in s.lower() for s in l.specialization
            )
        ]

    return lawyers


@router.post("/estimate-fee", response_model=FeeEstimateResponse)
async def estimate_fee(
    body: FeeEstimateRequest,
    current_user: User = Depends(get_current_user),
):
    """Estimate lawyer fees using AI based on case type, city, and complexity."""
    result = await estimate_lawyer_fee(body.case_type, body.city, body.complexity)
    return FeeEstimateResponse(**result)


@router.get("/{lawyer_id}", response_model=LawyerDetailResponse)
async def get_lawyer(
    lawyer_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    """Get full lawyer profile by ID."""
    result = await db.execute(
        select(LawyerProfile).where(LawyerProfile.id == lawyer_id)
    )
    lawyer = result.scalar_one_or_none()

    if not lawyer:
        raise HTTPException(status_code=404, detail="Lawyer not found.")

    return lawyer


@router.post("/{lawyer_id}/contact", response_model=LawyerContactResponse)
async def get_lawyer_contact(
    lawyer_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get lawyer contact details. Requires auth."""
    result = await db.execute(
        select(LawyerProfile).where(LawyerProfile.id == lawyer_id)
    )
    lawyer = result.scalar_one_or_none()

    if not lawyer:
        raise HTTPException(status_code=404, detail="Lawyer not found.")

    return LawyerContactResponse(
        name=lawyer.name,
        phone=lawyer.phone,
        email=lawyer.email,
    )
