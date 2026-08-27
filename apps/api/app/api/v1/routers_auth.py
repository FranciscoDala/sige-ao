from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.schemas.shemas_user import UserCreate, UserLogin, Token
from app.db.database import get_db
from app.services import services_user # <-- AQUI
from app.core.security import create_access_token, verify_password

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register")
async def register(user: UserCreate, db: AsyncSession = Depends(get_db)):
    db_user = await services_user.get_user_by_email(db, user.email) # <-- AQUI
    if db_user:
        raise HTTPException(status_code=400, detail="Email já cadastrado")
    await services_user.create_user(db, user.email, user.full_name, user.password) # <-- AQUI
    return {"msg": "Usuário criado com sucesso"}

@router.post("/login", response_model=Token)
async def login(user: UserLogin, db: AsyncSession = Depends(get_db)):
    db_user = await services_user.get_user_by_email(db, user.email) # <-- AQUI
    if not db_user or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Credenciais inválidas")
    access_token = create_access_token(data={"sub": db_user.email})
    return {"access_token": access_token, "token_type": "bearer"}
