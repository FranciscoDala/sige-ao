import os
import logging
import traceback
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
from sqlalchemy import text

from app.db.database import engine, Base
from app.core.config import settings
from app.api.v1 import routers_escola, routers_auth, routers_usuario

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

def import_all_models():
    logger.info("Forçando import de todos os models...")
    from app.models import models_escola
    tabelas = sorted(list(Base.metadata.tables.keys()))
    logger.info(f"Models registrados: {', '.join(tabelas)}")
    logger.info(f"Total: {len(tabelas)} tabelas mapeadas.")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("SIGE-AO API a iniciar...")
    import_all_models()

    async with engine.begin() as conn:
        table_exists = await conn.run_sync(lambda sync_conn: sync_conn.dialect.has_table(sync_conn, "escolas"))
        if not table_exists:
            logger.warning("Tabelas não encontradas. Criando tudo no postgres...")
            await conn.run_sync(Base.metadata.create_all)
        else:
            logger.info("Tabelas já existem. Pulando criação.")

        await conn.execute(text("SELECT 1"))
    yield

    await engine.dispose()
    logger.info("API a desligar...")

app = FastAPI(
    title="SIGE-AO API",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS CORRIGIDO
origins = [
    "https://sige-ao.onrender.com",  # PROD FRONT
    "http://localhost:5173",         # VITE DEV
    "http://localhost:3000",         # NEXT DEV
]
origins.extend(getattr(settings, "ALLOWED_ORIGINS_LIST", [])) # 👈 safe

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https://.*\.onrender\.com", # 👈 Libera qualquer preview do render
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

logger.info(f"CORS liberado para: {origins}")

# HANDLER DE ERRO 500
@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    logger.error(f"Erro 500 nao tratado na rota {request.url}: {exc}\n{traceback.format_exc()}")
    return JSONResponse(status_code=500, content={"detail": f"Erro interno: {str(exc)}"})

app.include_router(routers_auth.router, prefix="/api/v1")
app.include_router(routers_escola.router, prefix="/api/v1")
app.include_router(routers_usuario.router, prefix="/api/v1")

@app.get("/health")
async def health():
    return {"status": "ok"}
