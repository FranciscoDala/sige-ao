from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from typing import List
import uuid

from app.db.database import get_db
from app.models.models_escola import Usuario, UsuarioEscola, Escola, NivelAcesso
from app.schemas.schemas_escola import UsuarioVinculoCreate, UsuarioVinculoResponse
from app.core.security import get_current_user, get_password_hash

router = APIRouter(prefix="/usuarios", tags=["Usuários"])

def check_permissao_criar_usuario(current_user: dict, escola_id_target: str):
    """Só MINISTERIO pode criar em qualquer escola. DIRECAO só na própria escola"""
    nivel = current_user["nivel"]
    escola_id_user = current_user["escola_id"]

    if nivel == "MINISTERIO":
        return
    if nivel == "DIRECAO" and escola_id_user == escola_id_target:
        return

    raise HTTPException(status_code=403, detail="Sem permissão para criar usuário nesta escola")

@router.post("/", response_model=UsuarioVinculoResponse, status_code=201)
async def criar_usuario(
    dados: UsuarioVinculoCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    check_permissao_criar_usuario(current_user, dados.escola_id)

    # 1. Verifica se escola existe
    result = await db.execute(select(Escola).where(Escola.id == dados.escola_id))
    escola = result.scalar_one_or_none()
    if not escola:
        raise HTTPException(status_code=404, detail="Escola não encontrada")

    # 2. Verifica se email já existe
    result = await db.execute(select(Usuario).where(Usuario.email == dados.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email já cadastrado")

    # 3. Cria o Usuario
    novo_usuario = Usuario(
        id=uuid.uuid4(),
        nome=dados.nome,
        email=dados.email,
        senha_hash=get_password_hash(dados.senha),
        telefone=dados.telefone,
        ativo=True
    )
    db.add(novo_usuario)
    await db.flush() # pra pegar o id

    # 4. Cria o Vínculo com a escola
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
        "nivel": novo_vinculo.nivel,
        "escola": escola
    }

@router.get("/minha-escola", response_model=List[UsuarioVinculoResponse])
async def listar_usuarios_da_minha_escola(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Lista todos os usuários da escola do usuário logado"""
    escola_id = current_user["escola_id"]
    if not escola_id:
        raise HTTPException(status_code=400, detail="Super Admin não tem escola. Use /usuarios?escola_id=XXX")

    result = await db.execute(
        select(UsuarioEscola).join(Usuario).where(UsuarioEscola.escola_id == escola_id)
    )
    vinculos = result.scalars().all()
    return vinculos
