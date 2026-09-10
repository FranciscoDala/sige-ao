from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import or_, select, update
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.db.database import get_db
from app.models.models_registro import Pessoa, VinculoEscola
from app.schemas.schemas_registro import PessoaCreate, PessoaResponse


router = APIRouter(
    prefix="/pessoas",
    tags=["Pessoas"],
)


async def obter_pessoa(
    pessoa_id: UUID,
    db: AsyncSession,
) -> Pessoa:
    result = await db.execute(
        select(Pessoa)
        .where(Pessoa.id == pessoa_id)
        .options(selectinload(Pessoa.vinculos))
    )

    pessoa = result.scalar_one_or_none()

    if pessoa is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pessoa não encontrada.",
        )

    return pessoa


def validar_vinculo(pessoa_in: PessoaCreate) -> None:
    if pessoa_in.tipo.value == "ALUNO" and not pessoa_in.numero_processo:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="O número de processo é obrigatório para alunos.",
        )

    if pessoa_in.tipo.value == "PROFESSOR" and not pessoa_in.formacao:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="A formação é obrigatória para professores.",
        )

    if pessoa_in.tipo.value == "FUNCIONARIO" and not pessoa_in.cargo:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="O cargo é obrigatório para funcionários.",
        )


@router.post(
    "/",
    response_model=PessoaResponse,
    status_code=status.HTTP_201_CREATED,
)
async def criar_registro(
    pessoa_in: PessoaCreate,
    db: AsyncSession = Depends(get_db),
):
    validar_vinculo(pessoa_in)

    pessoa_result = await db.execute(
        select(Pessoa).where(Pessoa.bi == pessoa_in.bi)
    )
    pessoa_existente = pessoa_result.scalar_one_or_none()

    if pessoa_existente is None:
        pessoa = Pessoa(
            nome=pessoa_in.nome,
            bi=pessoa_in.bi,
            data_nascimento=pessoa_in.data_nascimento,
            sexo=pessoa_in.sexo,
            estado_civil=pessoa_in.estado_civil,
            telefone=pessoa_in.telefone,
            email=pessoa_in.email,
            endereco=pessoa_in.endereco,
        )

        db.add(pessoa)
        await db.flush()
        pessoa_id = pessoa.id
    else:
        pessoa_id = pessoa_existente.id

        vinculo_result = await db.execute(
            select(VinculoEscola).where(
                VinculoEscola.pessoa_id == pessoa_id,
                VinculoEscola.escola_id == pessoa_in.escola_id,
                VinculoEscola.tipo == pessoa_in.tipo,
            )
        )

        if vinculo_result.scalar_one_or_none() is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Esta pessoa já possui este vínculo nesta escola.",
            )

    vinculo = VinculoEscola(
        pessoa_id=pessoa_id,
        escola_id=pessoa_in.escola_id,
        tipo=pessoa_in.tipo,
        numero_funcional=pessoa_in.numero_funcional,
        cargo=pessoa_in.cargo,
        formacao=pessoa_in.formacao,
        disciplinas=pessoa_in.disciplinas,
        numero_processo=pessoa_in.numero_processo,
        turma_id=pessoa_in.turma_id,
        observacao=pessoa_in.observacao,
    )

    db.add(vinculo)

    try:
        await db.commit()
    except IntegrityError as exc:
        await db.rollback()

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Não foi possível criar o registro.",
        ) from exc

    result = await db.execute(
        select(Pessoa)
        .where(Pessoa.bi == pessoa_in.bi)
        .options(selectinload(Pessoa.vinculos))
    )

    pessoa_criada = result.scalar_one_or_none()

    if pessoa_criada is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registro criado, mas não foi possível carregá-lo.",
        )

    return pessoa_criada


    
@router.get(
    "/",
    response_model=list[PessoaResponse],
)
async def listar_registros(
    db: AsyncSession = Depends(get_db),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=500),
):
    result = await db.execute(
        select(Pessoa)
        .options(selectinload(Pessoa.vinculos))
        .order_by(Pessoa.nome.asc())
        .offset(skip)
        .limit(limit)
    )

    return result.scalars().unique().all()


@router.get(
    "/buscar",
    response_model=list[PessoaResponse],
)
async def buscar_registros(
    termo: str = Query(..., min_length=1),
    db: AsyncSession = Depends(get_db),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=500),
):
    termo_formatado = f"%{termo.strip()}%"

    result = await db.execute(
        select(Pessoa)
        .where(
            or_(
                Pessoa.nome.ilike(termo_formatado),
                Pessoa.bi.ilike(termo_formatado),
                Pessoa.email.ilike(termo_formatado),
                Pessoa.telefone.ilike(termo_formatado),
            )
        )
        .options(selectinload(Pessoa.vinculos))
        .order_by(Pessoa.nome.asc())
        .offset(skip)
        .limit(limit)
    )

    return result.scalars().unique().all()


@router.get(
    "/{pessoa_id}",
    response_model=PessoaResponse,
)
async def buscar_registro(
    pessoa_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    return await obter_pessoa(pessoa_id, db)


@router.put(
    "/{pessoa_id}",
    response_model=PessoaResponse,
)
async def editar_registro(
    pessoa_id: UUID,
    pessoa_in: PessoaCreate,
    db: AsyncSession = Depends(get_db),
):
    validar_vinculo(pessoa_in)

    pessoa_result = await db.execute(
        select(Pessoa.id).where(Pessoa.id == pessoa_id)
    )

    pessoa_id_db = pessoa_result.scalar_one_or_none()

    if pessoa_id_db is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pessoa não encontrada.",
        )

    vinculo_result = await db.execute(
        select(VinculoEscola).where(
            VinculoEscola.pessoa_id == pessoa_id,
            VinculoEscola.escola_id == pessoa_in.escola_id,
        )
    )

    vinculo = vinculo_result.scalar_one_or_none()

    if vinculo is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vínculo da pessoa com a escola não encontrado.",
        )

    try:
        await db.execute(
            update(Pessoa)
            .where(Pessoa.id == pessoa_id)
            .values(
                nome=pessoa_in.nome,
                bi=pessoa_in.bi,
                data_nascimento=pessoa_in.data_nascimento,
                sexo=pessoa_in.sexo,
                estado_civil=pessoa_in.estado_civil,
                telefone=pessoa_in.telefone,
                email=pessoa_in.email,
                endereco=pessoa_in.endereco,
            )
        )

        await db.execute(
            update(VinculoEscola)
            .where(VinculoEscola.id == vinculo.id)
            .values(
                tipo=pessoa_in.tipo,
                numero_funcional=pessoa_in.numero_funcional,
                cargo=pessoa_in.cargo,
                formacao=pessoa_in.formacao,
                disciplinas=pessoa_in.disciplinas,
                numero_processo=pessoa_in.numero_processo,
                turma_id=pessoa_in.turma_id,
                observacao=pessoa_in.observacao,
            )
        )

        await db.commit()

    except IntegrityError as exc:
        await db.rollback()

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Não foi possível atualizar o registro. "
            "Verifique se o BI já está associado a outra pessoa.",
        ) from exc

    pessoa_atualizada = await db.execute(
        select(Pessoa)
        .where(Pessoa.id == pessoa_id)
        .options(selectinload(Pessoa.vinculos))
    )

    return pessoa_atualizada.scalar_one()
@router.delete(
    "/{pessoa_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def eliminar_registro(
    pessoa_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    pessoa = await obter_pessoa(pessoa_id, db)

    await db.delete(pessoa)

    try:
        await db.commit()
    except IntegrityError as exc:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Não foi possível eliminar o registro.",
        ) from exc

    return None
