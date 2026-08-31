import asyncio
from pathlib import Path
from dotenv import load_dotenv
from sqlalchemy import text # 1. Importa text

ROOT_DIR = Path(__file__).resolve().parent.parent # sobe 1 pasta pra raiz sige-ao
load_dotenv(dotenv_path=ROOT_DIR / '.env')

from app.db.database import engine, Base
import app.models.models_escola # 2. Corrige o import

async def reset():
    async with engine.begin() as conn:
        print("Apagando TUDO do banco...")
        await conn.execute(text("DROP SCHEMA public CASCADE")) # 3. Usa text()
        await conn.execute(text("CREATE SCHEMA public"))
        await conn.execute(text("GRANT ALL ON SCHEMA public TO public"))

        print("Criando tabelas novas...")
        await conn.run_sync(Base.metadata.create_all)
    print("✅ Banco resetado com sucesso!")

asyncio.run(reset())
