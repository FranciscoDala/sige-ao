"""add niveis e trava seguranca

Revision ID: 11300ce72f3a
Revises: 560c02e95321
Create Date: 2026-09-02 17:41:39.204737

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = '11300ce72f3a'
down_revision: Union[str, Sequence[str], None] = '560c02e95321'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    """Upgrade schema."""
    # 1. DROP TABELA ANTIGA USERS SE EXISTIR
    op.drop_index(op.f('ix_users_email'), table_name='users', if_exists=True)
    op.drop_index(op.f('ix_users_id'), table_name='users', if_exists=True)
    op.drop_table('users', if_exists=True)

    op.alter_column('escolas', 'criado_em',
               existing_type=postgresql.TIMESTAMP(timezone=True),
               nullable=False,
               existing_server_default=sa.text('now()'))

    # 2. CRIAR ENUM NOVO DIRETO - SEM RENAME
    nivelacesso_new = postgresql.ENUM('MINISTERIO', 'DIRETOR', 'SUBDIRETOR_PEDAGOGICO', 'SUBDIRETOR_ADMINISTRATIVO', 'SECRETARIO', 'PROFESSOR', 'COORDENADOR_CURSO', 'COORDENADOR_CLASSE', 'ALUNO', 'ENCARREGADO', 'FUNCIONARIO', name='nivelacesso')
    nivelacesso_new.create(op.get_bind(), checkfirst=True)

    # Só altera se a coluna existir com tipo antigo
    op.execute("DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'nivelacesso_old') THEN ALTER TABLE usuario_escola ALTER COLUMN nivel TYPE nivelacesso USING nivel::text::nivelacesso; DROP TYPE nivelacesso_old; END IF; END $$;")

    op.alter_column('usuario_escola', 'criado_em',
               existing_type=postgresql.TIMESTAMP(timezone=True),
               nullable=False,
               existing_server_default=sa.text('now()'))

    op.create_index('ix_superadmin_unico', 'usuario_escola', ['usuario_id'], unique=True, postgresql_where=sa.text('escola_id IS NULL'), if_not_exists=True)
    op.execute("ALTER TABLE usuario_escola ADD CONSTRAINT ck_nivel_escola_consistencia CHECK ((nivel = 'MINISTERIO' AND escola_id IS NULL) OR (nivel!= 'MINISTERIO' AND escola_id IS NOT NULL))")

    # 3. CRIAR SENHA DIRETO - SEM MIGRAR DE senha_hash
    op.execute("ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS senha VARCHAR(255) DEFAULT 'temp123'")
    op.execute("UPDATE usuarios SET senha = 'temp123' WHERE senha IS NULL")
    op.alter_column('usuarios', 'senha', nullable=False, server_default=None)
    op.alter_column('usuarios', 'ativo', existing_type=sa.BOOLEAN(), nullable=False)
    op.alter_column('usuarios', 'criado_em', existing_type=postgresql.TIMESTAMP(timezone=True), nullable=False, existing_server_default=sa.text('now()'))
    op.drop_column('usuarios', 'senha_hash', if_exists=True)

def downgrade() -> None:
    """Downgrade schema."""
    op.add_column('usuarios', sa.Column('senha_hash', sa.VARCHAR(length=255), autoincrement=False, nullable=True))
    op.execute("UPDATE usuarios SET senha_hash = senha")
    op.alter_column('usuarios', 'senha_hash', nullable=False)
    op.alter_column('usuarios', 'criado_em', existing_type=postgresql.TIMESTAMP(timezone=True), nullable=True, existing_server_default=sa.text('now()'))
    op.alter_column('usuarios', 'ativo', existing_type=sa.BOOLEAN(), nullable=True)
    op.drop_column('usuarios', 'senha', if_exists=True)

    op.execute("ALTER TABLE usuario_escola DROP CONSTRAINT IF EXISTS ck_nivel_escola_consistencia")
    op.drop_index('ix_superadmin_unico', table_name='usuario_escola', postgresql_where=sa.text('escola_id IS NULL'), if_exists=True)
    op.execute("DROP TYPE IF EXISTS nivelacesso")

    op.alter_column('usuario_escola', 'criado_em', existing_type=postgresql.TIMESTAMP(timezone=True), nullable=True, existing_server_default=sa.text('now()'))
    op.alter_column('escolas', 'criado_em', existing_type=postgresql.TIMESTAMP(timezone=True), nullable=True, existing_server_default=sa.text('now()'))

    op.create_table('users',
    sa.Column('id', sa.INTEGER(), autoincrement=True, nullable=False),
    sa.Column('email', sa.VARCHAR(), autoincrement=False, nullable=False),
    sa.Column('full_name', sa.VARCHAR(), autoincrement=False, nullable=False),
    sa.Column('hashed_password', sa.VARCHAR(), autoincrement=False, nullable=False),
    sa.Column('is_active', sa.BOOLEAN(), autoincrement=False, nullable=True),
    sa.PrimaryKeyConstraint('id', name=op.f('users_pkey'))
    )
    op.create_index(op.f('ix_users_id'), 'users', ['id'], unique=False)
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)
