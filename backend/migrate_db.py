import asyncio
from sqlalchemy import text
from database import engine

async def migrate():
    async with engine.begin() as conn:
        try:
            await conn.execute(text("ALTER TABLE users ADD COLUMN is_verified BOOLEAN DEFAULT FALSE"))
            print("Successfully added is_verified column")
        except Exception as e:
            print("Error adding column (maybe it already exists?):", e)

asyncio.run(migrate())
