from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import and_, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional, Union
from uuid import UUID, uuid4

from app.db.database import get_db
from app.models.models_escola import Escola, NivelAcesso, Usuario, UsuarioEscola
from app.schemas.schemas_escola import UsuarioUpdate, UsuarioVinculoCreate, UsuarioVinculoResponse
from app.core.security import get_current_user, get_password_hash


router = APIRouter(prefix="/usuarios", tags=["Usuários"])


def _to_uuid(val: Optional[Union[UUID, str]]) -> Optional[UUID]:
    if val is None:
        return None
    if isinstance(val, UUID):
        return val
    try:
        return UUID(str(val))
    except ValueError:
        raise HTTPException(status_code=400, detail=f"ID inválido: {val}")


def check_permissao_criar_usuario(current_user: dict, escola_id_target: Optional[Union[UUID, str]]):
    nivel = current_user.get("nivel")
    escola_id_user = _to_uuid(current_user.get("escola_id"))
    escola_id_target = _to_uuid(escola_id_target)

    if nivel == "MINISTERIO":
        return

    if nivel in ["DIRETOR", "DIRECAO"] and escola_id_user == escola_id_target:
        return

    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Sem permissão para criar usuário nesta escola"
    )


def check_permissao_listar(current_user: dict):
    if current_user.get("nivel") != "MINISTERIO":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Sem permissão para listar todos os usuários"
        )


def check_permissao_editar(current_user: dict, usuario_alvo: UsuarioEscola):
    nivel = current_user.get("nivel")
    escola_id_user = _to_uuid(current_user.get("escola_id"))
    escola_id_alvo = usuario_alvo.escola_id

    if nivel == "MINISTERIO":
        return

    if nivel in ["DIRETOR", "DIRECAO"] and escola_id_alvo == escola_id_user:
        return

    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Sem permissão para editar este usuário"
    )


def mapear_para_frontend(usuario: Usuario, vinculo: UsuarioEscola, escola: Optional[Escola]):
    mapa_perfil = {
        NivelAcesso.MINISTERIO: "super_admin",
        NivelAcesso.DIRECAO: "diretor",
        NivelAcesso.DIRETOR: "diretor",
        NivelAcesso.SECRETARIO: "admin",
        NivelAcesso.PROFESSOR: "suporte",
        NivelAcesso.SUBDIRETOR_PEDAGOGICO: "admin",
        NivelAcesso.SUBDIRETOR_ADMINISTRATIVO: "admin",
        NivelAcesso.FUNCIONARIO: "suporte",
        NivelAcesso.COORDENADOR_CURSO: "admin",
        NivelAcesso.COORDENADOR_CLASSE: "admin",
        NivelAcesso.ALUNO: "aluno",
        NivelAcesso.ENCARREGADO: "encarregado",
    }

    nivel_value = vinculo.nivel.value if isinstance(vinculo.nivel, NivelAcesso) else str(vinculo.nivel)

    return {
        "id": str(usuario.id),
        "nome": usuario.nome,
        "email": usuario.email,
        "telefone": usuario.telefone,
        "ativo": usuario.ativo,
        "criado_em": usuario.criado_em,
        "nivel": nivel_value,
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

    stmt = (
        select(Usuario, UsuarioEscola, Escola)
        .join(UsuarioEscola, Usuario.id == UsuarioEscola.usuario_id)
        .join(Escola, UsuarioEscola.escola_id == Escola.id, isouter=True)
    )

    filtros = []

    if tipo == "ministerio":
        filtros.append(UsuarioEscola.nivel == NivelAcesso.MINISTERIO)
    else:
        escola_filtro = _to_uuid(escola_id or current_user.get("escola_id"))
        if escola_filtro:
            filtros.append(UsuarioEscola.escola_id == escola_filtro)

    if ativo is not None:
        filtros.append(Usuario.ativo == ativo)

    if perfil:
        mapa_perfil = {
            "super_admin": [NivelAcesso.MINISTERIO],
            "admin": [
                NivelAcesso.SECRETARIO,
                NivelAcesso.SUBDIRETOR_PEDAGOGICO,
                NivelAcesso.SUBDIRETOR_ADMINISTRATIVO,
                NivelAcesso.COORDENADOR_CURSO,
                NivelAcesso.COORDENADOR_CLASSE,
            ],
            "suporte": [NivelAcesso.PROFESSOR, NivelAcesso.FUNCIONARIO],
            "diretor": [NivelAcesso.DIRETOR, NivelAcesso.DIRECAO],
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


@router.post("/", response_model=UsuarioVinculoResponse, status_code=status.HTTP_201_CREATED)
async def criar_usuario(
    dados: UsuarioVinculoCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    escola = None

    if dados.escola_id is not None:
        dados.escola_id = _to_uuid(dados.escola_id)

    if dados.nivel == NivelAcesso.MINISTERIO:
        dados.escola_id = None
    else:
        check_permissao_criar_usuario(current_user, dados.escola_id)
        if not dados.escola_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="escola_id é obrigatório para este nível"
            )

        escola_result = await db.execute(select(Escola).where(Escola.id == dados.escola_id))
        escola = escola_result.scalar_one_or_none()
        if not escola:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Escola não encontrada"
            )

    usuario_existente = await db.execute(select(Usuario).where(Usuario.email == dados.email))
    if usuario_existente.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email já cadastrado"
        )

    novo_usuario = Usuario(
        id=uuid4(),
        nome=dados.nome,
        email=dados.email,
        senha=get_password_hash(dados.senha),
        telefone=dados.telefone,
        ativo=True,
    )
    db.add(novo_usuario)
    await db.flush()

    novo_vinculo = UsuarioEscola(
        id=uuid4(),
        usuario_id=novo_usuario.id,
        escola_id=dados.escola_id,
        nivel=dados.nivel,
    )
    db.add(novo_vinculo)
    await db.commit()
    await db.refresh(novo_usuario)
    await db.refresh(novo_vinculo)

    return mapear_para_frontend(novo_usuario, novo_vinculo, escola)


@router.put("/{usuario_id}", response_model=UsuarioVinculoResponse)
async def atualizar_usuario(
    usuario_id: UUID,
    dados: UsuarioUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    stmt = (
        select(Usuario, UsuarioEscola, Escola)
        .join(UsuarioEscola, Usuario.id == UsuarioEscola.usuario_id)
        .join(Escola, UsuarioEscola.escola_id == Escola.id, isouter=True)
        .where(Usuario.id == usuario_id)
    )

    result = await db.execute(stmt)
    row = result.first()

    if not row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado"
        )

    usuario, vinculo, escola = row
    check_permissao_editar(current_user, vinculo)

    if dados.nome is not None:
        usuario.nome = dados.nome

    if dados.email is not None:
        if dados.email != usuario.email:
            email_result = await db.execute(select(Usuario).where(Usuario.email == dados.email))
            if email_result.scalar_one_or_none():
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email já cadastrado"
                )
        usuario.email = dados.email

    if dados.telefone is not None:
        usuario.telefone = dados.telefone

    if dados.senha is not None and dados.senha != "":
        usuario.senha = get_password_hash(dados.senha)

    if dados.ativo is not None:
        usuario.ativo = dados.ativo

    novo_nivel = dados.nivel if dados.nivel is not None else vinculo.nivel

    if dados.escola_id is not None:
        dados.escola_id = _to_uuid(dados.escola_id)

    if novo_nivel == NivelAcesso.MINISTERIO:
        vinculo.nivel = novo_nivel
        vinculo.escola_id = None
        escola = None
    else:
        if dados.escola_id is not None:
            escola_result = await db.execute(select(Escola).where(Escola.id == dados.escola_id))
            escola = escola_result.scalar_one_or_none()
            if not escola:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Escola não encontrada"
                )
            vinculo.escola_id = dados.escola_id
        elif vinculo.escola_id is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="escola_id é obrigatório para este nível"
            )

        if dados.nivel is not None:
            vinculo.nivel = dados.nivel

    await db.commit()
    await db.refresh(usuario)
    await db.refresh(vinculo)

    return mapear_para_frontend(usuario, vinculo, escola)


@router.delete("/{usuario_id}", status_code=status.HTTP_204_NO_CONTENT)
async def deletar_usuario(
    usuario_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    result = await db.execute(
        select(Usuario, UsuarioEscola)
        .join(UsuarioEscola, Usuario.id == UsuarioEscola.usuario_id)
        .where(Usuario.id == usuario_id)
    )

    row = result.first()
    if not row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado"
        )

    usuario, vinculo = row
    check_permissao_editar(current_user, vinculo)

    current_user_id = current_user.get("user_id")
    if str(usuario.id) == str(current_user_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Você não pode apagar a si mesmo"
        )

    await db.delete(vinculo)
    await db.delete(usuario)
    await db.commit()
    return None


@router.get("/minha-escola", response_model=List[UsuarioVinculoResponse])
async def listar_usuarios_da_minha_escola(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    escola_id = _to_uuid(current_user.get("escola_id"))
    if not escola_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Super Admin não tem escola. Use /usuarios?escola_id=XXX"
        )

    result = await db.execute(
        select(Usuario, UsuarioEscola, Escola)
        .join(UsuarioEscola, Usuario.id == UsuarioEscola.usuario_id)
        .join(Escola, UsuarioEscola.escola_id == Escola.id)
        .where(UsuarioEscola.escola_id == escola_id)
    )

    rows = result.all()
    response = []
    for usuario, vinculo, escola in rows:
        response.append(mapear_para_frontend(usuario, vinculo, escola))
    return response
