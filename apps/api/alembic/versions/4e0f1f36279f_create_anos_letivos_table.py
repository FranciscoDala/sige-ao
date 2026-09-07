"""create anos_letivos table

Revision ID: 4e0f1f36279f
Revises: c35c773b6699
Create Date: 2026-09-07 16:00:22.417483

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID
import uuid

# revision identifiers, used by Alembic.
revision: str = '4e0f1f36279f'
down_revision: Union[str, Sequence[str], None] = 'c35c773b6699'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        'anos_letivos',
        sa.Column('id', sa.Integer(), nullable=False), # id interno pode continuar int
        sa.Column('escola_id', UUID(as_uuid=True), nullable=False), # 👈 MUDOU AQUI
        sa.Column('nome', sa.String(length=9), nullable=False, comment='Formato Angola: 2026/2027'),
        sa.Column('data_inicio', sa.Date(), nullable=False, comment='Ex: 2026-09-01'),
        sa.Column('data_fim', sa.Date(), nullable=False, comment='Ex: 2027-06-30'),
        sa.Column('status', sa.String(length=20), nullable=False, server_default='PLANEJAMENTO'),
        sa.Column('criado_em', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['escola_id'], ['escolas.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('escola_id', 'nome', name='uq_escola_ano_nome')
    )
    op.create_index(op.f('ix_anos_letivos_escola_id'), 'anos_letivos', ['escola_id'], unique=False)
    op.create_index(op.f('ix_anos_letivos_status'), 'anos_letivos', ['status'], unique=False)

def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f('ix_anos_letivos_status'), table_name='anos_letivos')
    op.drop_index(op.f('ix_anos_letivos_escola_id'), table_name='anos_letivos')
    op.drop_table('anos_letivos')
