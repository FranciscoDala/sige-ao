from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
import logging # <-- ADD

from app.db.database import get_db
from app.models.models_escola import Escola
from app.schemas.schemas_escola import EscolaCreate, EscolaResponse
from app.core.security import get_current_user

logger = logging.getLogger(__name__) # <-- ADD

router = APIRouter(prefix="/escolas", tags=["Escolas"])

def check_ministerio(current_user: dict):
    if current_user["nivel"]!= "MINISTERIO":
        raise HTTPException(status_code=403, detail="Apenas MINISTERIO pode fazer isso")

@router.get("/", response_model=List[EscolaResponse])
async def listar_escolas(ativo: bool = True, db: AsyncSession = Depends(get_db)):
    logger.info(f"[ESCOLAS] ROTA CHAMADA. Filtro ativo={ativo}") # LOG 1
    query = select(Escola).where(Escola.ativo == ativo).order_by(Escola.nome)
    result = await db.execute(query)
    escolas = result.scalars().all()
    logger.info(f"[ESCOLAS] ENCONTRADAS: {len(escolas)} - {[e.nome for e in escolas]}") # LOG 2
    return escolas

@router.get("/{escola_id}", response_model=EscolaResponse)
async def obter_escola(escola_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Escola).where(Escola.id == escola_id))
    escola = result.scalar_one_or_none()
    if not escola: raise HTTPException(status_code=404, detail="Escola não encontrada")
    return escola

@router.post("/", response_model=EscolaResponse, status_code=201)
async def criar_escola(dados: EscolaCreate, db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    check_ministerio(current_user)
    result = await db.execute(select(Escola).where(Escola.id == dados.id))
    if result.scalar_one_or_none(): raise HTTPException(status_code=400, detail="Já existe uma escola com este código")
    nova_escola = Escola(**dados.model_dump())
    db.add(nova_escola)
    await db.commit()
    await db.refresh(nova_escola)
    return nova_escola

@router.put("/{escola_id}", response_model=EscolaResponse)
async def atualizar_escola(escola_id: str, dados: EscolaCreate, db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    check_ministerio(current_user)
    result = await db.execute(select(Escola).where(Escola.id == escola_id))
    escola = result.scalar_one_or_none()
    if not escola: raise HTTPException(status_code=404, detail="Escola não encontrada")
    for key, value in dados.model_dump(exclude_unset=True).items(): setattr(escola, key, value) # type: ignore
    await db.commit()
    await db.refresh(escola)
    return escola

@router.delete("/{escola_id}", status_code=204)
async def deletar_escola(escola_id: str, db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    check_ministerio(current_user)
    result = await db.execute(select(Escola).where(Escola.id == escola_id))
    escola = result.scalar_one_or_none()
    if not escola: raise HTTPException(status_code=404, detail="Escola não encontrada")
    escola.ativo = False # type: ignore
    await db.commit()
    return None
