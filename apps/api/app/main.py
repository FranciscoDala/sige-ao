import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from sqlalchemy import text # <-- IMPORTA ISSO

from app.db.database import engine, Base
from app.api.v1 import routers_escola, routers_auth, routers_usuario

@asynccontextmanager
async def lifespan(app: FastAPI):
    # TIRA O create_all DAQUI. Deixa só testar a conexão
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1")) # <-- USA text()
            print("DB Connected")
    except Exception as e:
        print(f"DB Connection Error: {e}")
    yield
    await engine.dispose()

app = FastAPI(title="SIGE-AO API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://sige-ao.onrender.com",
    ],
    allow_credentials=True, allow_methods=["*"], allow_headers=["*"],
)

app.include_router(routers_auth.router, prefix="/api/v1")
app.include_router(routers_escola.router, prefix="/api/v1")
app.include_router(routers_usuario.router, prefix="/api/v1")

@app.get("/health")
async def health(): # <-- tem que ser async
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1")) # <-- USA text() AQUI TAMBÉM
        return {"status": "ok", "db": "connected"}
    except Exception as e:
        return {"status": "error", "db": str(e)}

@app.get("/")
def root():
    return {"msg": "SIGE-AO API Online"}
