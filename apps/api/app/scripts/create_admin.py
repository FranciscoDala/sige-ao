import asyncio
import os
from dotenv import load_dotenv
load_dotenv()

from app.db.database import AsyncSessionLocal
from app.services.services_user import create_user # <-- IMPORT DIRETO

async def main():
    async with AsyncSessionLocal() as db:
        await create_user(
            db=db,
            email="admin@sige.ao",
            full_name="Admin SIGE",
            password="admin123"
        )
        print("Admin criado")

asyncio.run(main())
