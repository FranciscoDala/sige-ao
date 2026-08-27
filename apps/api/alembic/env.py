import asyncio
import os
import sys
from logging.config import fileConfig
from dotenv import load_dotenv
import ssl

from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import AsyncEngine, create_async_engine

from alembic import context

load_dotenv()
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app.db.database import Base
from app.models import models_user # importa todos models aqui

config = context.config
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata

def get_url():
    url = os.getenv("DATABASE_URL")
    if not url:
        raise ValueError("DATABASE_URL não encontrada no .env")
    if url.startswith("postgresql://"):
        url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
    return url

async def run_migrations_online() -> None:
    url = get_url()

    # Cria SSL context pro Neon
    ssl_context = ssl.create_default_context()

    connectable: AsyncEngine = create_async_engine(
        url,
        poolclass=pool.NullPool,
        connect_args={"ssl": ssl_context}
    )

    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)

    await connectable.dispose()

def do_run_migrations(connection: Connection):
    context.configure(connection=connection, target_metadata=target_metadata)
    with context.begin_transaction():
        context.run_migrations()

asyncio.run(run_migrations_online())
