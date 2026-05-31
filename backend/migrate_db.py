import asyncio
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine

async def migrate():
    engine = create_async_engine('postgresql+asyncpg://neondb_owner:npg_7MrDQsiH8zcq@ep-dry-queen-aj5wm672.c-3.us-east-2.aws.neon.tech/neondb?ssl=require')
    async with engine.begin() as conn:
        try:
            await conn.execute(text("ALTER TABLE users ADD COLUMN is_verified BOOLEAN DEFAULT FALSE"))
            print("Successfully added is_verified column to Neon DB")
        except Exception as e:
            print("Error adding column (maybe it already exists?):", e)

asyncio.run(migrate())
