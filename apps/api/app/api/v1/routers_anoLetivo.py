from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, and_
from uuid import UUID
from typing import List
from datetime import date # 👈 ADICIONA

from app.db.database import get_db
from app.models.models_anoLetivo import AnoLetivo
from app.schemas.schemas_anoLetivo import AnoLetivoCreate, AnoLetivoResponse
from app.core.security import get_current_user

router = APIRouter(prefix="/anos-letivos", tags=["Anos Letivos"])

def get_escola_do_usuario(current_user: dict) -> UUID:
    if not current_user:
        raise HTTPException(status_code=401, detail="Token invalido ou expirado. Faca login novamente")
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

    # 👇 CORRIGIDO: Força converter pra date
    payload = dados.model_dump()
    if isinstance(payload['data_inicio'], str):
        payload['data_inicio'] = date.fromisoformat(payload['data_inicio'])
    if isinstance(payload['data_fim'], str):
        payload['data_fim'] = date.fromisoformat(payload['data_fim'])

    novo_ano = AnoLetivo(escola_id=escola_id, **payload)
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
    anos = result.scalars().all()

    # 👇 Se não tiver nenhum ano, cria 2026/2027 automaticamente ATIVO
    if not anos:
        ano_atual = "2026/2027"
        novo = AnoLetivo(
            escola_id=escola_id,
            nome=ano_atual,
            data_inicio=date(2026, 9, 1), # 👈 USA date() AQUI TAMBEM
            data_fim=date(2027, 7, 15),
            status="ATIVO"
        )
        db.add(novo)
        await db.commit()
        await db.refresh(novo)
        return [novo]

    return anos

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
