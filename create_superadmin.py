import asyncio, uuid
from sqlalchemy import select
from apps.api.app.db.database import AsyncSessionLocal
from apps.api.app.models.models_escola import Usuario, UsuarioEscola, NivelAcesso
from apps.api.app.core.security import get_password_hash

async def create():
    async with AsyncSessionLocal() as db:
        email = "superadmin@sige-ao.gov.ao"
        senha = "SuperAdmin123@"
        result = await db.execute(select(Usuario).where(Usuario.email == email))
        if not result.scalar_one_or_none():
            u = Usuario(id=uuid.uuid4(), nome="Super Admin SIGE", email=email, senha_hash=get_password_hash(senha))
            db.add(u); await db.commit(); await db.refresh(u)
            v = UsuarioEscola(id=uuid.uuid4(), usuario_id=u.id, escola_id=None, nivel=NivelAcesso.MINISTERIO) # <-- SEM ESCOLA
            db.add(v); await db.commit()
            print(f"✅ Super Admin criado: {email} / {senha}")
asyncio.run(create())
