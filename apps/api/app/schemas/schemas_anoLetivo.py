from pydantic import BaseModel, Field, field_validator
from datetime import date
from uuid import UUID
from typing import Literal

class AnoLetivoBase(BaseModel):
    nome: str = Field(..., pattern=r'^\d{4}/\d{4}$', description="Formato: 2026/2027")
    data_inicio: date
    data_fim: date

    @field_validator('data_fim')
    @classmethod
    def validate_dates(cls, data_fim, info):
        data_inicio = info.data.get('data_inicio')
        if data_inicio and data_fim <= data_inicio:
            raise ValueError('data_fim deve ser maior que data_inicio')
        if data_inicio and data_inicio.month!= 9:
            raise ValueError('data_inicio deve ser em Setembro')
        if data_fim and data_fim.month not in [6, 7]:
            raise ValueError('data_fim deve ser em Junho ou Julho')
        return data_fim

class AnoLetivoCreate(AnoLetivoBase):
    pass # escola_id vem do token

class AnoLetivoResponse(AnoLetivoBase): # 👈 Mudei pra Response igual EscolaResponse
    id: int
    escola_id: UUID
    status: Literal['PLANEJAMENTO', 'ATIVO', 'FECHADO']

    class Config:
        from_attributes = True
