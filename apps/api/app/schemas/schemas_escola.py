from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime

class EscolaBase(BaseModel):
    nome: str = Field(..., min_length=3, max_length=255)
    sigla: Optional[str] = Field(None, max_length=10)
    provincia: Optional[str] = Field(None, max_length=50)
    municipio: Optional[str] = Field(None, max_length=50)
    cor_primaria: str = "#3B82F6"
    cor_secundaria: str = "#8B5CF6"
    tema: str = "escuro"
    logo_url: Optional[str] = None
    ativo: bool = True

class EscolaCreate(EscolaBase):
    id: str = Field(..., min_length=3, max_length=20)

class EscolaUpdate(EscolaBase): # <- Para PUT
    pass

class EscolaResponse(EscolaBase):
    id: str
    criado_em: datetime
    model_config = ConfigDict(from_attributes=True)
