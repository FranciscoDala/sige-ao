from sqlalchemy import Column, Integer, String, Date, ForeignKey, TIMESTAMP, UniqueConstraint, Index
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import UUID
from app.db.database import Base # 👈 AJUSTADO: No teu projeto é aqui

class AnoLetivo(Base):
    __tablename__ = "anos_letivos"

    id = Column(Integer, primary_key=True, index=True)
    escola_id = Column(UUID(as_uuid=True), ForeignKey("escolas.id", ondelete="CASCADE"), nullable=False, index=True)

    nome = Column(String(9), nullable=False, comment="Formato Angola: 2026/2027")
    data_inicio = Column(Date, nullable=False)
    data_fim = Column(Date, nullable=False)
    status = Column(String(20), nullable=False, default="PLANEJAMENTO", index=True) # PLANEJAMENTO, ATIVO, FECHADO

    criado_em = Column(TIMESTAMP(timezone=True), server_default=func.now(), nullable=False)

    __table_args__ = (
        UniqueConstraint('escola_id', 'nome', name='uq_escola_ano_nome'),
    )
