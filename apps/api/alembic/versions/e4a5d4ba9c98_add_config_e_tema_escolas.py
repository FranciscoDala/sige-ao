"""add config e tema escolas

Revision ID: e4a5d4ba9c98
Revises: 11300ce72f3a
Create Date: 2026-09-02 17:58:06.040814

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = 'e4a5d4ba9c98'
down_revision: Union[str, Sequence[str], None] = '11300ce72f3a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    """Upgrade schema."""
    # USA IF NOT EXISTS PRA TUDO
    op.execute("ALTER TABLE escolas ADD COLUMN IF NOT EXISTS sigla VARCHAR(10)")
    op.execute("ALTER TABLE escolas ADD COLUMN IF NOT EXISTS id_curto VARCHAR(10)")
    op.execute("ALTER TABLE escolas ADD COLUMN IF NOT EXISTS provincia VARCHAR(50)")
    op.execute("ALTER TABLE escolas ADD COLUMN IF NOT EXISTS municipio VARCHAR(50)")
    op.execute("ALTER TABLE escolas ADD COLUMN IF NOT EXISTS cor_primaria VARCHAR(7) DEFAULT '#0056b3'")
    op.execute("ALTER TABLE escolas ADD COLUMN IF NOT EXISTS cor_secundaria VARCHAR(7) DEFAULT '#FFC107'")
    op.execute("ALTER TABLE escolas ADD COLUMN IF NOT EXISTS cor_fundo VARCHAR(7) DEFAULT '#FFFFFF'")
    op.execute("ALTER TABLE escolas ADD COLUMN IF NOT EXISTS tema VARCHAR(20) DEFAULT 'claro'")
    op.execute("ALTER TABLE escolas ADD COLUMN IF NOT EXISTS fonte_titulo VARCHAR(50) DEFAULT 'Poppins'")
    op.execute("ALTER TABLE escolas ADD COLUMN IF NOT EXISTS fonte_corpo VARCHAR(50) DEFAULT 'Inter'")
    op.execute("ALTER TABLE escolas ADD COLUMN IF NOT EXISTS estilo_card VARCHAR(20) DEFAULT 'arredondado'")
    op.execute("ALTER TABLE escolas ADD COLUMN IF NOT EXISTS banner_url TEXT")
    op.execute("ALTER TABLE escolas ADD COLUMN IF NOT EXISTS favicon_url TEXT")
    op.execute("ALTER TABLE escolas ADD COLUMN IF NOT EXISTS permitir_auto_cadastro BOOLEAN DEFAULT false")
    op.execute("ALTER TABLE escolas ADD COLUMN IF NOT EXISTS usar_modulo_propina BOOLEAN DEFAULT true")
    op.execute("ALTER TABLE escolas ADD COLUMN IF NOT EXISTS usar_modulo_biblioteca BOOLEAN DEFAULT false")
    op.execute("ALTER TABLE escolas ADD COLUMN IF NOT EXISTS config_json JSONB DEFAULT '{}'::jsonb")

    # 2. PREENCHER id_curto PARA AS ESCOLAS ANTIGAS
    op.execute("""
        WITH numbered AS (
            SELECT id, 'ESC' || LPAD(row_number() OVER (ORDER BY criado_em)::text, 3, '0') as new_id
            FROM escolas WHERE id_curto IS NULL
        )
        UPDATE escolas e
        SET id_curto = numbered.new_id
        FROM numbered
        WHERE e.id = numbered.id;
    """)

    # 3. AGORA SIM: TORNA NOT NULL E CRIA UNIQUE
    op.execute("ALTER TABLE escolas ALTER COLUMN id_curto SET NOT NULL")
    op.execute("CREATE UNIQUE INDEX IF NOT EXISTS ix_escolas_id_curto ON escolas(id_curto)")

def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index('ix_escolas_id_curto', table_name='escolas', if_exists=True)
    op.drop_column('escolas', 'config_json', if_exists=True)
    op.drop_column('escolas', 'usar_modulo_biblioteca', if_exists=True)
    op.drop_column('escolas', 'usar_modulo_propina', if_exists=True)
    op.drop_column('escolas', 'permitir_auto_cadastro', if_exists=True)
    op.drop_column('escolas', 'favicon_url', if_exists=True)
    op.drop_column('escolas', 'banner_url', if_exists=True)
    op.drop_column('escolas', 'estilo_card', if_exists=True)
    op.drop_column('escolas', 'fonte_corpo', if_exists=True)
    op.drop_column('escolas', 'fonte_titulo', if_exists=True)
    op.drop_column('escolas', 'tema', if_exists=True)
    op.drop_column('escolas', 'cor_fundo', if_exists=True)
    op.drop_column('escolas', 'cor_secundaria', if_exists=True)
    op.drop_column('escolas', 'cor_primaria', if_exists=True)
    op.drop_column('escolas', 'municipio', if_exists=True)
    op.drop_column('escolas', 'provincia', if_exists=True)
    op.drop_column('escolas', 'id_curto', if_exists=True)
    op.drop_column('escolas', 'sigla', if_exists=True)
