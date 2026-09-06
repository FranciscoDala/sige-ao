from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional, Literal
from datetime import datetime
from uuid import UUID
from app.models.models_escola import NivelAcesso, NivelEnsino

# ================== ESCOLA ==================
class EscolaBase(BaseModel):
    nome: str = Field(..., min_length=3, max_length=255)
    sigla: Optional[str] = Field(None, max_length=10)
    nif: Optional[str] = Field(None, max_length=50)
    nivel_ensino: NivelEnsino = Field(default=NivelEnsino.PRIMARIO)
    endereco: Optional[str] = Field(None, max_length=500)
    telefone: Optional[str] = Field(None, max_length=20)
    provincia: Optional[str] = Field(None, max_length=50)
    municipio: Optional[str] = Field(None, max_length=50)
    cor_primaria: str = "#3B82F6"
    cor_secundaria: str = "#8B5CF6"
    tema: str = "escuro"
    logo_url: Optional[str] = None
    ativo: bool = True

class EscolaCreate(EscolaBase):
    id: str = Field(..., min_length=3, max_length=20)

class EscolaUpdate(EscolaBase):
    pass

class EscolaResponse(EscolaBase):
    id: str
    id_curto: str
    criado_em: datetime
    email: Optional[str] = None # 👈 ADD
    cor_fundo: str = "#FFFFFF"
    fonte_titulo: str = "Poppins"
    fonte_corpo: str = "Inter"
    estilo_card: str = "arredondado"
    banner_url: Optional[str] = None
    favicon_url: Optional[str] = None
    permitir_auto_cadastro: bool = False
    usar_modulo_propina: bool = True
    usar_modulo_biblioteca: bool = False
    config_json: dict = {}
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
    nivel: NivelAcesso # 👈 Aqui pode ficar Enum pq é entrada
    escola_id: Optional[str] = None
    aluno_id: Optional[UUID] = None
    professor_id: Optional[UUID] = None

class UsuarioUpdate(BaseModel):
    nome: Optional[str] = Field(None, min_length=3, max_length=255)
    email: Optional[EmailStr] = None
    senha: Optional[str] = Field(None, min_length=6)
    telefone: Optional[str] = None
    ativo: Optional[bool] = None
    nivel: Optional[NivelAcesso] = None # 👈 Aqui pode ficar Enum pq é entrada
    escola_id: Optional[str] = None

class UsuarioVinculoResponse(BaseModel):
    id: UUID
    nome: str
    email: EmailStr
    telefone: Optional[str] = None
    ativo: bool
    criado_em: datetime

    nivel: NivelAcesso # 👈 Aqui pode ficar Enum pq vem do DB
    escola_id: Optional[str] = None
    perfil: Literal['super_admin', 'admin', 'diretor', 'suporte']
    departamento: Optional[str] = None

    escola: Optional[EscolaResponse] = None
    model_config = ConfigDict(from_attributes=True)

# ================== AUTH / LOGIN ==================
class LoginRequest(BaseModel):
    escola_id: Optional[str] = Field(None, description="Código da escola. Deixar vazio para Super Admin")
    email: EmailStr
    senha: str

class UserInToken(BaseModel):
    id: UUID
    email: EmailStr
    nome: str
    nivel: str # 👈 CORRIGIDO: de NivelAcesso para str
    escola_id: Optional[str] = None

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    nivel: str # 👈 CORRIGIDO: de NivelAcesso para str
    user: UserInToken
    expires_in: int = 28800
