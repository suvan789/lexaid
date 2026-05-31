from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID

from database import get_db
from models import User, SavedLawyer, SavedNews, SavedForumPost, LawyerProfile, NewsArticle, ForumPost
from auth import get_current_user
from schemas import LawyerResponse, NewsResponse, ForumPostResponse

router = APIRouter(prefix="/api/user", tags=["User"])

@router.post("/saved/lawyer/{lawyer_id}")
async def toggle_saved_lawyer(lawyer_id: UUID, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(SavedLawyer).where(SavedLawyer.user_id == current_user.id, SavedLawyer.lawyer_id == lawyer_id))
    saved = result.scalar_one_or_none()
    if saved:
        await db.delete(saved)
        await db.commit()
        return {"status": "removed"}
    else:
        new_saved = SavedLawyer(user_id=current_user.id, lawyer_id=lawyer_id)
        db.add(new_saved)
        await db.commit()
        return {"status": "added"}

@router.get("/saved/lawyers", response_model=list[LawyerResponse])
async def get_saved_lawyers(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(
        select(LawyerProfile)
        .join(SavedLawyer, LawyerProfile.id == SavedLawyer.lawyer_id)
        .where(SavedLawyer.user_id == current_user.id)
    )
    return result.scalars().all()

@router.get("/saved/lawyers/ids", response_model=list[UUID])
async def get_saved_lawyer_ids(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(SavedLawyer.lawyer_id).where(SavedLawyer.user_id == current_user.id))
    return result.scalars().all()

@router.post("/saved/news/{news_id}")
async def toggle_saved_news(news_id: UUID, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(SavedNews).where(SavedNews.user_id == current_user.id, SavedNews.news_id == news_id))
    saved = result.scalar_one_or_none()
    if saved:
        await db.delete(saved)
        await db.commit()
        return {"status": "removed"}
    else:
        new_saved = SavedNews(user_id=current_user.id, news_id=news_id)
        db.add(new_saved)
        await db.commit()
        return {"status": "added"}

@router.get("/saved/news", response_model=list[NewsResponse])
async def get_saved_news(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(
        select(NewsArticle)
        .join(SavedNews, NewsArticle.id == SavedNews.news_id)
        .where(SavedNews.user_id == current_user.id)
    )
    return result.scalars().all()

@router.get("/saved/news/ids", response_model=list[UUID])
async def get_saved_news_ids(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(SavedNews.news_id).where(SavedNews.user_id == current_user.id))
    return result.scalars().all()

@router.post("/saved/forum/{post_id}")
async def toggle_saved_forum(post_id: UUID, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(SavedForumPost).where(SavedForumPost.user_id == current_user.id, SavedForumPost.post_id == post_id))
    saved = result.scalar_one_or_none()
    if saved:
        await db.delete(saved)
        await db.commit()
        return {"status": "removed"}
    else:
        new_saved = SavedForumPost(user_id=current_user.id, post_id=post_id)
        db.add(new_saved)
        await db.commit()
        return {"status": "added"}

@router.get("/saved/forum", response_model=list[ForumPostResponse])
async def get_saved_forum(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(
        select(ForumPost)
        .join(SavedForumPost, ForumPost.id == SavedForumPost.post_id)
        .where(SavedForumPost.user_id == current_user.id)
    )
    return result.scalars().all()

@router.get("/saved/forum/ids", response_model=list[UUID])
async def get_saved_forum_ids(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(SavedForumPost.post_id).where(SavedForumPost.user_id == current_user.id))
    return result.scalars().all()
