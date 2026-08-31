from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.db.database import engine, Base
from app.api.v1 import routers_escola, routers_auth, routers_usuario # <-- 1. Importa

@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    await engine.dispose()

app = FastAPI(title="SIGE-AO API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://sige-ao.onrender.com"],
    allow_credentials=True, allow_methods=["*"], allow_headers=["*"],
)

app.include_router(routers_auth.router, prefix="/api/v1")
app.include_router(routers_escola.router, prefix="/api/v1")
app.include_router(routers_usuario.router, prefix="/api/v1") # <-- 2. Registra

@app.get("/health")
def health():
    return {"status": "ok"}
