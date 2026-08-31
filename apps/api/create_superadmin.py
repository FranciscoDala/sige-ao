import asyncio, uuid, os
from pathlib import Path
from dotenv import load_dotenv
from sqlalchemy import select

# Sobe 2 pastas pra achar a raiz e carregar o .env
ROOT_DIR = Path(__file__).resolve().parent.parent
load_dotenv(dotenv_path=ROOT_DIR / '.env')

from app.db.database import AsyncSessionLocal
from app.models.models_escola import Usuario, UsuarioEscola, NivelAcesso
from app.core.security import get_password_hash

async def create():
    db_url = os.getenv('DATABASE_URL')
    print(f"Usando DB: {db_url[:30] if db_url else 'NAO ENCONTRADA'}...") # pra debugar

    async with AsyncSessionLocal() as db:
        email = "superadmin@sige-ao.gov.ao"
        senha = "SuperAdmin123@"

        result = await db.execute(select(Usuario).where(Usuario.email == email))
        if result.scalar_one_or_none():
            print(f"⚠️ Super Admin já existe: {email}")
            return

        u = Usuario(id=uuid.uuid4(), nome="Super Admin SIGE", email=email, senha_hash=get_password_hash(senha))
        db.add(u)
        await db.flush()

        v = UsuarioEscola(id=uuid.uuid4(), usuario_id=u.id, escola_id=None, nivel=NivelAcesso.MINISTERIO)
        db.add(v)
        await db.commit()
        print(f"✅ Super Admin criado com sucesso!")

asyncio.run(create())
