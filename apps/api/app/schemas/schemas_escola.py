from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional, List
from datetime import datetime
from uuid import UUID
from app.models.models_escola import NivelAcesso

# ================== ESCOLA ==================
class EscolaBase(BaseModel):
    id: str = Field(..., min_length=3, max_length=20)
    nome: str = Field(..., min_length=3, max_length=255)
    nif: Optional[str] = None
    endereco: Optional[str] = None
    telefone: Optional[str] = None
    email: Optional[EmailStr] = None
    logo_url: Optional[str] = None
    ativo: bool = True

class EscolaCreate(EscolaBase): pass

class EscolaResponse(EscolaBase):
    criado_em: datetime
    model_config = ConfigDict(from_attributes=True)

# ================== USUARIO ==================
class UsuarioBase(BaseModel):
    nome: str = Field(..., min_length=3, max_length=255)
    email: EmailStr
    telefone: Optional[str] = None
    foto_url: Optional[str] = None
    ativo: bool = True

class UsuarioCreate(UsuarioBase):
    senha: str = Field(..., min_length=6)

class UsuarioResponse(UsuarioBase):
    id: UUID
    criado_em: datetime
    model_config = ConfigDict(from_attributes=True)

# ================== CRIAR USUARIO COM VINCULO ==================
class UsuarioVinculoCreate(BaseModel):
    nome: str = Field(..., min_length=3, max_length=255)
    email: EmailStr
    senha: str = Field(..., min_length=6)
    telefone: Optional[str] = None
    nivel: NivelAcesso
    escola_id: str # Obrigatório pra criar na escola
    aluno_id: Optional[UUID] = None
    professor_id: Optional[UUID] = None

class UsuarioVinculoResponse(BaseModel):
    id: UUID
    nome: str
    email: EmailStr
    nivel: NivelAcesso
    escola: EscolaResponse
    model_config = ConfigDict(from_attributes=True)

# ================== AUTH / LOGIN ==================
class LoginRequest(BaseModel):
    escola_id: Optional[str] = Field(None, description="Código da escola. Deixar vazio para Super Admin")
    email: EmailStr
    senha: str

class UserInToken(BaseModel): # <-- ADD ESSE
    id: UUID
    email: EmailStr
    nome: str
    escola_id: Optional[str] = None

class TokenResponse(BaseModel): # <-- CORRIGIDO
    access_token: str
    token_type: str = "bearer"
    nivel: NivelAcesso
    user: UserInToken # <-- ERA ISSO QUE FALTAVA
    expires_in: int = 28800
