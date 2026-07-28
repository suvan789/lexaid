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

SEED_LAWYERS = [
    {"name": "Adv. Priya Sharma", "specialization": ["Criminal", "Family"], "city": "Mumbai", "state": "Maharashtra", "experience_years": 15, "fee_min": 10000, "fee_max": 35000, "rating": 4.8, "reviews_count": 142, "phone": "+91-9876543210", "email": "priya.sharma@lawfirm.in", "bio": "Senior advocate specializing in criminal defense and family law with 15 years of experience in Mumbai High Court.", "verified": True},
    {"name": "Adv. Rajesh Kumar", "specialization": ["Property", "Civil"], "city": "Delhi", "state": "Delhi", "experience_years": 20, "fee_min": 15000, "fee_max": 45000, "rating": 4.9, "reviews_count": 210, "phone": "+91-9876543211", "email": "rajesh.kumar@legalpractice.in", "bio": "Expert in property disputes and civil litigation with two decades of practice in Delhi courts.", "verified": True},
    {"name": "Adv. Meena Iyer", "specialization": ["Consumer", "Civil"], "city": "Chennai", "state": "Tamil Nadu", "experience_years": 12, "fee_min": 8000, "fee_max": 25000, "rating": 4.7, "reviews_count": 98, "phone": "+91-9876543212", "email": "meena.iyer@advocateservices.in", "bio": "Consumer rights champion with extensive experience in NCDRC and state consumer forums.", "verified": True},
    {"name": "Adv. Vikram Singh", "specialization": ["Corporate", "Tax"], "city": "Bangalore", "state": "Karnataka", "experience_years": 18, "fee_min": 20000, "fee_max": 50000, "rating": 4.6, "reviews_count": 175, "phone": "+91-9876543213", "email": "vikram.singh@corporatelaw.in", "bio": "Corporate law specialist handling mergers, acquisitions, and tax planning for major companies.", "verified": True},
    {"name": "Adv. Anjali Desai", "specialization": ["Family", "Property"], "city": "Ahmedabad", "state": "Gujarat", "experience_years": 10, "fee_min": 7000, "fee_max": 20000, "rating": 4.5, "reviews_count": 67, "phone": "+91-9876543214", "email": "anjali.desai@familylaw.in", "bio": "Dedicated family law practitioner helping clients through divorce, custody, and property disputes.", "verified": True},
    {"name": "Adv. Arjun Menon", "specialization": ["Criminal", "Civil"], "city": "Hyderabad", "state": "Telangana", "experience_years": 14, "fee_min": 10000, "fee_max": 30000, "rating": 4.4, "reviews_count": 120, "phone": "+91-9876543215", "email": "arjun.menon@legalaid.in", "bio": "Criminal defense attorney with successful track record in Telangana High Court.", "verified": True},
    {"name": "Adv. Sunita Patel", "specialization": ["Labour", "Employment"], "city": "Pune", "state": "Maharashtra", "experience_years": 8, "fee_min": 6000, "fee_max": 18000, "rating": 4.3, "reviews_count": 55, "phone": "+91-9876543216", "email": "sunita.patel@labourlaw.in", "bio": "Labour law expert helping both employees and employers navigate workplace disputes.", "verified": True},
    {"name": "Adv. Karthik Rajan", "specialization": ["Intellectual Property", "Corporate"], "city": "Chennai", "state": "Tamil Nadu", "experience_years": 16, "fee_min": 15000, "fee_max": 40000, "rating": 4.8, "reviews_count": 130, "phone": "+91-9876543217", "email": "karthik.rajan@iplaw.in", "bio": "Intellectual property rights specialist handling patents, trademarks, and copyright matters.", "verified": True},
    {"name": "Adv. Neha Gupta", "specialization": ["Consumer", "Criminal"], "city": "Kolkata", "state": "West Bengal", "experience_years": 9, "fee_min": 5000, "fee_max": 15000, "rating": 4.2, "reviews_count": 45, "phone": "+91-9876543218", "email": "neha.gupta@consumerlaw.in", "bio": "Consumer protection advocate fighting for fair practices and citizen rights.", "verified": True},
    {"name": "Adv. Rahul Verma", "specialization": ["Tax", "Corporate"], "city": "Mumbai", "state": "Maharashtra", "experience_years": 22, "fee_min": 25000, "fee_max": 50000, "rating": 4.9, "reviews_count": 250, "phone": "+91-9876543219", "email": "rahul.verma@taxlaw.in", "bio": "Senior tax consultant and corporate lawyer with 22 years of experience in ITAT and High Courts.", "verified": True},
    {"name": "Adv. Lakshmi Nair", "specialization": ["Family", "Civil"], "city": "Bangalore", "state": "Karnataka", "experience_years": 11, "fee_min": 8000, "fee_max": 22000, "rating": 4.5, "reviews_count": 78, "phone": "+91-9876543220", "email": "lakshmi.nair@familycourt.in", "bio": "Compassionate family law attorney specializing in divorce mediation and child custody.", "verified": True},
    {"name": "Adv. Arun Joshi", "specialization": ["Property", "Civil"], "city": "Delhi", "state": "Delhi", "experience_years": 25, "fee_min": 20000, "fee_max": 45000, "rating": 4.7, "reviews_count": 195, "phone": "+91-9876543221", "email": "arun.joshi@propertylaw.in", "bio": "Veteran property lawyer with expertise in land acquisition, title disputes, and RERA compliance.", "verified": True},
    {"name": "Adv. Deepa Krishnan", "specialization": ["Criminal", "Immigration"], "city": "Hyderabad", "state": "Telangana", "experience_years": 7, "fee_min": 5000, "fee_max": 15000, "rating": 4.1, "reviews_count": 35, "phone": "+91-9876543222", "email": "deepa.k@criminaldefense.in", "bio": "Young and dynamic criminal lawyer also handling immigration and visa-related legal issues.", "verified": False},
    {"name": "Adv. Sanjay Mehta", "specialization": ["Corporate", "Intellectual Property"], "city": "Mumbai", "state": "Maharashtra", "experience_years": 19, "fee_min": 18000, "fee_max": 42000, "rating": 4.6, "reviews_count": 155, "phone": "+91-9876543223", "email": "sanjay.mehta@corporateip.in", "bio": "Corporate IP lawyer helping startups and enterprises protect their innovations and brands.", "verified": True},
    {"name": "Adv. Fatima Khan", "specialization": ["Family", "Consumer"], "city": "Pune", "state": "Maharashtra", "experience_years": 13, "fee_min": 9000, "fee_max": 25000, "rating": 4.4, "reviews_count": 92, "phone": "+91-9876543224", "email": "fatima.khan@legalservices.in", "bio": "Experienced family and consumer law advocate with a passion for women's rights.", "verified": True},
    {"name": "Adv. Ganesh Rao", "specialization": ["Labour", "Civil"], "city": "Bangalore", "state": "Karnataka", "experience_years": 6, "fee_min": 4000, "fee_max": 12000, "rating": 3.9, "reviews_count": 28, "phone": "+91-9876543225", "email": "ganesh.rao@labourcourt.in", "bio": "Labour law practitioner specializing in industrial disputes and employee rights.", "verified": False},
    {"name": "Adv. Pooja Agarwal", "specialization": ["Tax", "Property"], "city": "Kolkata", "state": "West Bengal", "experience_years": 15, "fee_min": 12000, "fee_max": 30000, "rating": 4.5, "reviews_count": 110, "phone": "+91-9876543226", "email": "pooja.agarwal@taxadvisor.in", "bio": "Tax and property law expert helping clients with GST compliance, income tax, and real estate matters.", "verified": True},
    {"name": "Adv. Mohan Das", "specialization": ["Criminal", "Civil"], "city": "Delhi", "state": "Delhi", "experience_years": 23, "fee_min": 15000, "fee_max": 40000, "rating": 4.8, "reviews_count": 220, "phone": "+91-9876543227", "email": "mohan.das@criminallaw.in", "bio": "Renowned criminal defense lawyer with landmark case victories in Supreme Court of India.", "verified": True},
    {"name": "Adv. Revathi Subramaniam", "specialization": ["Consumer", "Labour"], "city": "Chennai", "state": "Tamil Nadu", "experience_years": 10, "fee_min": 7000, "fee_max": 20000, "rating": 4.3, "reviews_count": 65, "phone": "+91-9876543228", "email": "revathi.s@consumerforum.in", "bio": "Consumer and labour rights advocate fighting for justice in forums across Tamil Nadu.", "verified": True},
    {"name": "Adv. Imran Sheikh", "specialization": ["Property", "Corporate"], "city": "Ahmedabad", "state": "Gujarat", "experience_years": 17, "fee_min": 12000, "fee_max": 35000, "rating": 4.6, "reviews_count": 140, "phone": "+91-9876543229", "email": "imran.sheikh@propertylegal.in", "bio": "Expert in commercial property law, corporate real estate, and RERA disputes.", "verified": True},
    {"name": "Adv. Swati Jain", "specialization": ["Family", "Criminal"], "city": "Mumbai", "state": "Maharashtra", "experience_years": 5, "fee_min": 3000, "fee_max": 10000, "rating": 4.0, "reviews_count": 22, "phone": "+91-9876543230", "email": "swati.jain@legal.in", "bio": "Emerging family law attorney with focus on domestic violence cases and women empowerment.", "verified": False},
    {"name": "Adv. Ravi Shankar", "specialization": ["Immigration", "Corporate"], "city": "Bangalore", "state": "Karnataka", "experience_years": 12, "fee_min": 10000, "fee_max": 30000, "rating": 4.4, "reviews_count": 85, "phone": "+91-9876543231", "email": "ravi.shankar@immigrationlaw.in", "bio": "Immigration law specialist helping professionals and students with visa and citizenship matters.", "verified": True},
    {"name": "Adv. Kavitha Reddy", "specialization": ["Civil", "Property"], "city": "Hyderabad", "state": "Telangana", "experience_years": 14, "fee_min": 8000, "fee_max": 22000, "rating": 4.5, "reviews_count": 95, "phone": "+91-9876543232", "email": "kavitha.reddy@civillegal.in", "bio": "Civil litigation expert with deep knowledge of property laws in Telangana and Andhra Pradesh.", "verified": True},
    {"name": "Adv. Prakash Choudhury", "specialization": ["Criminal", "Consumer"], "city": "Kolkata", "state": "West Bengal", "experience_years": 20, "fee_min": 10000, "fee_max": 28000, "rating": 4.7, "reviews_count": 165, "phone": "+91-9876543233", "email": "prakash.c@criminaldefense.in", "bio": "Two decades of criminal defense experience in Calcutta High Court and Supreme Court.", "verified": True},
    {"name": "Adv. Nandini Pillai", "specialization": ["Intellectual Property", "Consumer"], "city": "Chennai", "state": "Tamil Nadu", "experience_years": 8, "fee_min": 8000, "fee_max": 25000, "rating": 4.2, "reviews_count": 50, "phone": "+91-9876543234", "email": "nandini.pillai@ipservices.in", "bio": "IP rights consultant specializing in software patents and digital copyright protection.", "verified": False},
    {"name": "Adv. Suresh Babu", "specialization": ["Labour", "Tax"], "city": "Pune", "state": "Maharashtra", "experience_years": 16, "fee_min": 10000, "fee_max": 28000, "rating": 4.5, "reviews_count": 108, "phone": "+91-9876543235", "email": "suresh.babu@labourlaw.in", "bio": "Experienced labour and tax lawyer advising both individuals and corporations.", "verified": True},
    {"name": "Adv. Anita Bose", "specialization": ["Family", "Civil"], "city": "Kolkata", "state": "West Bengal", "experience_years": 11, "fee_min": 6000, "fee_max": 18000, "rating": 4.3, "reviews_count": 72, "phone": "+91-9876543236", "email": "anita.bose@familymatters.in", "bio": "Family law practitioner handling matrimonial disputes, adoption, and succession matters.", "verified": True},
    {"name": "Adv. Manoj Tiwari", "specialization": ["Criminal", "Property"], "city": "Delhi", "state": "Delhi", "experience_years": 9, "fee_min": 7000, "fee_max": 20000, "rating": 4.1, "reviews_count": 48, "phone": "+91-9876543237", "email": "manoj.tiwari@legal.in", "bio": "Criminal and property lawyer with strong presence in Delhi District Courts.", "verified": False},
    {"name": "Adv. Divya Menon", "specialization": ["Corporate", "Tax"], "city": "Ahmedabad", "state": "Gujarat", "experience_years": 13, "fee_min": 12000, "fee_max": 32000, "rating": 4.6, "reviews_count": 102, "phone": "+91-9876543238", "email": "divya.menon@corporatetax.in", "bio": "Corporate tax advisor helping businesses with compliance, GST, and international taxation.", "verified": True},
    {"name": "Adv. Aditya Kapoor", "specialization": ["Consumer", "Civil"], "city": "Mumbai", "state": "Maharashtra", "experience_years": 4, "fee_min": 3000, "fee_max": 10000, "rating": 3.8, "reviews_count": 18, "phone": "+91-9876543239", "email": "aditya.kapoor@consumerrights.in", "bio": "Young advocate passionate about consumer rights and accessible legal services for all.", "verified": False},
]

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
            # Seed lawyers
            result = await db.execute(select(LawyerProfile).limit(1))
            if not result.scalar_one_or_none():
                for lawyer_data in SEED_LAWYERS:
                    lawyer = LawyerProfile(**lawyer_data)
                    db.add(lawyer)
                print("Seeded 30 lawyer profiles")

            # Seed a demo user for forum posts
            result = await db.execute(select(User).where(User.email == "demo@lexaid.in"))
            demo_user = result.scalar_one_or_none()
            if not demo_user:
                demo_user = User(
                    email="demo@lexaid.in",
                    hashed_password=hash_password("demo1234"),
                    full_name="LexAid Community",
                    city="Mumbai",
                    state="Maharashtra",
                )
                db.add(demo_user)
                await db.flush()
                await db.refresh(demo_user)

            # Seed forum posts
            result = await db.execute(select(ForumPost).limit(1))
            if not result.scalar_one_or_none():
                forum_posts_data = [
                    {"title": "Can my landlord increase rent mid-lease?", "content": "I signed a 11-month rent agreement in March 2024 at Rs 15,000/month. Now my landlord says he wants to increase it to Rs 18,000 from next month. The agreement doesn't mention mid-term increases. Can he legally do this? What are my rights as a tenant?", "category": "rent", "tags": ["rent", "tenant-rights", "agreement"]},
                    {"title": "Company not paying overtime — what legal action can I take?",  "content": "I work for an IT company in Bangalore. My contract says 9 hours/day but I regularly work 12-14 hours with no overtime pay. HR says 'it's industry standard.' Is this legal? What laws protect me and how do I file a complaint?", "category": "employment", "tags": ["overtime", "labour-law", "IT-sector"]},
                    {"title": "Bought defective phone online — seller refusing refund", "content": "I purchased a smartphone worth Rs 25,000 from an e-commerce site. It had a defective battery from day one. The seller is refusing refund and asking me to get it repaired. Can I file a consumer complaint? What are the steps?", "category": "consumer", "tags": ["consumer-rights", "e-commerce", "refund"]},
                    {"title": "Property dispute with sibling over inherited land", "content": "My father passed away without a will. We are 3 siblings. My elder brother is claiming the entire ancestral property (2 acres in Tamil Nadu). What are my legal rights to the property? How does Hindu Succession Act apply here?", "category": "property", "tags": ["inheritance", "property", "succession"]},
                    {"title": "Divorce process and child custody rights in India", "content": "I want to file for divorce (mutual consent) from my husband. We have a 5-year-old daughter. What is the legal process? How long does it take? What factors does the court consider for child custody?", "category": "family", "tags": ["divorce", "custody", "family-law"]},
                    {"title": "Neighbor filed false police complaint against me", "content": "My neighbor filed a false FIR against me claiming I threatened him. This is completely fabricated as we had a property boundary dispute. What can I do? Can I file for anticipatory bail? How do I prove the complaint is false?", "category": "criminal", "tags": ["false-FIR", "bail", "criminal-law"]},
                    {"title": "How to register a startup as an LLP in India?", "content": "I want to register my tech startup as a Limited Liability Partnership. What documents do I need? What is the process with MCA? How much does it cost? Are there any tax benefits for LLP over Pvt Ltd?", "category": "other", "tags": ["startup", "LLP", "registration"]},
                    {"title": "Can employer force me to serve 3-month notice period?", "content": "My employment contract has a 3-month notice period clause. I've received a better offer and want to leave in 1 month. Can my current employer legally enforce the 3-month notice? What if I pay the salary in lieu?", "category": "employment", "tags": ["notice-period", "resignation", "contract"]},
                    {"title": "Rights of tenant if landlord wants to sell the property", "content": "I've been renting this flat for 5 years with regular agreements. Now my landlord wants to sell the property and is asking me to vacate in 15 days. Is this legal? What notice period am I entitled to? Can the new owner evict me?", "category": "rent", "tags": ["eviction", "tenant-rights", "property-sale"]},
                    {"title": "Online fraud — how to file a cybercrime complaint?", "content": "I was scammed online for Rs 50,000 through a fake investment scheme. I have screenshots of conversations and payment receipts. How do I file a cybercrime complaint? Should I go to local police or cybercrime cell? What evidence do I need?", "category": "criminal", "tags": ["cybercrime", "online-fraud", "complaint"]},
                ]

                for post_data in forum_posts_data:
                    post = ForumPost(
                        user_id=demo_user.id,
                        **post_data,
                    )
                    db.add(post)

                await db.flush()

                # Add some replies to first few posts
                posts_result = await db.execute(
                    select(ForumPost).order_by(ForumPost.created_at).limit(5)
                )
                posts = posts_result.scalars().all()

                sample_replies = [
                    "Under the Transfer of Property Act, your landlord cannot unilaterally increase rent during the lease period unless specifically mentioned in the agreement. You have the right to continue at the agreed rent until the lease expires. Consult a lawyer for your specific situation.",
                    "Under the Factories Act and Shops & Establishments Act, overtime beyond prescribed hours must be compensated at double the ordinary rate. You can file a complaint with the Labour Commissioner of Karnataka. Keep records of your working hours as evidence.",
                    "You can file a consumer complaint under the Consumer Protection Act 2019. Since the amount is under Rs 50 lakh, approach the District Consumer Disputes Redressal Forum. File within 2 years of purchase. You're entitled to refund, replacement, or compensation.",
                    "Under the Hindu Succession Act 2005 (amended), all children — sons and daughters — have equal rights in ancestral property. Your brother cannot claim sole ownership. You should file a partition suit in civil court to get your legal share.",
                    "For mutual consent divorce under Section 13B of Hindu Marriage Act, both parties file jointly. There's a 6-month cooling period (can be waived). For custody, the court prioritizes child welfare. For children under 5, mothers generally get custody. The entire process takes 6-18 months.",
                ]

                for i, post in enumerate(posts):
                    if i < len(sample_replies):
                        reply = ForumReply(
                            post_id=post.id,
                            user_id=demo_user.id,
                            content=sample_replies[i],
                            upvotes=5 + i * 3,
                            is_accepted=i < 3,
                        )
                        db.add(reply)
                        if i < 3:
                            post.is_answered = True

                print("Seeded 10 forum posts with replies")

            # Seed news
            result = await db.execute(select(NewsArticle).limit(1))
            if not result.scalar_one_or_none():
                for news_data in SEED_NEWS:
                    article = NewsArticle(**news_data)
                    db.add(article)
                print("Seeded 5 news articles")

            await db.commit()
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
