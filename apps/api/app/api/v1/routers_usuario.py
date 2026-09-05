from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, update
from typing import List, Optional
import uuid

from app.db.database import get_db
from app.models_escola import Usuario, UsuarioEscola, Escola, NivelAcesso
from app.schemas.schemas_escola import UsuarioVinculoCreate, UsuarioVinculoResponse, UsuarioUpdate
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

def check_permissao_editar(current_user: dict, usuario_alvo: UsuarioEscola):
    """Só MINISTERIO pode editar qualquer um. DIRECAO só da própria escola"""
    nivel = current_user["nivel"]
    escola_id_user = current_user["escola_id"]

    if nivel == "MINISTERIO":
        return
    if nivel == "DIRECAO" and usuario_alvo.escola_id == escola_id_user:
        return

    raise HTTPException(status_code=403, detail="Sem permissão para editar este usuário")

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

    stmt = select(Usuario, UsuarioEscola, Escola).join(
        UsuarioEscola, Usuario.id == UsuarioEscola.usuario_id
    ).join(
        Escola, UsuarioEscola.escola_id == Escola.id, isouter=True
    )

    filtros = []

    if tipo == "ministerio":
        filtros.append(UsuarioEscola.nivel == NivelAcesso.MINISTERIO)
        filtros.append(UsuarioEscola.escola_id.is_(None))
    else:
        escola_filtro = escola_id or current_user.get("escola_id")
        if not escola_filtro:
            raise HTTPException(status_code=400, detail="escola_id obrigatório")
        filtros.append(UsuarioEscola.escola_id == escola_filtro)

    if ativo is not None:
        filtros.append(Usuario.ativo == ativo)

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
            "telefone": usuario.telefone, # 👈 ADD
            "ativo": usuario.ativo, # 👈 ADD
            "criado_em": usuario.criado_em, # 👈 ADD
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
        escola_id=dados.escola_id,
        nivel=dados.nivel
    )
    db.add(novo_vinculo)
    await db.commit()
    await db.refresh(novo_usuario)

    return {
        "id": novo_usuario.id,
        "nome": novo_usuario.nome,
        "email": novo_usuario.email,
        "telefone": novo_usuario.telefone, # 👈 ADD
        "ativo": novo_usuario.ativo, # 👈 ADD
        "criado_em": novo_usuario.criado_em, # 👈 ADD
        "nivel": novo_vinculo.nivel,
        "escola": escola
    }

@router.put("/{usuario_id}", response_model=UsuarioVinculoResponse) # 👈 NOVO ENDPOINT
async def atualizar_usuario(
    usuario_id: uuid.UUID,
    dados: UsuarioUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    # 1. Buscar usuario + vinculo
    result = await db.execute(
        select(Usuario, UsuarioEscola, Escola).join(
            UsuarioEscola, Usuario.id == UsuarioEscola.usuario_id
        ).join(
            Escola, UsuarioEscola.escola_id == Escola.id, isouter=True
        ).where(Usuario.id == usuario_id)
    )
    row = result.first()
    if not row:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")

    usuario, vinculo, escola = row
    check_permissao_editar(current_user, vinculo)

    # 2. Atualizar campos
    if dados.nome is not None:
        usuario.nome = dados.nome
    if dados.email is not None:
        # Checar se email novo já existe
        if dados.email!= usuario.email:
            result_email = await db.execute(select(Usuario).where(Usuario.email == dados.email))
            if result_email.scalar_one_or_none():
                raise HTTPException(status_code=400, detail="Email já cadastrado")
        usuario.email = dados.email
    if dados.telefone is not None:
        usuario.telefone = dados.telefone
    if dados.senha is not None and dados.senha!= "":
        usuario.senha = get_password_hash(dados.senha)

    await db.commit()
    await db.refresh(usuario)

    return {
        "id": usuario.id,
        "nome": usuario.nome,
        "email": usuario.email,
        "telefone": usuario.telefone,
        "ativo": usuario.ativo,
        "criado_em": usuario.criado_em,
        "nivel": vinculo.nivel,
        "escola": escola
    }

@router.delete("/{usuario_id}", status_code=204) # 👈 Soft delete
async def desativar_usuario(
    usuario_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    result = await db.execute(
        select(Usuario, UsuarioEscola).join(
            UsuarioEscola, Usuario.id == UsuarioEscola.usuario_id
        ).where(Usuario.id == usuario_id)
    )
    row = result.first()
    if not row:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")

    usuario, vinculo = row
    check_permissao_editar(current_user, vinculo)

    usuario.ativo = False
    await db.commit()
    return

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
            "telefone": usuario.telefone, # 👈 ADD
            "ativo": usuario.ativo, # 👈 ADD
            "criado_em": usuario.criado_em, # 👈 ADD
            "nivel": vinculo.nivel,
            "escola": escola
        })
    return response
