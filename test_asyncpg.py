import asyncio
from sqlalchemy.ext.asyncio import create_async_engine

async def main():
    engine = create_async_engine('postgresql+asyncpg://neondb_owner:npg_7MrDQsiH8zcq@ep-dry-queen-aj5wm672.c-3.us-east-2.aws.neon.tech/neondb?ssl=require')
    try:
        async with engine.begin() as conn:
            print('success')
    except Exception as e:
        print('Error:', e)

asyncio.run(main())
