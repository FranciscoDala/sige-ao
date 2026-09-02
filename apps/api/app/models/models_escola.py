from sqlalchemy import Column, String, Boolean, TIMESTAMP, ForeignKey, func, Enum as SAEnum, UniqueConstraint, Index, CheckConstraint, JSON, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship, Mapped, mapped_column
from typing import Optional
import uuid
import enum
import datetime

from app.db.database import Base

class NivelAcesso(str, enum.Enum):
    # 1. Gestão Ministério
    MINISTERIO = "MINISTERIO"
    # 2. Gestão da Escola
    DIRETOR = "DIRETOR"
    SUBDIRETOR_PEDAGOGICO = "SUBDIRETOR_PEDAGOGICO"
    SUBDIRETOR_ADMINISTRATIVO = "SUBDIRETOR_ADMINISTRATIVO"
    SECRETARIO = "SECRETARIO"
    # 3. Corpo Docente
    PROFESSOR = "PROFESSOR"
    COORDENADOR_CURSO = "COORDENADOR_CURSO"
    COORDENADOR_CLASSE = "COORDENADOR_CLASSE"
    # 4. Alunos e Encarregados
    ALUNO = "ALUNO"
    ENCARREGADO = "ENCARREGADO"
    # 5. Apoio
    FUNCIONARIO = "FUNCIONARIO"

class Escola(Base):
    __tablename__ = "escolas"

    id: Mapped[str] = mapped_column(String(20), primary_key=True, index=True)
    nome: Mapped[str] = mapped_column(String(255), nullable=False)
    sigla: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)
    id_curto: Mapped[str] = mapped_column(String(10), unique=True, nullable=False, index=True, comment='ESC001') # PARA EMAIL
    nif: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    endereco: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    provincia: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    municipio: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    telefone: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    logo_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)

    # BRANDING
    cor_primaria: Mapped[str] = mapped_column(String(7), default="#0056b3", nullable=False)
    cor_secundaria: Mapped[str] = mapped_column(String(7), default="#FFC107", nullable=False)
    cor_fundo: Mapped[str] = mapped_column(String(7), default="#FFFFFF", nullable=False)
    tema: Mapped[str] = mapped_column(String(20), default="claro", nullable=False)
    fonte_titulo: Mapped[str] = mapped_column(String(50), default="Poppins", nullable=False)
    fonte_corpo: Mapped[str] = mapped_column(String(50), default="Inter", nullable=False)
    estilo_card: Mapped[str] = mapped_column(String(20), default="arredondado", nullable=False)
    banner_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    favicon_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # CONFIG
    permitir_auto_cadastro: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    usar_modulo_propina: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    usar_modulo_biblioteca: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    config_json: Mapped[dict] = mapped_column(JSON, default=dict, nullable=False)

    ativo: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False, server_default='true')
    criado_em: Mapped[datetime.datetime] = mapped_column(TIMESTAMP(timezone=True), server_default=func.now())

    usuarios: Mapped[list["UsuarioEscola"]] = relationship("UsuarioEscola", back_populates="escola", cascade="all, delete-orphan")

class Usuario(Base):
    __tablename__ = "usuarios"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    nome: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    senha: Mapped[str] = mapped_column(String(255), nullable=False)
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
    nivel: Mapped[NivelAcesso] = mapped_column(
        SAEnum(NivelAcesso, name="nivelacesso", native_enum=False, create_constraint=False),
        nullable=False
    )

    aluno_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), nullable=True)
    professor_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), nullable=True)
    criado_em: Mapped[datetime.datetime] = mapped_column(TIMESTAMP(timezone=True), server_default=func.now())

    usuario: Mapped["Usuario"] = relationship("Usuario", back_populates="escolas")
    escola: Mapped[Optional["Escola"]] = relationship("Escola", back_populates="usuarios")

    __table_args__ = (
        UniqueConstraint('usuario_id', 'escola_id', name='uq_usuario_escola'),
        Index('ix_superadmin_unico', 'usuario_id', postgresql_where=escola_id.is_(None)),
        CheckConstraint(
            "(nivel = 'MINISTERIO' AND escola_id IS NULL) OR (nivel!= 'MINISTERIO' AND escola_id IS NOT NULL)",
            name='ck_nivel_escola_consistencia'
        ),
    )
