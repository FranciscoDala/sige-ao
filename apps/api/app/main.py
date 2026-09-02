from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
from sqlalchemy import text
import logging, traceback

from app.db.database import engine, Base
from app.api.v1 import routers_escola, routers_auth, routers_usuario

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def import_all_models():
    from app.models import models_escola

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("SIGE-AO API a iniciar...")
    import_all_models()
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
            await conn.execute(text("SELECT 1"))
            logger.info("DB Connected e tabelas verificadas")
    except Exception as e:
        logger.error(f"ERRO CRITICO DB: {e}\n{traceback.format_exc()}")
    yield
    await engine.dispose()

app = FastAPI(title="SIGE-AO API", version="1.0.0", lifespan=lifespan) # <-- CORRIGIDO: tirei root_path="/api/v1"

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://sige-ao.onrender.com", "http://localhost:5173"],
    allow_credentials=True, allow_methods=["*"], allow_headers=["*"], expose_headers=["*"]
)

@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    logger.error(f"Erro 500 na rota {request.url}: {exc}\n{traceback.format_exc()}")
    return JSONResponse(status_code=500, content={"detail": str(exc)})

app.include_router(routers_auth.router, prefix="/api/v1") # <-- IMPORTANTE: add prefix aqui
app.include_router(routers_escola.router, prefix="/api/v1")
app.include_router(routers_usuario.router, prefix="/api/v1")

@app.get("/health")
async def health(): return {"status": "ok"}
