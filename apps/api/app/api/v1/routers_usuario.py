from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, update
from typing import List, Optional
import uuid

from app.db.database import get_db
from app.models.models_escola import Usuario, UsuarioEscola, Escola, NivelAcesso
from app.schemas.schemas_escola import UsuarioVinculoCreate, UsuarioVinculoResponse, UsuarioUpdate
from app.core.security import get_current_user, get_password_hash

router = APIRouter(prefix="/usuarios", tags=["Usuários"])

def _eh_diretor(nivel: NivelAcesso) -> bool:
    """Checa se é diretor"""
    return nivel == NivelAcesso.DIRETOR

def check_permissao_criar_usuario(current_user: dict, escola_id_target: Optional[str]):
    """Só MINISTERIO pode criar em qualquer escola. DIRETOR só na própria escola"""
    nivel = current_user["nivel"]
    escola_id_user = current_user["escola_id"]

    if nivel == "MINISTERIO":
        return
    if nivel == "DIRETOR" and escola_id_user == escola_id_target:
        return
    raise HTTPException(status_code=403, detail="Sem permissão para criar usuário nesta escola")

def check_permissao_listar(current_user: dict):
    """Só MINISTERIO pode listar todos. Outros só veem da própria escola"""
    if current_user["nivel"]!= "MINISTERIO":
        raise HTTPException(status_code=403, detail="Sem permissão para listar todos os usuários")

def check_permissao_editar(current_user: dict, usuario_alvo: UsuarioEscola):
    """Só MINISTERIO pode editar qualquer um. DIRETOR só da própria escola"""
    nivel = current_user["nivel"]
    escola_id_user = current_user["escola_id"]

    if nivel == "MINISTERIO":
        return
    if nivel == "DIRETOR" and usuario_alvo.escola_id == escola_id_user:
        return
    raise HTTPException(status_code=403, detail="Sem permissão para editar este usuário")

def mapear_para_frontend(usuario: Usuario, vinculo: UsuarioEscola, escola: Optional[Escola]):
    """Mapeia pra bater com UsuarioMinisterio do frontend"""
    mapa_perfil = {
        NivelAcesso.MINISTERIO: "super_admin",
        NivelAcesso.DIRETOR: "diretor",
        NivelAcesso.SECRETARIO: "admin",
        NivelAcesso.PROFESSOR: "suporte",
        NivelAcesso.SUBDIRETOR_PEDAGOGICO: "admin",
        NivelAcesso.SUBDIRETOR_ADMINISTRATIVO: "admin",
        NivelAcesso.FUNCIONARIO: "suporte"
    }

    return {
        "id": str(usuario.id),
        "nome": usuario.nome,
        "email": usuario.email,
        "telefone": usuario.telefone,
        "ativo": usuario.ativo,
        "criado_em": usuario.criado_em,
        "nivel": vinculo.nivel.value, # 👈 DIRETO
        "escola_id": str(vinculo.escola_id) if vinculo.escola_id else None,
        "perfil": mapa_perfil.get(vinculo.nivel, "suporte"),
        "departamento": escola.nome if escola else "Ministério",
        "escola": escola
    }

@router.get("/", response_model=List[UsuarioVinculoResponse])
async def listar_usuarios(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
    tipo: Optional[str] = Query(None, description="ministerio | escola"),
    ativo: Optional[bool] = Query(None),
    perfil: Optional[str] = Query(None, description="admin | super_admin | suporte | diretor"),
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
    else:
        escola_filtro = escola_id or current_user.get("escola_id")
        if escola_filtro:
            filtros.append(UsuarioEscola.escola_id == escola_filtro)

    if ativo is not None:
        filtros.append(Usuario.ativo == ativo)

    if perfil:
        mapa_perfil = {
            "super_admin": [NivelAcesso.MINISTERIO],
            "admin": [NivelAcesso.SECRETARIO, NivelAcesso.SUBDIRETOR_PEDAGOGICO, NivelAcesso.SUBDIRETOR_ADMINISTRATIVO],
            "suporte": [NivelAcesso.PROFESSOR, NivelAcesso.FUNCIONARIO],
            "diretor": [NivelAcesso.DIRETOR] # 👈 SÓ DIRETOR
        }
        if perfil in mapa_perfil:
            filtros.append(UsuarioEscola.nivel.in_(mapa_perfil[perfil]))

    if filtros:
        stmt = stmt.where(and_(*filtros))

    result = await db.execute(stmt)
    rows = result.all()

    response = []
    for usuario, vinculo, escola in rows:
        response.append(mapear_para_frontend(usuario, vinculo, escola))
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
        if not dados.escola_id:
            raise HTTPException(status_code=400, detail="escola_id é obrigatório para DIRETOR")
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
        nivel=dados.nivel # 👈 DIRETO
    )
    db.add(novo_vinculo)
    await db.commit()
    await db.refresh(novo_usuario)
    await db.refresh(novo_vinculo)

    return mapear_para_frontend(novo_usuario, novo_vinculo, escola)

@router.put("/{usuario_id}", response_model=UsuarioVinculoResponse)
async def atualizar_usuario(
    usuario_id: uuid.UUID,
    dados: UsuarioUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
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

    if dados.nome is not None:
        usuario.nome = dados.nome
    if dados.email is not None:
        if dados.email!= usuario.email:
            result_email = await db.execute(select(Usuario).where(Usuario.email == dados.email))
            if result_email.scalar_one_or_none():
                raise HTTPException(status_code=400, detail="Email já cadastrado")
        usuario.email = dados.email
    if dados.telefone is not None:
        usuario.telefone = dados.telefone
    if dados.senha is not None and dados.senha!= "":
        usuario.senha = get_password_hash(dados.senha)
    if dados.ativo is not None:
        usuario.ativo = dados.ativo

    if dados.nivel is not None:
        vinculo.nivel = dados.nivel # 👈 DIRETO
        if dados.nivel == NivelAcesso.MINISTERIO:
            vinculo.escola_id = None
    if dados.escola_id is not None and dados.nivel!= NivelAcesso.MINISTERIO:
        vinculo.escola_id = dados.escola_id
        result_escola = await db.execute(select(Escola).where(Escola.id == dados.escola_id))
        escola = result_escola.scalar_one_or_none()

    await db.commit()
    await db.refresh(usuario)
    await db.refresh(vinculo)

    return mapear_para_frontend(usuario, vinculo, escola)

@router.delete("/{usuario_id}", status_code=204)
async def deletar_usuario(
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

    current_user_id = current_user.get("id") or current_user.get("user_id") or current_user.get("sub")

    if str(usuario.id) == str(current_user_id):
        raise HTTPException(status_code=400, detail="Você não pode apagar a si mesmo")

    await db.delete(vinculo)
    await db.delete(usuario)
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
        response.append(mapear_para_frontend(usuario, vinculo, escola))
    return response
