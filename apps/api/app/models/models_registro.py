import enum
import uuid

import sqlalchemy as sa
from sqlalchemy import (
    Boolean,
    Column,
    Date,
    DateTime,
    Enum,
    ForeignKey,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.database import Base


class TipoVinculoEnum(str, enum.Enum):
    ALUNO = "ALUNO"
    PROFESSOR = "PROFESSOR"
    FUNCIONARIO = "FUNCIONARIO"
    ENCARREGADO = "ENCARREGADO"


class CargoFuncionarioEnum(str, enum.Enum):
    SECRETARIO = "SECRETARIO"
    DIRETOR_GERAL = "DIRETOR_GERAL"
    PEDAGOGICO = "PEDAGOGICO"
    LIMPEZA = "LIMPEZA"
    SEGURANCA = "SEGURANCA"
    OUTRO = "OUTRO"


class SexoEnum(str, enum.Enum):
    MASCULINO = "MASCULINO"
    FEMININO = "FEMININO"


class EstadoCivilEnum(str, enum.Enum):
    SOLTEIRO = "SOLTEIRO"
    CASADO = "CASADO"
    DIVORCIADO = "DIVORCIADO"
    VIUVO = "VIUVO"


class Pessoa(Base):
    __tablename__ = "pessoas"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    nome = Column(
        String(255),
        nullable=False,
        index=True,
    )

    bi = Column(
        String(20),
        nullable=False,
        unique=True,
        index=True,
    )

    data_nascimento = Column(
        Date,
        nullable=True,
    )

    sexo = Column(
        Enum(
            SexoEnum,
            name="sexoeenum",
            create_type=False,
        ),
        nullable=True,
    )

    estado_civil = Column(
        Enum(
            EstadoCivilEnum,
            name="estadocivilenum",
            create_type=False,
        ),
        nullable=True,
    )

    telefone = Column(
        String(20),
        nullable=True,
    )

    email = Column(
        String(255),
        nullable=True,
    )

    endereco = Column(
        String(500),
        nullable=True,
    )

    ativo = Column(
        Boolean,
        nullable=False,
        default=True,
        server_default=sa.true(),
    )

    criado_em = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=sa.text("now()"),
    )

    vinculos = relationship(
        "VinculoEscola",
        back_populates="pessoa",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )


class VinculoEscola(Base):
    __tablename__ = "vinculos_escola"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    pessoa_id = Column(
        UUID(as_uuid=True),
        ForeignKey("pessoas.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    escola_id = Column(
        UUID(as_uuid=True),
        ForeignKey("escolas.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    tipo = Column(
        Enum(
            TipoVinculoEnum,
            name="tipovinculoenum",
            create_type=False,
        ),
        nullable=False,
    )

    numero_funcional = Column(
        String(50),
        nullable=True,
    )

    cargo = Column(
        Enum(
            CargoFuncionarioEnum,
            name="cargofuncionarioenum",
            create_type=False,
        ),
        nullable=True,
    )

    formacao = Column(
        String(255),
        nullable=True,
    )

    disciplinas = Column(
        Text,
        nullable=True,
    )

    numero_processo = Column(
        String(50),
        nullable=True,
    )

    turma_id = Column(
        UUID(as_uuid=True),
        ForeignKey("turmas.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    observacao = Column(
        Text,
        nullable=True,
    )

    ativo = Column(
        Boolean,
        nullable=False,
        default=True,
        server_default=sa.true(),
    )

    pessoa = relationship(
        "Pessoa",
        back_populates="vinculos",
    )

    escola = relationship(
        "Escola",
    )

    turma = relationship(
        "Turma",
    )

    __table_args__ = (
        UniqueConstraint(
            "pessoa_id",
            "escola_id",
            "tipo",
            name="uq_vinculo_pessoa_escola_tipo",
        ),
    )
