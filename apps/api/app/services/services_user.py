from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.models_user import User
from app.core.security import get_password_hash

async def get_user_by_email(db: AsyncSession, email: str):
    result = await db.execute(select(User).where(User.email == email))
    return result.scalar_one_or_none()

async def create_user(db: AsyncSession, email: str, full_name: str, password: str):
    hashed_password = get_password_hash(password)
    db_user = User(email=email, full_name=full_name, hashed_password=hashed_password)
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user
