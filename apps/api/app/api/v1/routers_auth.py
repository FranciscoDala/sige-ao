from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
import logging # <-- ADD

from app.db.database import get_db
from app.models.models_escola import Usuario, UsuarioEscola, NivelAcesso
from app.schemas.schemas_escola import LoginRequest, TokenResponse
from app.core.security import verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["Autenticação"])
logger = logging.getLogger(__name__) # <-- ADD

@router.post("/login", response_model=TokenResponse)
async def login(dados: LoginRequest, db: AsyncSession = Depends(get_db)):
    logger.info(f"[LOGIN] Tentativa: email={dados.email}, escola_id={dados.escola_id}") # <-- ADD

    try:
        result = await db.execute(select(Usuario).where(Usuario.email == dados.email, Usuario.ativo == True))
        usuario = result.scalar_one_or_none()
        logger.info(f"[LOGIN] Usuario encontrado: {usuario.id if usuario else 'NENHUM'}") # <-- ADD

        if not usuario:
            raise HTTPException(status_code=401, detail="Usuário ou senha inválidos")

        senha_ok = verify_password(dados.senha, str(usuario.senha))
        logger.info(f"[LOGIN] Senha OK: {senha_ok}") # <-- ADD

        if not senha_ok:
            raise HTTPException(status_code=401, detail="Usuário ou senha inválidos")

        # FLUXO 1: SUPER ADMIN
        if dados.escola_id is None:
            logger.info("[LOGIN] Fluxo: SUPER ADMIN") # <-- ADD
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
            logger.info(f"[LOGIN] Vinculo MINISTERIO: {super_admin.id if super_admin else 'NENHUM'}") # <-- ADD

            if super_admin:
                access_token = create_access_token({"sub": str(usuario.id), "email": usuario.email, "nivel": "MINISTERIO", "escola_id": None})
                response = {
                    "access_token": access_token,
                    "token_type": "bearer",
                    "nivel": NivelAcesso.MINISTERIO.value,
                    "expires_in": 28800,
                    "user": {"id": str(usuario.id), "email": usuario.email, "nome": usuario.nome, "escola_id": None}
                }
                logger.info(f"[LOGIN] Sucesso Super Admin: {response}") # <-- ADD
                return response

        # FLUXO 2: USUARIO NORMAL
        logger.info("[LOGIN] Fluxo: USUARIO NORMAL") # <-- ADD
        if dados.escola_id is None:
            raise HTTPException(status_code=400, detail="Selecione uma escola para fazer login")

        result = await db.execute(select(UsuarioEscola).where(and_(UsuarioEscola.usuario_id == usuario.id, UsuarioEscola.escola_id == dados.escola_id)))
        vinculo = result.scalar_one_or_none()
        if not vinculo:
            raise HTTPException(status_code=401, detail="Usuário não vinculado a esta escola")

        access_token = create_access_token({"sub": str(usuario.id), "email": usuario.email, "nivel": vinculo.nivel.value, "escola_id": vinculo.escola_id})
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "nivel": vinculo.nivel.value,
            "expires_in": 28800,
            "user": {"id": str(usuario.id), "email": usuario.email, "nome": usuario.nome, "escola_id": vinculo.escola_id}
        }

    except Exception as e:
        logger.error(f"[LOGIN] ERRO 500: {e}", exc_info=True) # <-- ADD ISSO É O MAIS IMPORTANTE
        raise
