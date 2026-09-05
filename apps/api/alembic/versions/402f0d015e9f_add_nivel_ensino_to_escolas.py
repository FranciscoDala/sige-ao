"""add nivel_ensino to escolas

Revision ID: 402f0d015e9f
Revises: e4a5d4ba9c98
Create Date: 2026-09-05 22:39:48.131421

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '402f0d015e9f'
down_revision: Union[str, Sequence[str], None] = 'e4a5d4ba9c98'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    """Upgrade schema."""
    # 1. Criar o ENUM no Postgres
    nivel_enum = sa.Enum(
        'PRIMARIO',
        'I_CICLO',
        'II_CICLO',
        'COMPLEXO',
        'MEDIO_TECNICO',
        'SUPERIOR',
        name='nivelensino'
    )
    nivel_enum.create(op.get_bind())

    # 2. Adicionar a coluna com default pra não quebrar escolas antigas
    op.add_column(
        'escolas',
        sa.Column(
            'nivel_ensino',
            nivel_enum,
            nullable=False,
            server_default='PRIMARIO'
        )
    )

def downgrade() -> None:
    """Downgrade schema."""
    # 1. Remover a coluna
    op.drop_column('escolas', 'nivel_ensino')

    # 2. Remover o ENUM
    op.execute('DROP TYPE nivelensino')
