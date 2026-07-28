import uuid
from contextlib import asynccontextmanager
from datetime import datetime, timezone

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import select

from database import create_all_tables, async_session_factory
from models import LawyerProfile, ForumPost, ForumReply, NewsArticle, User
from auth import hash_password
from routes.auth_routes import router as auth_router
from routes.document_routes import router as document_router
from routes.chat_routes import router as chat_router
from routes.generator_routes import router as generator_router
from routes.lawyer_routes import router as lawyer_router
from routes.forum_routes import router as forum_router
from routes.news_routes import router as news_router
from routes.user_routes import router as user_router
from routes.appointment_routes import router as appointment_router
from routes.notification_routes import router as notification_router
from routes.direct_chat_routes import router as direct_chat_router
from routes.ml_routes import router as ml_router


# ─── Seed Data ─────────────────────────────────────────────────

SEED_LAWYERS = []

SEED_NEWS = [
    {"title": "Supreme Court Upholds Right to Privacy in Digital Data Case", "summary": "The Supreme Court of India ruled that citizens have a fundamental right to privacy in their digital data, setting new precedents for data protection laws. The landmark judgment strengthens individual rights against unauthorized surveillance.", "source": "LiveLaw", "url": "https://www.livelaw.in", "category": "Supreme Court", "published_at": datetime(2024, 12, 15, tzinfo=timezone.utc)},
    {"title": "New Consumer Protection Rules for E-Commerce Platforms", "summary": "The government has notified new rules under the Consumer Protection Act 2019 for e-commerce platforms, mandating transparent return policies and grievance redressal mechanisms within 30 days.", "source": "Bar & Bench", "url": "https://www.barandbench.com", "category": "Consumer", "published_at": datetime(2024, 12, 10, tzinfo=timezone.utc)},
    {"title": "High Court Orders Compensation for Wrongful Termination", "summary": "The Delhi High Court ordered a multinational company to pay Rs 25 lakh compensation to an employee who was wrongfully terminated without following due process under the Industrial Disputes Act.", "source": "Indian Express", "url": "https://indianexpress.com", "category": "Labour", "published_at": datetime(2024, 12, 8, tzinfo=timezone.utc)},
    {"title": "Landmark RERA Ruling Protects Homebuyers from Delayed Possession", "summary": "In a significant ruling, the RERA tribunal ordered builders to pay 10% annual interest to homebuyers for delayed possession beyond the promised date, reinforcing buyer rights under the Real Estate Act.", "source": "LiveLaw", "url": "https://www.livelaw.in", "category": "Property", "published_at": datetime(2024, 12, 5, tzinfo=timezone.utc)},
    {"title": "Supreme Court Clarifies Bail Provisions Under New Criminal Laws", "summary": "The Supreme Court issued guidelines on bail provisions under the Bharatiya Nagarik Suraksha Sanhita (BNSS), emphasizing that bail should be the norm and jail the exception for non-violent offenses.", "source": "Bar & Bench", "url": "https://www.barandbench.com", "category": "Criminal", "published_at": datetime(2024, 12, 1, tzinfo=timezone.utc)},
]


async def seed_database():
    """Seed database with initial data if tables are empty."""
    async with async_session_factory() as db:
        try:
            # Purge static unlinked lawyer profiles (only true registered advocate users remain)
            from sqlalchemy import delete
            user_lawyer_ids_res = await db.execute(select(User.lawyer_profile_id).where(User.lawyer_profile_id.is_not(None)))
            valid_lawyer_ids = [row[0] for row in user_lawyer_ids_res.all() if row[0] is not None]
            
            if valid_lawyer_ids:
                await db.execute(delete(LawyerProfile).where(LawyerProfile.id.not_in(valid_lawyer_ids)))
            else:
                await db.execute(delete(LawyerProfile))
            
            await db.commit()
            print("Purged static unlinked lawyer profiles")

            # Purge static demo forum posts permanently
            from sqlalchemy import delete
            demo_user_res = await db.execute(select(User).where((User.email == "demo@lexaid.in") | (User.full_name == "LexAid Community")))
            demo_users = demo_user_res.scalars().all()
            for du in demo_users:
                await db.execute(delete(ForumReply).where(ForumReply.user_id == du.id))
                await db.execute(delete(ForumPost).where(ForumPost.user_id == du.id))
                await db.execute(delete(User).where(User.id == du.id))

            await db.commit()
            print("Purged all static demo forum posts")
        except Exception as e:
            await db.rollback()
            print(f"Seed error (non-fatal): {e}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan: create tables and seed data on startup."""
    await create_all_tables()
    await seed_database()
    yield


app = FastAPI(
    title="LexAid API",
    description="AI-Powered Legal Super App for Indian Citizens — Document Analysis, Generation, Legal Chat, Lawyer Search, Community Forum, Legal News",
    version="2.0.0",
    lifespan=lifespan,
)

# CORS — allow all origins for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all routers
app.include_router(auth_router)
app.include_router(document_router)
app.include_router(chat_router)
app.include_router(generator_router)
app.include_router(lawyer_router)
app.include_router(forum_router)
app.include_router(news_router)
app.include_router(user_router)
app.include_router(appointment_router)
app.include_router(notification_router)
app.include_router(direct_chat_router)
app.include_router(ml_router)


@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    """Handle HTTP exceptions with structured JSON responses."""
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": exc.detail},
    )


@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Catch-all handler for unhandled errors."""
    return JSONResponse(
        status_code=500,
        content={"error": f"Internal server error: {str(exc)}"},
    )


@app.get("/api/health", tags=["Health"])
async def health_check():
    """Health check endpoint."""
    return {"status": "ok", "version": "3.0.0", "model": "Ollama Llama-3.2 + HuggingFace Zephyr-7B (Local AI)"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
