from typing import Optional
from datetime import datetime, timezone, timedelta

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from auth import get_current_user
from database import get_db
from models import NewsArticle, User
from news_scraper import scrape_legal_news
from schemas import NewsResponse

router = APIRouter(prefix="/api/news", tags=["News"])


@router.get("", response_model=list[NewsResponse])
async def get_news(
    category: Optional[str] = Query(None),
    limit: int = Query(20, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
):
    """Get legal news articles. Triggers scraping if DB is empty or stale."""
    # Check if we need to scrape
    result = await db.execute(
        select(NewsArticle).order_by(NewsArticle.scraped_at.desc()).limit(1)
    )
    latest = result.scalar_one_or_none()

    should_scrape = False
    if not latest:
        should_scrape = True
    elif latest.scraped_at:
        age = datetime.now(timezone.utc) - latest.scraped_at.replace(tzinfo=timezone.utc)
        if age > timedelta(hours=6):
            should_scrape = True

    if should_scrape:
        try:
            articles = await scrape_legal_news()
            # Clear old articles and insert new ones
            old_result = await db.execute(select(NewsArticle))
            old_articles = old_result.scalars().all()
            for old in old_articles:
                await db.delete(old)

            for article_data in articles:
                article = NewsArticle(
                    title=article_data["title"],
                    summary=article_data.get("summary", ""),
                    source=article_data.get("source", ""),
                    url=article_data.get("url", ""),
                    category=article_data.get("category", "General"),
                    published_at=article_data.get("published_at"),
                )
                db.add(article)

            await db.flush()
        except Exception:
            pass  # Serve stale data if scraping fails

    # Query articles
    query = select(NewsArticle).order_by(NewsArticle.published_at.desc())

    if category and category != "All":
        query = query.where(NewsArticle.category == category)

    query = query.limit(limit)

    result = await db.execute(query)
    articles = result.scalars().all()

    return articles


@router.get("/refresh")
async def refresh_news(
    db: AsyncSession = Depends(get_db),
):
    """Force re-scrape news articles."""
    try:
        articles = await scrape_legal_news()

        # Clear old articles
        old_result = await db.execute(select(NewsArticle))
        old_articles = old_result.scalars().all()
        for old in old_articles:
            await db.delete(old)

        for article_data in articles:
            article = NewsArticle(
                title=article_data["title"],
                summary=article_data.get("summary", ""),
                source=article_data.get("source", ""),
                url=article_data.get("url", ""),
                category=article_data.get("category", "General"),
                published_at=article_data.get("published_at"),
            )
            db.add(article)

        await db.flush()

        return {"scraped": len(articles)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Scraping failed: {str(e)}")
