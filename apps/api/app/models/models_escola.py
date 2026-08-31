from sqlalchemy import Column, String, Boolean, TIMESTAMP, ForeignKey, func, Enum, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
import enum

from app.db.database import Base

class NivelAcesso(enum.Enum):
    MINISTERIO = "MINISTERIO"
    DIRECAO = "DIRECAO"
    PROFESSOR = "PROFESSOR"
    PAI = "PAI"
    ALUNO = "ALUNO"

class Escola(Base):
    __tablename__ = "escolas"

    id = Column(String(20), primary_key=True, index=True)
    nome = Column(String(255), nullable=False)
    nif = Column(String(50), nullable=True)
    endereco = Column(String(500), nullable=True)
    telefone = Column(String(20), nullable=True)
    email = Column(String(255), nullable=True)
    logo_url = Column(String(500), nullable=True)
    ativo = Column(Boolean, default=True)
    criado_em = Column(TIMESTAMP(timezone=True), server_default=func.now())

    usuarios = relationship("UsuarioEscola", back_populates="escola", cascade="all, delete-orphan")

class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    nome = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    senha_hash = Column(String(255), nullable=False)
    telefone = Column(String(20), nullable=True)
    foto_url = Column(String(500), nullable=True)
    ativo = Column(Boolean, default=True)
    criado_em = Column(TIMESTAMP(timezone=True), server_default=func.now())

    escolas = relationship("UsuarioEscola", back_populates="usuario", cascade="all, delete-orphan")

class UsuarioEscola(Base):
    __tablename__ = "usuario_escola"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    usuario_id = Column(UUID(as_uuid=True), ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False)
    escola_id = Column(String(20), ForeignKey("escolas.id", ondelete="CASCADE"), nullable=True) # <-- AGORA PODE SER NULL
    nivel = Column(Enum(NivelAcesso), nullable=False)

    aluno_id = Column(UUID(as_uuid=True), nullable=True)
    professor_id = Column(UUID(as_uuid=True), nullable=True)
    criado_em = Column(TIMESTAMP(timezone=True), server_default=func.now())

    usuario = relationship("Usuario", back_populates="escolas")
    escola = relationship("Escola", back_populates="usuarios")

    # Garante que 1 usuário só tem 1 vínculo por escola. E 1 SuperAdmin global
    __table_args__ = (
        UniqueConstraint('usuario_id', 'escola_id', name='uq_usuario_escola'),
    )
