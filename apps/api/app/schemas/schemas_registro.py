from datetime import date
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field, UUID4

from app.models.models_registro import (
    CargoFuncionarioEnum,
    EstadoCivilEnum,
    SexoEnum,
    TipoVinculoEnum,
)


class PessoaBase(BaseModel):
    nome: str
    bi: str
    data_nascimento: Optional[date] = None
    sexo: Optional[SexoEnum] = None
    estado_civil: Optional[EstadoCivilEnum] = None
    telefone: Optional[str] = None
    email: Optional[EmailStr] = None
    endereco: Optional[str] = None


class PessoaCreate(PessoaBase):
    escola_id: UUID4
    tipo: TipoVinculoEnum

    numero_funcional: Optional[str] = None
    cargo: Optional[CargoFuncionarioEnum] = None
    formacao: Optional[str] = None
    disciplinas: Optional[str] = None
    numero_processo: Optional[str] = None
    turma_id: Optional[UUID4] = None
    observacao: Optional[str] = None


class VinculoResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID4
    escola_id: UUID4
    tipo: TipoVinculoEnum
    numero_funcional: Optional[str] = None
    cargo: Optional[CargoFuncionarioEnum] = None
    formacao: Optional[str] = None
    disciplinas: Optional[str] = None
    numero_processo: Optional[str] = None
    turma_id: Optional[UUID4] = None
    observacao: Optional[str] = None
    ativo: bool


class PessoaResponse(PessoaBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID4
    ativo: bool
    vinculos: List[VinculoResponse] = Field(default_factory=list)
