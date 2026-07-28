from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from auth import get_current_user
from database import get_db
from groq_service import general_legal_chat
from models import ForumPost, ForumReply, User
from schemas import (
    ForumPostCreate, ForumPostResponse, ForumReplyCreate,
    ForumReplyResponse, ChatResponse
)

router = APIRouter(prefix="/api/forum", tags=["Forum"])


def _build_post_response(post, user_name=None, reply_count=0, include_replies=False):
    """Helper to build ForumPostResponse from ORM object."""
    replies_list = None
    if include_replies and post.replies:
        replies_list = [
            ForumReplyResponse(
                id=r.id,
                post_id=r.post_id,
                user_id=r.user_id,
                user_name=r.user.full_name if r.user else None,
                content=r.content,
                upvotes=r.upvotes,
                is_accepted=r.is_accepted,
                created_at=r.created_at,
            )
            for r in sorted(post.replies, key=lambda x: (not x.is_accepted, -x.upvotes))
        ]
        reply_count = len(replies_list)

    return ForumPostResponse(
        id=post.id,
        user_id=post.user_id,
        user_name=user_name or (post.user.full_name if post.user else None),
        title=post.title,
        content=post.content,
        category=post.category,
        tags=post.tags,
        views=post.views,
        upvotes=post.upvotes,
        is_answered=post.is_answered,
        reply_count=reply_count,
        replies=replies_list,
        created_at=post.created_at,
    )


@router.get("/posts", response_model=list[ForumPostResponse])
async def get_posts(
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    sort_by: Optional[str] = Query("latest"),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
):
    """Get forum posts with filtering, search, and pagination."""
    # Delete legacy demo posts automatically if present
    try:
        from sqlalchemy import delete
        demo_uuid = UUID('d658c62f-609f-4888-a6f5-5c3f4dde871f')
        await db.execute(delete(ForumReply).where(ForumReply.user_id == demo_uuid))
        await db.execute(delete(ForumPost).where(ForumPost.user_id == demo_uuid))
        await db.commit()
    except Exception:
        pass

    query = (
        select(ForumPost)
        .options(selectinload(ForumPost.user), selectinload(ForumPost.replies))
        .where(ForumPost.user_id != UUID('d658c62f-609f-4888-a6f5-5c3f4dde871f'))
    )

    if category and category != "all":
        query = query.where(ForumPost.category == category)

    if search:
        query = query.where(
            ForumPost.title.ilike(f"%{search}%") | ForumPost.content.ilike(f"%{search}%")
        )

    if sort_by == "popular":
        query = query.order_by(ForumPost.upvotes.desc())
    elif sort_by == "unanswered":
        query = query.where(ForumPost.is_answered == False).order_by(ForumPost.created_at.desc())
    else:  # latest
        query = query.order_by(ForumPost.created_at.desc())

    offset = (page - 1) * limit
    query = query.offset(offset).limit(limit)

    result = await db.execute(query)
    posts = result.scalars().all()

    return [
        _build_post_response(
            post,
            reply_count=len(post.replies) if post.replies else 0
        )
        for post in posts
    ]


@router.post("/posts", response_model=ForumPostResponse, status_code=201)
async def create_post(
    body: ForumPostCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new forum post."""
    post = ForumPost(
        user_id=current_user.id,
        title=body.title,
        content=body.content,
        category=body.category,
        tags=body.tags or [],
    )
    db.add(post)
    await db.flush()
    await db.refresh(post)

    return ForumPostResponse(
        id=post.id,
        user_id=post.user_id,
        user_name=current_user.full_name,
        title=post.title,
        content=post.content,
        category=post.category,
        tags=post.tags,
        views=0,
        upvotes=0,
        is_answered=False,
        reply_count=0,
        replies=[],
        created_at=post.created_at,
    )


@router.get("/posts/{post_id}", response_model=ForumPostResponse)
async def get_post(
    post_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    """Get a single forum post with all replies. Increments view count."""
    result = await db.execute(
        select(ForumPost)
        .where(ForumPost.id == post_id)
        .options(
            selectinload(ForumPost.user),
            selectinload(ForumPost.replies).selectinload(ForumReply.user)
        )
    )
    post = result.scalar_one_or_none()

    if not post:
        raise HTTPException(status_code=404, detail="Post not found.")

    # Increment view count
    post.views = (post.views or 0) + 1
    await db.flush()

    return _build_post_response(post, include_replies=True)


@router.post("/posts/{post_id}/reply", response_model=ForumReplyResponse, status_code=201)
async def create_reply(
    post_id: UUID,
    body: ForumReplyCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Add a reply to a forum post."""
    result = await db.execute(select(ForumPost).where(ForumPost.id == post_id))
    post = result.scalar_one_or_none()

    if not post:
        raise HTTPException(status_code=404, detail="Post not found.")

    reply = ForumReply(
        post_id=post_id,
        user_id=current_user.id,
        content=body.content,
    )
    db.add(reply)
    await db.flush()
    await db.refresh(reply)

    return ForumReplyResponse(
        id=reply.id,
        post_id=reply.post_id,
        user_id=reply.user_id,
        user_name=current_user.full_name,
        content=reply.content,
        upvotes=0,
        is_accepted=False,
        created_at=reply.created_at,
    )


@router.post("/posts/{post_id}/upvote")
async def upvote_post(
    post_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Toggle upvote on a forum post."""
    result = await db.execute(select(ForumPost).where(ForumPost.id == post_id))
    post = result.scalar_one_or_none()

    if not post:
        raise HTTPException(status_code=404, detail="Post not found.")

    post.upvotes = (post.upvotes or 0) + 1
    await db.flush()

    return {"upvotes": post.upvotes}


@router.post("/replies/{reply_id}/upvote")
async def upvote_reply(
    reply_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Toggle upvote on a forum reply."""
    result = await db.execute(select(ForumReply).where(ForumReply.id == reply_id))
    reply = result.scalar_one_or_none()

    if not reply:
        raise HTTPException(status_code=404, detail="Reply not found.")

    reply.upvotes = (reply.upvotes or 0) + 1
    await db.flush()

    return {"upvotes": reply.upvotes}


@router.post("/replies/{reply_id}/accept")
async def accept_reply(
    reply_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Mark a reply as accepted answer. Only post owner can do this."""
    result = await db.execute(
        select(ForumReply)
        .where(ForumReply.id == reply_id)
        .options(selectinload(ForumReply.post))
    )
    reply = result.scalar_one_or_none()

    if not reply:
        raise HTTPException(status_code=404, detail="Reply not found.")

    if reply.post.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the post author can accept answers.")

    reply.is_accepted = True
    reply.post.is_answered = True
    await db.flush()

    return {"accepted": True}


@router.get("/posts/{post_id}/ai-answer")
async def get_ai_answer(
    post_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Generate an AI answer for a forum question."""
    result = await db.execute(select(ForumPost).where(ForumPost.id == post_id))
    post = result.scalar_one_or_none()

    if not post:
        raise HTTPException(status_code=404, detail="Post not found.")

    context_message = f"Question Title: {post.title}\n\nDetails: {post.content}"
    ai_answer = await general_legal_chat(context_message)

    return {"ai_answer": ai_answer}
