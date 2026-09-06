from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_

from app.db.database import get_db
from app.models.models_escola import Usuario, UsuarioEscola, Escola, NivelAcesso
from app.schemas.schemas_escola import LoginRequest, TokenResponse, UserInToken
from app.core.security import verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["Autenticação"])

@router.post("/login", response_model=TokenResponse)
async def login(dados: LoginRequest, db: AsyncSession = Depends(get_db)):
    # 1. Busca usuario ativo pelo email
    result = await db.execute(select(Usuario).where(Usuario.email == dados.email))
    usuario = result.scalar_one_or_none()
    if not usuario:
        raise HTTPException(status_code=401, detail="Usuário ou senha inválidos")

    if not verify_password(dados.senha, str(usuario.senha)):
        raise HTTPException(status_code=401, detail="Usuário ou senha inválidos")

    if not usuario.ativo:
        raise HTTPException(status_code=403, detail="Usuário inativo")

    # 2. LOGIN SUPER ADMIN - escola_id vazio
    if dados.escola_id is None:
        result = await db.execute(
            select(UsuarioEscola).where(
                and_(
                    UsuarioEscola.usuario_id == usuario.id,
                    UsuarioEscola.escola_id == None,
                    UsuarioEscola.nivel == NivelAcesso.MINISTERIO
                )
            )
        )
        super_admin = result.scalar_one_or_none()
        if not super_admin:
            raise HTTPException(status_code=401, detail="Usuário não é Super Admin")

        access_token = create_access_token({
            "sub": str(usuario.id),
            "email": usuario.email,
            "nivel": NivelAcesso.MINISTERIO.value,
            "escola_id": None
        })
        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            nivel=NivelAcesso.MINISTERIO,
            expires_in=28800,
            user=UserInToken(
                id=usuario.id,
                email=usuario.email,
                nome=usuario.nome,
                nivel=NivelAcesso.MINISTERIO,
                escola_id=None
            )
        )

    # 3. LOGIN ESCOLA - valida vinculo + escola ativa
    # Busca escola
    result = await db.execute(select(Escola).where(Escola.id == dados.escola_id))
    escola = result.scalar_one_or_none()
    if not escola:
        raise HTTPException(status_code=404, detail="Escola não encontrada")

    if not escola.ativo:
        raise HTTPException(status_code=403, detail="Escola inativa")

    # Busca vinculo usuario-escola
    result = await db.execute(
        select(UsuarioEscola).where(
            and_(
                UsuarioEscola.usuario_id == usuario.id,
                UsuarioEscola.escola_id == dados.escola_id
            )
        )
    )
    vinculo = result.scalar_one_or_none()
    if not vinculo:
        raise HTTPException(status_code=401, detail="Usuário não vinculado a esta escola")

    access_token = create_access_token({
        "sub": str(usuario.id),
        "email": usuario.email,
        "nivel": vinculo.nivel.value,
        "escola_id": vinculo.escola_id
    })
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        nivel=vinculo.nivel,
        expires_in=28800,
        user=UserInToken(
            id=usuario.id,
            email=usuario.email,
            nome=usuario.nome,
            nivel=vinculo.nivel,
            escola_id=vinculo.escola_id
        )
    )
