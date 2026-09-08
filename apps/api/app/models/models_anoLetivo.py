from sqlalchemy import CheckConstraint, Date, ForeignKey, Integer, String, TIMESTAMP, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func
from datetime import date, datetime
from app.db.database import Base


class AnoLetivo(Base):
    __tablename__ = "anos_letivos"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    escola_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("escolas.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    nome: Mapped[str] = mapped_column(
        String(9),
        nullable=False,
        comment="Formato Angola: 2026/2027"
    )
    data_inicio: Mapped[date] = mapped_column(Date, nullable=False)
    data_fim: Mapped[date] = mapped_column(Date, nullable=False)
    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="PLANEJAMENTO",
        index=True
    )

    criado_em: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True),
        server_default=func.now(),
        nullable=False
    )

    __table_args__ = (
        UniqueConstraint("escola_id", "nome", name="uq_escola_ano_nome"),
        CheckConstraint(
            "status IN ('PLANEJAMENTO', 'ATIVO', 'FECHADO')",
            name="ck_anoletivo_status"
        ),
    )
