from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_
from typing import List, Optional
import uuid

from app.db.database import get_db
from app.models.models_escola import Usuario, UsuarioEscola, Escola, NivelAcesso
from app.schemas.schemas_escola import UsuarioVinculoCreate, UsuarioVinculoResponse
from app.core.security import get_current_user, get_password_hash

router = APIRouter(prefix="/usuarios", tags=["Usuários"])

def check_permissao_criar_usuario(current_user: dict, escola_id_target: Optional[str]):
    """Só MINISTERIO pode criar em qualquer escola. DIRECAO só na própria escola"""
    nivel = current_user["nivel"]
    escola_id_user = current_user["escola_id"]

    if nivel == "MINISTERIO":
        return
    if nivel == "DIRECAO" and escola_id_user == escola_id_target:
        return

    raise HTTPException(status_code=403, detail="Sem permissão para criar usuário nesta escola")

def check_permissao_listar(current_user: dict):
    """Só MINISTERIO pode listar todos. Outros só veem da própria escola"""
    if current_user["nivel"]!= "MINISTERIO":
        raise HTTPException(status_code=403, detail="Sem permissão para listar todos os usuários")

@router.get("/", response_model=List[UsuarioVinculoResponse])
async def listar_usuarios(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
    tipo: Optional[str] = Query(None, description="ministerio | escola"),
    ativo: Optional[bool] = Query(None),
    perfil: Optional[str] = Query(None, description="admin | super_admin | suporte"),
    escola_id: Optional[str] = Query(None),
):
    check_permissao_listar(current_user)

    # Base: Join Usuario com UsuarioEscola
    stmt = select(Usuario, UsuarioEscola, Escola).join(
        UsuarioEscola, Usuario.id == UsuarioEscola.usuario_id
    ).join(
        Escola, UsuarioEscola.escola_id == Escola.id, isouter=True
    )

    filtros = []

    # 1. FILTRO TIPO: ministerio
    if tipo == "ministerio":
        # Usuario do ministerio = nivel MINISTERIO e escola_id IS NULL
        filtros.append(UsuarioEscola.nivel == NivelAcesso.MINISTERIO)
        filtros.append(UsuarioEscola.escola_id.is_(None))
    else:
        # Se não for ministerio, lista só da escola
        escola_filtro = escola_id or current_user.get("escola_id")
        if not escola_filtro:
            raise HTTPException(status_code=400, detail="escola_id obrigatório")
        filtros.append(UsuarioEscola.escola_id == escola_filtro)

    # 2. FILTRO ATIVO
    if ativo is not None:
        filtros.append(Usuario.ativo == ativo)

    # 3. FILTRO PERFIL: mapeia do front pra enum do back
    if perfil:
        mapa_perfil = {
            "super_admin": NivelAcesso.MINISTERIO,
            "admin": NivelAcesso.DIRECAO,
            "suporte": NivelAcesso.SECRETARIO
        }
        if perfil in mapa_perfil:
            filtros.append(UsuarioEscola.nivel == mapa_perfil[perfil])

    if filtros:
        stmt = stmt.where(and_(*filtros))

    result = await db.execute(stmt)
    rows = result.all()

    response = []
    for usuario, vinculo, escola in rows:
        response.append({
            "id": usuario.id,
            "nome": usuario.nome,
            "email": usuario.email,
            "nivel": vinculo.nivel,
            "escola": escola
        })
    return response

@router.post("/", response_model=UsuarioVinculoResponse, status_code=201)
async def criar_usuario(
    dados: UsuarioVinculoCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    escola = None

    if dados.nivel == NivelAcesso.MINISTERIO:
        dados.escola_id = None
    else:
        check_permissao_criar_usuario(current_user, dados.escola_id)
        result = await db.execute(select(Escola).where(Escola.id == dados.escola_id))
        escola = result.scalar_one_or_none()
        if not escola:
            raise HTTPException(status_code=404, detail="Escola não encontrada")

    result = await db.execute(select(Usuario).where(Usuario.email == dados.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email já cadastrado")

    novo_usuario = Usuario(
        id=uuid.uuid4(),
        nome=dados.nome,
        email=dados.email,
        senha=get_password_hash(dados.senha),
        telefone=dados.telefone,
        ativo=True
    )
    db.add(novo_usuario)
    await db.flush()

    novo_vinculo = UsuarioEscola(
        id=uuid.uuid4(),
        usuario_id=novo_usuario.id,
        escola_id=dados.escola_id, # Pode ser None
        nivel=dados.nivel
    )
    db.add(novo_vinculo)
    await db.commit()
    await db.refresh(novo_usuario)

    return {
        "id": novo_usuario.id,
        "nome": novo_usuario.nome,
        "email": novo_usuario.email,
        "nivel": novo_vinculo.nivel,
        "escola": escola
    }

@router.get("/minha-escola", response_model=List[UsuarioVinculoResponse])
async def listar_usuarios_da_minha_escola(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    escola_id = current_user["escola_id"]
    if not escola_id:
        raise HTTPException(status_code=400, detail="Super Admin não tem escola. Use /usuarios?escola_id=XXX")

    result = await db.execute(
        select(Usuario, UsuarioEscola, Escola).join(
            UsuarioEscola, Usuario.id == UsuarioEscola.usuario_id
        ).join(
            Escola, UsuarioEscola.escola_id == Escola.id
        ).where(UsuarioEscola.escola_id == escola_id)
    )
    rows = result.all()

    response = []
    for usuario, vinculo, escola in rows:
        response.append({
            "id": usuario.id,
            "nome": usuario.nome,
            "email": usuario.email,
            "nivel": vinculo.nivel,
            "escola": escola
        })
    return response
