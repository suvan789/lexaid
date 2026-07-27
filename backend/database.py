import os
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./lexaid.db")

engine = create_async_engine(DATABASE_URL, echo=False, future=True)

async_session_factory = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


async def get_db():
    """Async dependency that yields a database session."""
    async with async_session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def create_all_tables():
    """Create all database tables on application startup and apply migrations."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        
        # Safely ensure required columns exist in PostgreSQL/SQLite for live deployments
        is_postgres = "postgresql" in DATABASE_URL
        if is_postgres:
            try:
                await conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'client';"))
            except Exception:
                pass

            try:
                await conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS lawyer_profile_id UUID;"))
            except Exception:
                pass

            try:
                await conn.execute(text("ALTER TABLE appointments ADD COLUMN IF NOT EXISTS issue_description TEXT;"))
            except Exception:
                pass
        else:
            # SQLite fallback
            try:
                await conn.execute(text("ALTER TABLE users ADD COLUMN role VARCHAR(50) DEFAULT 'client'"))
            except Exception:
                pass
            try:
                await conn.execute(text("ALTER TABLE users ADD COLUMN lawyer_profile_id CHAR(36)"))
            except Exception:
                pass
            try:
                await conn.execute(text("ALTER TABLE appointments ADD COLUMN issue_description TEXT"))
            except Exception:
                pass
