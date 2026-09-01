import asyncio
from app.db.database import engine, Base

async def create():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("Tabelas criadas com sucesso!")
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(create())
