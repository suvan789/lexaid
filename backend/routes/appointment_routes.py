from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from uuid import UUID

from database import get_db
from models import User, Appointment, Notification
from auth import get_current_user
from schemas import AppointmentCreate, AppointmentResponse, AppointmentStatusUpdate

router = APIRouter(prefix="/api/appointments", tags=["Appointments"])

@router.post("/", response_model=AppointmentResponse)
async def create_appointment(
    data: AppointmentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    appointment = Appointment(
        user_id=current_user.id,
        lawyer_id=data.lawyer_id,
        appointment_date=data.appointment_date,
        issue_description=data.issue_description,
        status="pending"
    )
    db.add(appointment)
    await db.commit()
    await db.refresh(appointment)
    
    # Reload with lawyer and user data
    result = await db.execute(
        select(Appointment)
        .options(selectinload(Appointment.lawyer), selectinload(Appointment.user))
        .where(Appointment.id == appointment.id)
    )
    return result.scalar_one()

@router.get("/", response_model=list[AppointmentResponse])
async def get_user_appointments(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(Appointment)
        .options(selectinload(Appointment.lawyer), selectinload(Appointment.user))
        .where(Appointment.user_id == current_user.id)
        .order_by(Appointment.appointment_date.desc())
    )
    return result.scalars().all()

@router.get("/lawyer/portal", response_model=list[AppointmentResponse])
async def get_lawyer_appointments(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not current_user.lawyer_profile_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only registered lawyers can access the Lawyer Portal."
        )

    result = await db.execute(
        select(Appointment)
        .options(selectinload(Appointment.user), selectinload(Appointment.lawyer))
        .where(Appointment.lawyer_id == current_user.lawyer_profile_id)
        .order_by(Appointment.appointment_date.desc())
    )
    return result.scalars().all()

@router.patch("/{appointment_id}/status", response_model=AppointmentResponse)
async def update_appointment_status(
    appointment_id: UUID,
    status_data: AppointmentStatusUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(Appointment)
        .options(selectinload(Appointment.lawyer), selectinload(Appointment.user))
        .where(Appointment.id == appointment_id)
    )
    appointment = result.scalar_one_or_none()

    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found.")

    appointment.status = status_data.status
    
    # Notify client
    notif = Notification(
        user_id=appointment.user_id,
        title=f"Appointment {status_data.status.capitalize()}",
        message=f"Your appointment scheduled for {appointment.appointment_date.strftime('%Y-%m-%d %H:%M')} has been {status_data.status}.",
        type="appointment"
    )
    db.add(notif)

    await db.commit()
    await db.refresh(appointment)
    return appointment
