from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
from sqlalchemy import text
import logging, traceback

from app.db.database import engine, Base
from app.api.v1 import routers_escola, routers_auth, routers_usuario

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("SIGE-AO API a iniciar...")
    try:
        async with engine.begin() as conn:
            await conn.execute(text("SELECT 1"))
            logger.info("DB Connected com sucesso")
    except Exception as e:
        logger.error(f"ERRO CRITICO DB: {e}\n{traceback.format_exc()}")
    yield
    await engine.dispose()
    logger.info("API a desligar...")

app = FastAPI(
    title="SIGE-AO API",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    root_path="/api/v1" # <- ISSO AQUI É A CHAVE. Tira o /api/v1 dos includes
)

# CORS IGUAL STOCKBOT
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://sige-ao.onrender.com", # <- SEU FRONT
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

logger.info("CORS liberado para: https://sige-ao.onrender.com")

@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    logger.error(f"Erro 500 nao tratado na rota {request.url}: {exc}\n{traceback.format_exc()}")
    return JSONResponse(status_code=500, content={"detail": f"Erro interno: {str(exc)}"})

# AGORA SEM PREFIXO PORQUE JA TEM root_path="/api/v1"
app.include_router(routers_auth.router, tags=["Auth"])
app.include_router(routers_escola.router, tags=["Escolas"])
app.include_router(routers_usuario.router, tags=["Usuarios"])

@app.get("/health", tags=["health"])
async def health():
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        return {"status": "ok", "db": "connected"}
    except Exception as e:
        return {"status": "error", "db": str(e)}

@app.get("/", tags=["root"])
def root():
    return {"msg": "SIGE-AO API Online"}
