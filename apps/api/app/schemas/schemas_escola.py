from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional, Literal, Union
from datetime import datetime
from uuid import UUID
from app.models.models_escola import NivelAcesso, NivelEnsino

# ================== ESCOLA ==================
class EscolaBase(BaseModel):
    nome: str = Field(..., min_length=3, max_length=255)
    sigla: Optional[str] = Field(None, max_length=10)
    id_curto: str = Field(..., min_length=3, max_length=10, description="Código único da escola ex: ESC001") # 👈 OBRIGATÓRIO
    nif: Optional[str] = Field(None, max_length=50)
    nivel_ensino: NivelEnsino = Field(default=NivelEnsino.PRIMARIO)
    endereco: Optional[str] = Field(None, max_length=500)
    telefone: Optional[str] = Field(None, max_length=20)
    email: Optional[EmailStr] = None # 👈 ADD
    provincia: Optional[str] = Field(None, max_length=50)
    municipio: Optional[str] = Field(None, max_length=50)

    # BRANDING
    cor_primaria: str = "#3B82F6"
    cor_secundaria: str = "#8B5CF6"
    cor_fundo: str = "#FFFFFF"
    tema: str = "escuro"
    fonte_titulo: str = "Poppins"
    fonte_corpo: str = "Inter"
    estilo_card: str = "arredondado"
    logo_url: Optional[str] = None
    banner_url: Optional[str] = None
    favicon_url: Optional[str] = None

    # CONFIG
    permitir_auto_cadastro: bool = False
    usar_modulo_propina: bool = True
    usar_modulo_biblioteca: bool = False
    config_json: dict = {}
    ativo: bool = True

class EscolaCreate(EscolaBase):
    pass # 👈 TIREI O ID. Quem gera é o DB com uuid4

class EscolaUpdate(BaseModel): # 👈 Não herdar tudo pra não obrigar campos
    nome: Optional[str] = Field(None, min_length=3, max_length=255)
    sigla: Optional[str] = Field(None, max_length=10)
    id_curto: Optional[str] = Field(None, min_length=3, max_length=10)
    nif: Optional[str] = None
    nivel_ensino: Optional[NivelEnsino] = None
    endereco: Optional[str] = None
    telefone: Optional[str] = None
    email: Optional[EmailStr] = None
    provincia: Optional[str] = None
    municipio: Optional[str] = None
    cor_primaria: Optional[str] = None
    cor_secundaria: Optional[str] = None
    cor_fundo: Optional[str] = None
    tema: Optional[str] = None
    fonte_titulo: Optional[str] = None
    fonte_corpo: Optional[str] = None
    estilo_card: Optional[str] = None
    logo_url: Optional[str] = None
    banner_url: Optional[str] = None
    favicon_url: Optional[str] = None
    permitir_auto_cadastro: Optional[bool] = None
    usar_modulo_propina: Optional[bool] = None
    usar_modulo_biblioteca: Optional[bool] = None
    config_json: Optional[dict] = None
    ativo: Optional[bool] = None

class EscolaResponse(EscolaBase):
    id: UUID
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
    escola_id: Optional[Union[UUID, str]] = None
    aluno_id: Optional[UUID] = None
    professor_id: Optional[UUID] = None

class UsuarioUpdate(BaseModel):
    nome: Optional[str] = Field(None, min_length=3, max_length=255)
    email: Optional[EmailStr] = None
    senha: Optional[str] = Field(None, min_length=6)
    telefone: Optional[str] = None
    ativo: Optional[bool] = None
    nivel: Optional[NivelAcesso] = None
    escola_id: Optional[Union[UUID, str]] = None

class UsuarioVinculoResponse(BaseModel):
    id: UUID
    nome: str
    email: EmailStr
    telefone: Optional[str] = None
    ativo: bool
    criado_em: datetime
    nivel: NivelAcesso
    escola_id: Optional[Union[UUID, str]] = None
    perfil: Literal['super_admin', 'admin', 'diretor', 'suporte', 'aluno', 'encarregado']
    departamento: Optional[str] = None
    escola: Optional[EscolaResponse] = None
    model_config = ConfigDict(from_attributes=True)

# ================== AUTH / LOGIN ==================
class LoginRequest(BaseModel):
    escola_id: Optional[Union[UUID, str]] = Field(None)
    email: EmailStr
    senha: str

class UserInToken(BaseModel):
    id: UUID
    email: EmailStr
    nome: str
    nivel: str
    escola_id: Optional[Union[UUID, str]] = None

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    nivel: str
    user: UserInToken
    expires_in: int = 28800
