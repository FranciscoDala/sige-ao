from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, text, or_
from typing import List, Optional
from uuid import UUID
import logging
import uuid

from fastapi.responses import JSONResponse

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

def check_diretor_ou_ministerio(current_user: dict):
    if current_user["nivel"] not in ["MINISTERIO", "DIRETOR", "DIRECAO"]:
        raise HTTPException(status_code=403, detail="Sem permissao")

def get_escola_do_usuario(current_user: dict) -> UUID:
    escola_id = current_user.get("escola_id")
    logger.info(f"[GET_ESCOLA] user={current_user.get('email')} escola_id={escola_id}")

    if not escola_id:
        raise HTTPException(status_code=403, detail="Usuario nao vinculado a nenhuma escola")
    try:
        return UUID(str(escola_id))
    except Exception:
        raise HTTPException(status_code=422, detail="escola_id invalido no token")

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

# 👇 ROTAS FIXAS TEM QUE VIR ANTES DAS ROTAS COM {id}
@router.get("/me")
async def obter_minha_escola(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    escola_id = get_escola_do_usuario(current_user)
    result = await db.execute(select(Escola).where(Escola.id == escola_id))
    escola = result.scalar_one_or_none()
    if not escola: raise HTTPException(status_code=404, detail="Escola nao encontrada")

    # 👇 CORRIGIDO: Converti UUID pra str
    data = {
        "id": str(escola.id), # 👈 AQUI
        "nome": escola.nome,
        "sigla": escola.sigla,
        "id_curto": escola.id_curto,
        "nif": escola.nif,
        "nivel_ensino": escola.nivel_ensino.value if escola.nivel_ensino else None,
        "endereco": escola.endereco,
        "telefone": escola.telefone,
        "email": escola.email,
        "provincia": escola.provincia,
        "municipio": escola.municipio,
        "cor_primaria": escola.cor_primaria,
        "cor_secundaria": escola.cor_secundaria,
        "cor_fundo": escola.cor_fundo,
        "tema": escola.tema,
        "fonte_titulo": escola.fonte_titulo,
        "fonte_corpo": escola.fonte_corpo,
        "estilo_card": escola.estilo_card,
        "logo_url": escola.logo_url,
        "banner_url": escola.banner_url,
        "favicon_url": escola.favicon_url,
        "permitir_auto_cadastro": escola.permitir_auto_cadastro,
        "usar_modulo_propina": escola.usar_modulo_propina,
        "usar_modulo_biblioteca": escola.usar_modulo_biblioteca,
        "config_json": escola.config_json,
        "ativo": escola.ativo,
        "criado_em": escola.criado_em.isoformat() if escola.criado_em else None
    }
    return JSONResponse(content=data)


@router.put("/me/definicoes")
async def atualizar_definicoes_escola(
    dados: EscolaUpdate,  # 👈 BODY TEM QUE VIR PRIMEIRO
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(check_diretor_ou_ministerio) # 👈 DEPENDS DEPOIS
):
    escola_id = get_escola_do_usuario(current_user)
    result = await db.execute(select(Escola).where(Escola.id == escola_id))
    escola = result.scalar_one_or_none()
    if not escola:
        raise HTTPException(status_code=404, detail="Escola nao encontrada")

    update_data = dados.model_dump(exclude_unset=True)

    # 👇 TRATAMENTO ESPECIAL PRA ENUM
    if 'nivel_ensino' in update_data and isinstance(update_data['nivel_ensino'], str):
        try:
            update_data['nivel_ensino'] = NivelEnsino(update_data['nivel_ensino'])
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Nivel de ensino invalido: {update_data['nivel_ensino']}")

    # 👇 CAMPOS BLOQUEADOS: NINGUEM DA ESCOLA PODE MUDAR
    CAMPOS_BLOQUEADOS = ['id', 'id_curto', 'nivel_ensino', 'ativo', 'criado_em']
    for campo in CAMPOS_BLOQUEADOS:
        update_data.pop(campo, None)

    # Atualiza só o que veio
    for key, value in update_data.items():
        setattr(escola, key, value)

    await db.commit()
    await db.refresh(escola)

    logger.info(f"Escola {escola.id} atualizada por {current_user.get('email')}")

    data = {
        "id": str(escola.id),
        "nome": escola.nome,
        "sigla": escola.sigla,
        "id_curto": escola.id_curto,
        "nif": escola.nif,
        "nivel_ensino": escola.nivel_ensino.value if escola.nivel_ensino else None,
        "endereco": escola.endereco,
        "telefone": escola.telefone,
        "email": escola.email,
        "provincia": escola.provincia,
        "municipio": escola.municipio,
        "cor_primaria": escola.cor_primaria,
        "cor_secundaria": escola.cor_secundaria,
        "cor_fundo": escola.cor_fundo,
        "tema": escola.tema,
        "fonte_titulo": escola.fonte_titulo,
        "fonte_corpo": escola.fonte_corpo,
        "estilo_card": escola.estilo_card,
        "logo_url": escola.logo_url,
        "banner_url": escola.banner_url,
        "favicon_url": escola.favicon_url,
        "permitir_auto_cadastro": escola.permitir_auto_cadastro,
        "usar_modulo_propina": escola.usar_modulo_propina,
        "usar_modulo_biblioteca": escola.usar_modulo_biblioteca,
        "config_json": escola.config_json,
        "ativo": escola.ativo,
        "criado_em": escola.criado_em.isoformat() if escola.criado_em else None
    }
    return JSONResponse(content=data)

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
            {"id": str(e.id), "nome": e.nome, "provincia": e.provincia, "logo_url": e.logo_url, "nivel_ensino": e.nivel_ensino.value}
            for e in escolas
        ],
        "usuarios": []
    }
# ☝️ FIM DAS ROTAS FIXAS

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
        logo_url=dados.logo_url,
        banner_url=dados.banner_url,
        favicon_url=dados.favicon_url
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
