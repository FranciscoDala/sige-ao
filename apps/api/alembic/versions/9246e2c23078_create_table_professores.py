"""create_table_professores

Revision ID: 9246e2c23078
Revises: 4e0f1f36279f
Create Date: 2026-09-09 15:31:10.670161

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '9246e2c23078'
down_revision: Union[str, Sequence[str], None] = '4e0f1f36279f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    """Upgrade schema."""

    # 1. NÃO criar ENUM aqui. Deixa o SQLAlchemy fazer

    # 2. Criar Tabela professores
    op.create_table(
        'professores',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('escola_id', sa.UUID(), nullable=False),
        sa.Column('nome', sa.String(length=255), nullable=False),
        sa.Column('bi', sa.String(length=20), nullable=False),
        sa.Column('data_nascimento', sa.Date(), nullable=True),
        sa.Column('sexo', sa.Enum('MASCULINO', 'FEMININO', name='sexoenum'), nullable=True),
        sa.Column('estado_civil', sa.Enum('SOLTEIRO', 'CASADO', 'DIVORCIADO', 'VIUVO', name='estadocivilenum'), nullable=True),
        sa.Column('telefone', sa.String(length=20), nullable=True),
        sa.Column('email', sa.String(length=255), nullable=True),
        sa.Column('endereco', sa.String(length=500), nullable=True),
        sa.Column('numero_funcional', sa.String(length=50), nullable=True),
        sa.Column('formacao', sa.String(length=255), nullable=True),
        sa.Column('disciplinas', sa.String(length=500), nullable=True),
        sa.Column('ativo', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('criado_em', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['escola_id'], ['escolas.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('bi', 'escola_id', name='uq_professores_bi_escola')
    )

    # 3. Criar Índices
    op.create_index('ix_professores_escola_id', 'professores', ['escola_id'])
    op.create_index('ix_professores_bi', 'professores', ['bi'])
    op.create_index('ix_professores_nome', 'professores', ['nome'])

def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index('ix_professores_nome', table_name='professores')
    op.drop_index('ix_professores_bi', table_name='professores')
    op.drop_index('ix_professores_escola_id', table_name='professores')
    op.drop_table('professores')
