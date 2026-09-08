from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession
import logging

from app.db.database import get_db
from app.models.models_escola import Escola, NivelAcesso, Usuario, UsuarioEscola
from app.schemas.schemas_escola import LoginRequest, TokenResponse, UserInToken
from app.core.security import create_access_token, get_current_user, verify_password

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["Autenticação"])


def _build_token_payload(usuario: Usuario, nivel: str, escola_id: str | None = None) -> dict:
    return {
        "sub": str(usuario.id),
        "email": usuario.email,
        "nome": usuario.nome,
        "nivel": nivel,
        "escola_id": escola_id,
    }


@router.post("/login", response_model=TokenResponse)
async def login(dados: LoginRequest, db: AsyncSession = Depends(get_db)):
    email = (dados.email or "").strip().lower()
    senha = dados.senha or ""

    if not email or not senha:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email e senha são obrigatórios"
        )

    result = await db.execute(select(Usuario).where(Usuario.email == email))
    usuario = result.scalar_one_or_none()

    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuário ou senha inválidos"
        )

    if not verify_password(senha, usuario.senha):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuário ou senha inválidos"
        )

    if not usuario.ativo:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Usuário inativo"
        )

    is_super_admin_login = dados.escola_id is None or str(dados.escola_id).strip() == ""

    # LOGIN SUPER ADMIN
    if is_super_admin_login:
        result = await db.execute(
            select(UsuarioEscola).where(
                and_(
                    UsuarioEscola.usuario_id == usuario.id,
                    UsuarioEscola.escola_id.is_(None),
                    UsuarioEscola.nivel == NivelAcesso.MINISTERIO
                )
            )
        )
        super_admin = result.scalar_one_or_none()

        if not super_admin:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Usuário não é Super Admin"
            )

        token_payload = _build_token_payload(
            usuario=usuario,
            nivel=NivelAcesso.MINISTERIO.value,
            escola_id=None
        )

        access_token = create_access_token(token_payload)

        logger.info(f"[LOGIN] user={usuario.email} nivel=MINISTERIO escola_id=None")

        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            nivel=NivelAcesso.MINISTERIO.value,
            expires_in=60 * 24 * 60,
            user=UserInToken(
                id=usuario.id,
                email=usuario.email,
                nome=usuario.nome,
                nivel=NivelAcesso.MINISTERIO.value,
                escola_id=None
            )
        )

    # LOGIN POR ESCOLA
    result = await db.execute(select(Escola).where(Escola.id == dados.escola_id))
    escola = result.scalar_one_or_none()

    if not escola:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Escola não encontrada"
        )

    if not escola.ativo:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Escola inativa"
        )

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
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuário não vinculado a esta escola"
        )

    token_payload = _build_token_payload(
        usuario=usuario,
        nivel=vinculo.nivel.value,
        escola_id=str(vinculo.escola_id) if vinculo.escola_id else None
    )

    access_token = create_access_token(token_payload)

    logger.info(
        f"[LOGIN] user={usuario.email} nivel={vinculo.nivel.value} escola_id={vinculo.escola_id}"
    )

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        nivel=vinculo.nivel.value,
        expires_in=60 * 24 * 60,
        user=UserInToken(
            id=usuario.id,
            email=usuario.email,
            nome=usuario.nome,
            nivel=vinculo.nivel.value,
            escola_id=str(vinculo.escola_id) if vinculo.escola_id else None
        )
    )


@router.get("/me")
async def me(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    usuario = await db.get(Usuario, current_user["user_id"])

    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuário não encontrado"
        )

    return {
        "id": str(usuario.id),
        "email": usuario.email,
        "nome": usuario.nome,
        "nivel": current_user.get("nivel"),
        "escola_id": current_user.get("escola_id"),
    }
