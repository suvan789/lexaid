from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, and_
from sqlalchemy.orm import selectinload
from uuid import UUID
from typing import List

from database import get_db
from models import User, DirectMessage, Notification, LawyerProfile
from auth import get_current_user
from schemas import DirectMessageCreate, DirectMessageResponse

router = APIRouter(prefix="/api/direct-chat", tags=["Direct Chat"])


@router.post("/send", response_model=DirectMessageResponse)
async def send_message(
    data: DirectMessageCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Verify receiver exists
    result = await db.execute(select(User).where(User.id == data.receiver_id))
    receiver = result.scalar_one_or_none()

    if not receiver:
        raise HTTPException(status_code=404, detail="Recipient user not found.")

    msg = DirectMessage(
        sender_id=current_user.id,
        receiver_id=data.receiver_id,
        appointment_id=data.appointment_id,
        message=data.message,
    )
    db.add(msg)

    # Notify recipient
    notif = Notification(
        user_id=data.receiver_id,
        title=f"New message from {current_user.full_name}",
        message=f"{current_user.full_name}: {data.message[:50]}...",
        type="system"
    )
    db.add(notif)

    await db.commit()
    await db.refresh(msg)

    return DirectMessageResponse(
        id=msg.id,
        sender_id=msg.sender_id,
        receiver_id=msg.receiver_id,
        appointment_id=msg.appointment_id,
        message=msg.message,
        created_at=msg.created_at,
        is_read=msg.is_read,
        sender_name=current_user.full_name,
        receiver_name=receiver.full_name
    )


@router.get("/thread/{other_user_id}", response_model=List[DirectMessageResponse])
async def get_chat_thread(
    other_user_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(DirectMessage)
        .options(selectinload(DirectMessage.sender), selectinload(DirectMessage.receiver))
        .where(
            or_(
                and_(DirectMessage.sender_id == current_user.id, DirectMessage.receiver_id == other_user_id),
                and_(DirectMessage.sender_id == other_user_id, DirectMessage.receiver_id == current_user.id)
            )
        )
        .order_by(DirectMessage.created_at.asc())
    )
    messages = result.scalars().all()

    response_list = []
    for m in messages:
        response_list.append(DirectMessageResponse(
            id=m.id,
            sender_id=m.sender_id,
            receiver_id=m.receiver_id,
            appointment_id=m.appointment_id,
            message=m.message,
            created_at=m.created_at,
            is_read=m.is_read,
            sender_name=m.sender.full_name if m.sender else "Unknown",
            receiver_name=m.receiver.full_name if m.receiver else "Unknown"
        ))

    return response_list


@router.get("/conversations")
async def get_conversations(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all unique users current_user has exchanged direct messages with."""
    result = await db.execute(
        select(DirectMessage)
        .options(selectinload(DirectMessage.sender), selectinload(DirectMessage.receiver))
        .where(
            or_(
                DirectMessage.sender_id == current_user.id,
                DirectMessage.receiver_id == current_user.id
            )
        )
        .order_by(DirectMessage.created_at.desc())
    )
    all_msgs = result.scalars().all()

    convs = {}
    for m in all_msgs:
        other_user = m.receiver if m.sender_id == current_user.id else m.sender
        if not other_user:
            continue
        uid = str(other_user.id)
        if uid not in convs:
            convs[uid] = {
                "user_id": uid,
                "full_name": other_user.full_name,
                "role": other_user.role or "client",
                "last_message": m.message,
                "last_time": m.created_at,
                "unread": not m.is_read and m.receiver_id == current_user.id
            }

    return list(convs.values())
