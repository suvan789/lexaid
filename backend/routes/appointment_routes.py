from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from database import get_db
from models import User, Appointment
from auth import get_current_user
from schemas import AppointmentCreate, AppointmentResponse

router = APIRouter(prefix="/api/appointments", tags=["Appointments"])

@router.post("/", response_model=AppointmentResponse)
async def create_appointment(data: AppointmentCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    appointment = Appointment(
        user_id=current_user.id,
        lawyer_id=data.lawyer_id,
        appointment_date=data.appointment_date,
        status="pending"
    )
    db.add(appointment)
    await db.commit()
    await db.refresh(appointment)
    
    # Reload with lawyer data
    result = await db.execute(select(Appointment).options(selectinload(Appointment.lawyer)).where(Appointment.id == appointment.id))
    return result.scalar_one()

@router.get("/", response_model=list[AppointmentResponse])
async def get_user_appointments(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(
        select(Appointment)
        .options(selectinload(Appointment.lawyer))
        .where(Appointment.user_id == current_user.id)
        .order_by(Appointment.appointment_date)
    )
    return result.scalars().all()
