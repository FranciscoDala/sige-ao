import asyncio
import os
import uuid
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from apps.api.app.db.database import AsyncSessionLocal
from apps.api.app.models.models_escola import Usuario, Escola, UsuarioEscola, NivelAcesso
from apps.api.app.core.security import get_password_hash


async def create_admin():
    async with AsyncSessionLocal() as db: # <-- tira o # type: AsyncSession
        # 1. Criar escola se não existir
        escola_id = "MINED001"
        result = await db.execute(select(Escola).where(Escola.id == escola_id))
        escola = result.scalar_one_or_none()
        if not escola:
            escola = Escola(id=escola_id, nome="MINISTÉRIO DA EDUCAÇÃO", ativo=True)
            db.add(escola)
            await db.commit()
            print(f"Escola {escola.nome} criada")

        # 2. Criar usuario
        email = "admin@mined.gov.ao"
        senha = "Admin123@"

        result = await db.execute(select(Usuario).where(Usuario.email == email))
        usuario = result.scalar_one_or_none()
        if not usuario:
            usuario = Usuario(
                id=uuid.uuid4(),
                nome="Administrador MINED",
                email=email,
                senha_hash=get_password_hash(senha),
                ativo=True
            )
            db.add(usuario)
            await db.commit()
            await db.refresh(usuario)
            print(f"Usuario {email} criado")

        # 3. Vincular usuario a escola
        result = await db.execute(select(UsuarioEscola).where(UsuarioEscola.usuario_id == usuario.id))
        vinculo = result.scalar_one_or_none()
        if not vinculo:
            vinculo = UsuarioEscola(
                id=uuid.uuid4(),
                usuario_id=usuario.id,
                escola_id=escola.id,
                nivel=NivelAcesso.MINISTERIO
            )
            db.add(vinculo)
            await db.commit()
            print(f"Vinculo MINISTERIO criado")

        print("\n✅ Admin criado com sucesso!")
        print(f"Email: {email}")
        print(f"Senha: {senha}")
        print(f"Escola: {escola_id}")

if __name__ == "__main__":
    asyncio.run(create_admin())
