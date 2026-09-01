"""add email and ativo to escolas table

Revision ID: 560c02e95321
Revises: d7ef0fd28ff4
Create Date: 2026-09-01 14:23:52.247815

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '560c02e95321'
down_revision: Union[str, Sequence[str], None] = 'd7ef0fd28ff4'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # 1. Adiciona as colunas que faltam
    op.add_column('escolas', sa.Column('email', sa.String(length=255), nullable=True))
    op.add_column('escolas', sa.Column('ativo', sa.Boolean(), nullable=True, server_default='true'))

    # 2. Corrige registros antigos que estão NULL
    op.execute("UPDATE escolas SET ativo = true WHERE ativo IS NULL")

    # 3. Garante que daqui pra frente não pode ser NULL
    op.alter_column('escolas', 'ativo', nullable=False, server_default='true')


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('escolas', 'ativo')
    op.drop_column('escolas', 'email')
