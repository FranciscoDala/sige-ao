from sqlalchemy import Column, String, Boolean, TIMESTAMP, ForeignKey, func, Enum, UniqueConstraint, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship, Mapped, mapped_column
from typing import Optional
import uuid
import enum
import datetime

from app.db.database import Base

class NivelAcesso(str, enum.Enum):
    MINISTERIO = "MINISTERIO"
    DIRECAO = "DIRECAO"
    PROFESSOR = "PROFESSOR"
    ENCARREGADO = "ENCARREGADO"
    ALUNO = "ALUNO"

class Escola(Base):
    __tablename__ = "escolas"

    id: Mapped[str] = mapped_column(String(20), primary_key=True, index=True)
    nome: Mapped[str] = mapped_column(String(255), nullable=False)
    nif: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    endereco: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    telefone: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    logo_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    ativo: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False, server_default='true')
    criado_em: Mapped[datetime.datetime] = mapped_column(TIMESTAMP(timezone=True), server_default=func.now())

    usuarios: Mapped[list["UsuarioEscola"]] = relationship("UsuarioEscola", back_populates="escola", cascade="all, delete-orphan")

class Usuario(Base):
    __tablename__ = "usuarios" # Nome da tabela do DB

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    nome: Mapped[str] = mapped_column(String(255), nullable=False) # Bate com DB
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    senha: Mapped[str] = mapped_column(String(255), nullable=False) # CORRIGIDO: era senha_hash
    telefone: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    foto_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    ativo: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False, server_default='true')
    criado_em: Mapped[datetime.datetime] = mapped_column(TIMESTAMP(timezone=True), server_default=func.now())

    escolas: Mapped[list["UsuarioEscola"]] = relationship("UsuarioEscola", back_populates="usuario", cascade="all, delete-orphan")

class UsuarioEscola(Base):
    __tablename__ = "usuario_escola"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    usuario_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False)
    escola_id: Mapped[Optional[str]] = mapped_column(String(20), ForeignKey("escolas.id", ondelete="CASCADE"), nullable=True)
    nivel: Mapped[NivelAcesso] = mapped_column(Enum(NivelAcesso, name="nivelacesso", native_enum=False), nullable=False)

    aluno_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), nullable=True)
    professor_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), nullable=True)
    criado_em: Mapped[datetime.datetime] = mapped_column(TIMESTAMP(timezone=True), server_default=func.now())

    usuario: Mapped["Usuario"] = relationship("Usuario", back_populates="escolas")
    escola: Mapped[Optional["Escola"]] = relationship("Escola", back_populates="usuarios")

    __table_args__ = (
        UniqueConstraint('usuario_id', 'escola_id', name='uq_usuario_escola'),
        Index('ix_superadmin_unico', 'usuario_id', postgresql_where=escola_id.is_(None)),
    )
