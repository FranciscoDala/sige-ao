"""rename nivel DIRECAO to DIRETOR

Revision ID: 6caef8833ee0
Revises: 402f0d015e9f
Create Date: 2026-09-05 23:59:05.898543

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = '6caef8833ee0'
down_revision: Union[str, Sequence[str], None] = '402f0d015e9f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    """Upgrade schema: DIRECAO -> DIRETOR"""

    # 1. Desvincula a coluna do tipo antigo
    op.execute("ALTER TABLE usuario_escola ALTER COLUMN nivel TYPE VARCHAR(50)")

    # 2. Droppa o tipo antigo
    op.execute("DROP TYPE nivelacesso")

    # 3. Cria o novo tipo com DIRETOR
    op.execute("""
        CREATE TYPE nivelacesso AS ENUM(
            'MINISTERIO',
            'DIRETOR',
            'SECRETARIO',
            'PROFESSOR',
            'SUBDIRETOR_PEDAGOGICO',
            'SUBDIRETOR_ADMINISTRATIVO',
            'FUNCIONARIO'
        )
    """)

    # 4. Converte os dados: DIRECAO vira DIRETOR e volta pra enum
    op.execute("""
        ALTER TABLE usuario_escola
        ALTER COLUMN nivel TYPE nivelacesso
        USING
            CASE
                WHEN nivel = 'DIRECAO' THEN 'DIRETOR'::nivelacesso
                ELSE nivel::nivelacesso
            END
    """)

def downgrade() -> None:
    """Downgrade schema: DIRETOR -> DIRECAO"""

    op.execute("ALTER TABLE usuario_escola ALTER COLUMN nivel TYPE VARCHAR(50)")
    op.execute("DROP TYPE nivelacesso")

    op.execute("""
        CREATE TYPE nivelacesso AS ENUM(
            'MINISTERIO',
            'DIRECAO',
            'SECRETARIO',
            'PROFESSOR',
            'SUBDIRETOR_PEDAGOGICO',
            'SUBDIRETOR_ADMINISTRATIVO',
            'FUNCIONARIO'
        )
    """)

    op.execute("""
        ALTER TABLE usuario_escola
        ALTER COLUMN nivel TYPE nivelacesso
        USING
            CASE
                WHEN nivel = 'DIRETOR' THEN 'DIRECAO'::nivelacesso
                ELSE nivel::nivelacesso
            END
    """)
