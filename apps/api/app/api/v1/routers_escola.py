from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, text
from typing import List, Optional
import logging
import uuid

from app.db.database import get_db
from app.models.models_escola import Escola
from app.schemas.schemas_escola import EscolaResponse
from app.core.security import get_current_user
from app.cloudinaryUploads import upload_to_cloudinary

import cloudinary.uploader

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/escolas", tags=["Escolas"])

def check_ministerio(current_user: dict):
    if current_user["nivel"]!= "MINISTERIO":
        raise HTTPException(status_code=403, detail="Apenas MINISTERIO pode fazer isso")

@router.get("", response_model=List[EscolaResponse])
@router.get("/", response_model=List[EscolaResponse])
async def listar_escolas(ativo: Optional[bool] = None, db: AsyncSession = Depends(get_db)):
    query = select(Escola).order_by(Escola.nome)
    if ativo is not None:
        query = query.where(Escola.ativo == ativo)
    result = await db.execute(query)
    return result.scalars().all()

@router.get("/{escola_id}", response_model=EscolaResponse)
async def obter_escola(escola_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Escola).where(Escola.id == escola_id))
    escola = result.scalar_one_or_none()
    if not escola: raise HTTPException(status_code=404, detail="Escola não encontrada")
    return escola

@router.post("", response_model=EscolaResponse, status_code=201)
@router.post("/", response_model=EscolaResponse, status_code=201)
async def criar_escola(
    id: str = Form(...),
    nome: str = Form(...),
    sigla: Optional[str] = Form(None),
    nif: Optional[str] = Form(None), # 👈 NOVO
    endereco: Optional[str] = Form(None), # 👈 NOVO
    telefone: Optional[str] = Form(None), # 👈 NOVO
    provincia: Optional[str] = Form(None),
    municipio: Optional[str] = Form(None),
    cor_primaria: str = Form("#3B82F6"),
    cor_secundaria: str = Form("#8B5CF6"),
    tema: str = Form("escuro"),
    logo: Optional[UploadFile] = File(None),
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    check_ministerio(current_user)
    result = await db.execute(select(Escola).where(Escola.id == id))
    if result.scalar_one_or_none(): raise HTTPException(status_code=400, detail="Já existe uma escola com este código")

    logo_url = None
    if logo:
        upload_data = await upload_to_cloudinary(logo, folder="logos")
        logo_url = upload_data["optimized_url"]

    id_curto = f"ESC{str(uuid.uuid4().int)[:3]}"

    nova_escola = Escola(
        id=id, nome=nome, sigla=sigla, nif=nif, endereco=endereco, telefone=telefone, # 👈 NOVO
        provincia=provincia, municipio=municipio,
        cor_primaria=cor_primaria, cor_secundaria=cor_secundaria, tema=tema,
        logo_url=logo_url, id_curto=id_curto
    )
    db.add(nova_escola)
    await db.commit()
    await db.refresh(nova_escola)
    return nova_escola

@router.put("/{escola_id}", response_model=EscolaResponse)
async def atualizar_escola(
    escola_id: str,
    nome: str = Form(...),
    sigla: Optional[str] = Form(None),
    nif: Optional[str] = Form(None), # 👈 NOVO
    endereco: Optional[str] = Form(None), # 👈 NOVO
    telefone: Optional[str] = Form(None), # 👈 NOVO
    provincia: Optional[str] = Form(None),
    municipio: Optional[str] = Form(None),
    cor_primaria: str = Form(...),
    cor_secundaria: str = Form(...),
    tema: str = Form(...),
    logo: Optional[UploadFile] = File(None),
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    check_ministerio(current_user)
    result = await db.execute(select(Escola).where(Escola.id == escola_id))
    escola = result.scalar_one_or_none()
    if not escola: raise HTTPException(status_code=404, detail="Escola não encontrada")

    if logo:
        upload_data = await upload_to_cloudinary(logo, folder="logos")
        escola.logo_url = upload_data["optimized_url"]

    escola.nome = nome
    escola.sigla = sigla
    escola.nif = nif # 👈 NOVO
    escola.endereco = endereco # 👈 NOVO
    escola.telefone = telefone # 👈 NOVO
    escola.provincia = provincia
    escola.municipio = municipio
    escola.cor_primaria = cor_primaria
    escola.cor_secundaria = cor_secundaria
    escola.tema = tema

    await db.commit()
    await db.refresh(escola)
    return escola

@router.delete("/{escola_id}", status_code=204)
async def deletar_escola(escola_id: str, db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    check_ministerio(current_user)
    result = await db.execute(select(Escola).where(Escola.id == escola_id))
    escola = result.scalar_one_or_none()
    if not escola: raise HTTPException(status_code=404, detail="Escola não encontrada")

    if escola.logo_url and "cloudinary.com" in escola.logo_url:
        try:
            public_id = escola.logo_url.split("/upload/")[-1].rsplit(".", 1)[0]
            cloudinary.uploader.destroy(public_id, resource_type="image")
            logger.info(f"Logo apagada do cloudinary: {public_id}")
        except Exception as e:
            logger.warning(f"Erro ao apagar logo do cloudinary: {e}")

    try:
        await db.execute(text("DELETE FROM usuario_escola WHERE escola_id = :id"), {"id": escola_id})
        await db.execute(text("DELETE FROM escolas WHERE id = :id"), {"id": escola_id})
        await db.commit()
        logger.info(f"Escola {escola_id} e dados vinculados apagados com sucesso")
    except Exception as e:
        await db.rollback()
        logger.error(f"Erro ao deletar escola: {e}")
        raise HTTPException(status_code=400, detail=f"Não foi possível apagar. Erro: {str(e)}")

    return None
