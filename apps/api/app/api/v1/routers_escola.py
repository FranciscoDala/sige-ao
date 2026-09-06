from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Query # 👈 Voltei UploadFile e File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, text, or_
from typing import List, Optional
from uuid import UUID
import logging
import uuid

from pydantic import ValidationError

from app.db.database import get_db
from app.models.models_escola import Escola, NivelEnsino
from app.schemas.schemas_escola import EscolaResponse, EscolaCreate, EscolaUpdate
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
async def listar_escolas(
    ativo: Optional[bool] = None,
    nivel_ensino: Optional[NivelEnsino] = Query(None, description="Filtrar por nível de ensino"),
    search: Optional[str] = Query(None, description="Busca por nome, sigla, provincia"),
    db: AsyncSession = Depends(get_db)
):
    query = select(Escola).order_by(Escola.nome)
    if ativo is not None:
        query = query.where(Escola.ativo == ativo)
    if nivel_ensino:
        query = query.where(Escola.nivel_ensino == nivel_ensino)

    if search:
        search_term = f"%{search}%"
        query = query.where(
            or_(
                Escola.nome.ilike(search_term),
                Escola.sigla.ilike(search_term),
                Escola.provincia.ilike(search_term),
                Escola.municipio.ilike(search_term)
            )
        )

    result = await db.execute(query)
    return result.scalars().all()

@router.get("/search/global")
async def search_global(
    q: str = Query(..., min_length=2, description="Termo de pesquisa"),
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    search_term = f"%{q}%"
    query_escolas = select(Escola).where(
        or_(
            Escola.nome.ilike(search_term),
            Escola.sigla.ilike(search_term),
            Escola.provincia.ilike(search_term)
        )
    ).limit(5)
    result_escolas = await db.execute(query_escolas)
    escolas = result_escolas.scalars().all()

    return {
        "escolas": [
            {"id": e.id, "nome": e.nome, "provincia": e.provincia, "logo_url": e.logo_url, "nivel_ensino": e.nivel_ensino.value}
            for e in escolas
        ],
        "usuarios": []
    }

@router.get("/{escola_id}", response_model=EscolaResponse)
async def obter_escola(escola_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Escola).where(Escola.id == escola_id))
    escola = result.scalar_one_or_none()
    if not escola: raise HTTPException(status_code=404, detail="Escola não encontrada")
    return escola

@router.post("", response_model=EscolaResponse, status_code=201)
@router.post("/", response_model=EscolaResponse, status_code=201)
async def criar_escola(
    dados: EscolaCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    check_ministerio(current_user)

    result = await db.execute(select(Escola).where(Escola.id_curto == dados.id_curto))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Já existe uma escola com este id_curto")

    id_curto = dados.id_curto or f"ESC{str(uuid.uuid4().int)[:3]}"

    nova_escola = Escola(
        id=uuid.uuid4(),
        nome=dados.nome,
        sigla=dados.sigla,
        nif=dados.nif,
        nivel_ensino=dados.nivel_ensino,
        endereco=dados.endereco,
        telefone=dados.telefone,
        provincia=dados.provincia,
        municipio=dados.municipio,
        email=dados.email,
        cor_primaria=dados.cor_primaria,
        cor_secundaria=dados.cor_secundaria,
        cor_fundo=dados.cor_fundo,
        tema=dados.tema,
        fonte_titulo=dados.fonte_titulo,
        fonte_corpo=dados.fonte_corpo,
        estilo_card=dados.estilo_card,
        permitir_auto_cadastro=dados.permitir_auto_cadastro,
        usar_modulo_propina=dados.usar_modulo_propina,
        usar_modulo_biblioteca=dados.usar_modulo_biblioteca,
        config_json=dados.config_json,
        ativo=dados.ativo,
        id_curto=id_curto,
        logo_url=dados.logo_url # 👈 Agora vem por URL. Se for vazio, fica null
    )
    db.add(nova_escola)
    await db.commit()
    await db.refresh(nova_escola)
    return nova_escola

@router.put("/{escola_id}", response_model=EscolaResponse)
async def atualizar_escola(
    escola_id: UUID,
    dados: EscolaUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    check_ministerio(current_user)
    result = await db.execute(select(Escola).where(Escola.id == escola_id))
    escola = result.scalar_one_or_none()
    if not escola:
        raise HTTPException(status_code=404, detail="Escola não encontrada")

    update_data = dados.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(escola, key, value)

    await db.commit()
    await db.refresh(escola)
    return escola

# 👇 ROTAS NOVAS PRA UPLOAD
@router.post("/{escola_id}/logo", response_model=EscolaResponse)
async def upload_logo_escola(
    escola_id: UUID,
    logo: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    check_ministerio(current_user)
    result = await db.execute(select(Escola).where(Escola.id == escola_id))
    escola = result.scalar_one_or_none()
    if not escola:
        raise HTTPException(status_code=404, detail="Escola não encontrada")

    upload_data = await upload_to_cloudinary(logo, folder=f"escolas/{escola_id}/logos")
    escola.logo_url = upload_data["optimized_url"]

    await db.commit()
    await db.refresh(escola)
    return escola

@router.post("/me/logo", response_model=EscolaResponse)
async def upload_minha_logo(
    logo: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    escola_id = get_escola_do_usuario(current_user)
    result = await db.execute(select(Escola).where(Escola.id == escola_id))
    escola = result.scalar_one_or_none()
    if not escola:
        raise HTTPException(status_code=404, detail="Escola nao encontrada")

    upload_data = await upload_to_cloudinary(logo, folder=f"escolas/{escola_id}/logos")
    escola.logo_url = upload_data["optimized_url"]

    await db.commit()
    await db.refresh(escola)
    return escola

@router.delete("/{escola_id}", status_code=204)
async def deletar_escola(escola_id: UUID, db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
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

    await db.delete(escola)
    await db.commit()
    logger.info(f"Escola {escola_id} apagada com sucesso")
    return None

def get_escola_do_usuario(current_user: dict) -> UUID:
    escola_id = current_user.get("escola_id")
    logger.info(f"[GET_ESCOLA] user={current_user.get('email')} escola_id={escola_id}")

    if not escola_id:
        raise HTTPException(status_code=403, detail="Usuario nao vinculado a nenhuma escola")
    try:
        return UUID(str(escola_id))
    except Exception:
        raise HTTPException(status_code=422, detail="escola_id invalido no token")



@router.get("/me", response_model=EscolaResponse)
async def obter_minha_escola(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    escola_id = get_escola_do_usuario(current_user)
    result = await db.execute(select(Escola).where(Escola.id == escola_id))
    escola = result.scalar_one_or_none()
    if not escola: raise HTTPException(status_code=404, detail="Escola nao encontrada")

    logger.info(f"[ME RAW] {escola.__dict__}") # 👈 VAI MOSTRAR TUDO QUE VEIO DO DB

    try:
        return EscolaResponse.model_validate(escola) # 👈 VALIDA MANUAL
    except ValidationError as e:
        logger.error(f"[ME ERROR] {e}")
        raise HTTPException(status_code=500, detail=str(e))





@router.put("/me/definicoes", response_model=EscolaResponse)
async def atualizar_definicoes_escola(
    dados: EscolaUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    escola_id = get_escola_do_usuario(current_user)

    result = await db.execute(select(Escola).where(Escola.id == escola_id))
    escola = result.scalar_one_or_none()
    if not escola:
        raise HTTPException(status_code=404, detail="Escola nao encontrada")

    update_data = dados.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(escola, key, value)

    await db.commit()
    await db.refresh(escola)
    return escola
