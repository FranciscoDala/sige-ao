from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, and_ # 👈 importei and_
from uuid import UUID
from typing import List

from app.db.database import get_db
from app.models.models_anoLetivo import AnoLetivo
from app.schemas.schemas_anoLetivo import AnoLetivoCreate, AnoLetivoResponse
from app.core.security import get_current_user

router = APIRouter(prefix="/anos-letivos", tags=["Anos Letivos"])

def get_escola_do_usuario(current_user: dict) -> UUID:
    escola_id = current_user.get("escola_id")
    if not escola_id:
        raise HTTPException(status_code=403, detail="Usuario nao vinculado a nenhuma escola")
    try:
        return UUID(str(escola_id))
    except Exception:
        raise HTTPException(status_code=422, detail="escola_id invalido no token")

@router.post("", response_model=AnoLetivoResponse, status_code=201)
@router.post("/", response_model=AnoLetivoResponse, status_code=201)
async def criar_ano_letivo(
    dados: AnoLetivoCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    escola_id = get_escola_do_usuario(current_user)

    result = await db.execute(select(AnoLetivo).where(and_(AnoLetivo.escola_id == escola_id, AnoLetivo.nome == dados.nome)))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail=f"Ano letivo {dados.nome} ja existe para esta escola")

    novo_ano = AnoLetivo(escola_id=escola_id, **dados.model_dump())
    db.add(novo_ano)
    await db.commit()
    await db.refresh(novo_ano)
    return novo_ano

@router.get("", response_model=List[AnoLetivoResponse])
@router.get("/", response_model=List[AnoLetivoResponse])
async def listar_anos_letivos(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    escola_id = get_escola_do_usuario(current_user)
    result = await db.execute(
        select(AnoLetivo)
      .where(AnoLetivo.escola_id == escola_id)
      .order_by(AnoLetivo.data_inicio.desc())
    )
    return result.scalars().all()

@router.put("/{ano_id}/ativar")
async def ativar_ano_letivo(
    ano_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    escola_id = get_escola_do_usuario(current_user)

    result = await db.execute(select(AnoLetivo).where(and_(AnoLetivo.id == ano_id, AnoLetivo.escola_id == escola_id)))
    ano_para_ativar = result.scalar_one_or_none()
    if not ano_para_ativar:
        raise HTTPException(status_code=404, detail="Ano letivo nao encontrado")

    # 👇 Pegar como string pra Pylance parar de chorar
    status_atual = str(ano_para_ativar.status)
    if status_atual == 'ATIVO':
        raise HTTPException(status_code=400, detail="Este ano ja esta ativo")

    # 2. Fechar o atual ATIVO
    await db.execute(
        update(AnoLetivo)
      .where(and_(AnoLetivo.escola_id == escola_id, AnoLetivo.status == 'ATIVO'))
      .values(status='FECHADO')
    )
    # 3. Ativar o novo
    await db.execute(
        update(AnoLetivo)
      .where(AnoLetivo.id == ano_id)
      .values(status='ATIVO')
    )
    await db.commit()
    return {"message": f"Ano letivo {ano_para_ativar.nome} ativado com sucesso"}
