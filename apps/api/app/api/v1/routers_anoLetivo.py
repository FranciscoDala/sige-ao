from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import and_, select, update
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from uuid import UUID
from datetime import date

from app.db.database import get_db
from app.models.models_anoLetivo import AnoLetivo
from app.schemas.schemas_anoLetivo import AnoLetivoCreate, AnoLetivoResponse
from app.core.security import get_current_user


router = APIRouter(prefix="/anos-letivos", tags=["Anos Letivos"])


def get_escola_do_usuario(current_user: dict) -> UUID:
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido ou expirado. Faça login novamente"
        )

    escola_id = current_user.get("escola_id")
    if not escola_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Usuário não vinculado a nenhuma escola"
        )

    try:
        return UUID(str(escola_id))
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="escola_id inválido no token"
        )


def normalizar_datas(payload: dict) -> dict:
    for campo in ["data_inicio", "data_fim"]:
        if isinstance(payload.get(campo), str):
            payload[campo] = date.fromisoformat(payload[campo])
    return payload


@router.post("", response_model=AnoLetivoResponse, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=AnoLetivoResponse, status_code=status.HTTP_201_CREATED)
async def criar_ano_letivo(
    dados: AnoLetivoCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    escola_id = get_escola_do_usuario(current_user)

    result = await db.execute(
        select(AnoLetivo).where(
            and_(
                AnoLetivo.escola_id == escola_id,
                AnoLetivo.nome == dados.nome
            )
        )
    )
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ano letivo {dados.nome} já existe para esta escola"
        )

    payload = normalizar_datas(dados.model_dump())

    novo_ano = AnoLetivo(
        escola_id=escola_id,
        **payload,
        status="PLANEJAMENTO"
    )

    db.add(novo_ano)
    await db.commit()
    await db.refresh(novo_ano)
    return novo_ano


@router.get("", response_model=List[AnoLetivoResponse])
@router.get("/", response_model=List[AnoLetivoResponse])
async def listar_anos_letivos(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    escola_id = get_escola_do_usuario(current_user)

    result = await db.execute(
        select(AnoLetivo)
        .where(AnoLetivo.escola_id == escola_id)
        .order_by(AnoLetivo.data_inicio.desc())
    )
    anos = result.scalars().all()

    if not anos:
        ano_default = "2026/2027"
        novo = AnoLetivo(
            escola_id=escola_id,
            nome=ano_default,
            data_inicio=date(2026, 9, 1),
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
    current_user: dict = Depends(get_current_user),
):
    escola_id = get_escola_do_usuario(current_user)

    result = await db.execute(
        select(AnoLetivo).where(
            and_(
                AnoLetivo.id == ano_id,
                AnoLetivo.escola_id == escola_id
            )
        )
    )
    ano_para_ativar = result.scalar_one_or_none()

    if not ano_para_ativar:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ano letivo não encontrado"
        )

    if ano_para_ativar.status == "ATIVO":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Este ano já está ativo"
        )

    await db.execute(
        update(AnoLetivo)
        .where(
            and_(
                AnoLetivo.escola_id == escola_id,
                AnoLetivo.status == "ATIVO"
            )
        )
        .values(status="FECHADO")
    )

    await db.execute(
        update(AnoLetivo)
        .where(AnoLetivo.id == ano_id)
        .values(status="ATIVO")
    )

    await db.commit()
    return {
        "message": f"Ano letivo {ano_para_ativar.nome} ativado com sucesso"
    }
