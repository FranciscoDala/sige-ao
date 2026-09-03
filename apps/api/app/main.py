from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles # <- ADD ISSO
from contextlib import asynccontextmanager
from sqlalchemy import text

from app.db.database import engine, Base
from app.api.v1 import routers_escola, routers_auth, routers_usuario

def import_all_models():
    from app.models import models_escola

@asynccontextmanager
async def lifespan(app: FastAPI):
    import_all_models()
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        await conn.execute(text("SELECT 1"))
    yield
    await engine.dispose()

app = FastAPI(title="SIGE-AO API", version="1.0.0", lifespan=lifespan)

# Servir arquivos estáticos da pasta /static
app.mount("/static", StaticFiles(directory="static"), name="static") # <- ADD ISSO

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://sige-ao.onrender.com", "http://localhost:5173", "*"], # <- * pra teste
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

app.include_router(routers_auth.router, prefix="/api/v1")
app.include_router(routers_escola.router, prefix="/api/v1")
app.include_router(routers_usuario.router, prefix="/api/v1")

@app.get("/health")
async def health():
    return {"status": "ok"}
