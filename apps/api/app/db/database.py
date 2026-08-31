from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import declarative_base
from urllib.parse import urlparse, parse_qs, urlunparse, urlencode
import os

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL não está definida nas variáveis de ambiente")

# 1. Converte para asyncpg
DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)

# 2. Parseia a URL pra remover sslmode
parsed = urlparse(DATABASE_URL)
query = parse_qs(parsed.query)
query.pop("sslmode", None) # <-- Remove sslmode da query

# 3. Monta a URL limpa
clean_url = urlunparse((
    parsed.scheme, parsed.netloc, parsed.path,
    parsed.params, urlencode(query, doseq=True), parsed.fragment
))

# 4. Cria engine com ssl via connect_args
engine = create_async_engine(
    clean_url,
    echo=False,
    pool_pre_ping=True,
    connect_args={"ssl": "require"} # <-- asyncpg só aceita assim
)

AsyncSessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
Base = declarative_base()

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
