"""create_table_pessoas_vinculos

Revision ID: b91d8223bd3e
Revises: 9246e2c23078
Create Date: 2026-09-10 08:05:16.599348

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql # <- IMPORTA ISSO

revision: str = 'b91d8223bd3e'
down_revision: Union[str, Sequence[str], None] = '9246e2c23078'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    """Upgrade schema."""

    # 1. Criar ENUMs na mão com IF NOT EXISTS
    op.execute("CREATE TYPE sexoeenum AS ENUM ('MASCULINO', 'FEMININO')")
    op.execute("CREATE TYPE estadocivilenum AS ENUM ('SOLTEIRO', 'CASADO', 'DIVORCIADO', 'VIUVO')")
    op.execute("CREATE TYPE tipovinculoenum AS ENUM ('ALUNO', 'PROFESSOR', 'FUNCIONARIO', 'ENCARREGADO')")
    op.execute("CREATE TYPE cargofuncionarioenum AS ENUM ('SECRETARIO', 'DIRETOR_GERAL', 'PEDAGOGICO', 'LIMPEZA', 'SEGURANCA', 'OUTRO')")

    # 2. Criar Tabela Pessoas. Usa postgresql.ENUM e create_type=False
    op.create_table(
        'pessoas',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('nome', sa.String(length=255), nullable=False),
        sa.Column('bi', sa.String(length=20), nullable=False),
        sa.Column('data_nascimento', sa.Date(), nullable=True),
        sa.Column('sexo', postgresql.ENUM('MASCULINO', 'FEMININO', name='sexoeenum', create_type=False), nullable=True),
        sa.Column('estado_civil', postgresql.ENUM('SOLTEIRO', 'CASADO', 'DIVORCIADO', 'VIUVO', name='estadocivilenum', create_type=False), nullable=True),
        sa.Column('telefone', sa.String(length=20), nullable=True),
        sa.Column('email', sa.String(length=255), nullable=True),
        sa.Column('endereco', sa.String(length=500), nullable=True),
        sa.Column('ativo', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('criado_em', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('bi', name='uq_pessoas_bi')
    )
    op.create_index('ix_pessoas_nome', 'pessoas', ['nome'], unique=False)
    op.create_index('ix_pessoas_bi', 'pessoas', ['bi'], unique=False)

    # 3. Criar Tabela Vinculos_Escola
    op.create_table(
        'vinculos_escola',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('pessoa_id', sa.UUID(), nullable=False),
        sa.Column('escola_id', sa.UUID(), nullable=False),
        sa.Column('tipo', postgresql.ENUM('ALUNO', 'PROFESSOR', 'FUNCIONARIO', 'ENCARREGADO', name='tipovinculoenum', create_type=False), nullable=False),

        sa.Column('numero_funcional', sa.String(length=50), nullable=True),
        sa.Column('cargo', postgresql.ENUM('SECRETARIO', 'DIRETOR_GERAL', 'PEDAGOGICO', 'LIMPEZA', 'SEGURANCA', 'OUTRO', name='cargofuncionarioenum', create_type=False), nullable=True),
        sa.Column('formacao', sa.String(length=255), nullable=True),
        sa.Column('disciplinas', sa.Text(), nullable=True),
        sa.Column('numero_processo', sa.String(length=50), nullable=True),
        sa.Column('turma_id', sa.UUID(), nullable=True),
        sa.Column('observacao', sa.Text(), nullable=True),
        sa.Column('ativo', sa.Boolean(), nullable=False, server_default='true'),

        sa.ForeignKeyConstraint(['escola_id'], ['escolas.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['pessoa_id'], ['pessoas.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['turma_id'], ['turmas.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('pessoa_id', 'escola_id', 'tipo', name='uq_vinculo_pessoa_escola_tipo')
    )
    op.create_index('ix_vinculos_escola_escola_id', 'vinculos_escola', ['escola_id'], unique=False)
    op.create_index('ix_vinculos_escola_pessoa_id', 'vinculos_escola', ['pessoa_id'], unique=False)
    op.create_index('ix_vinculos_escola_tipo', 'vinculos_escola', ['tipo'], unique=False)

def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index('ix_vinculos_escola_tipo', table_name='vinculos_escola')
    op.drop_index('ix_vinculos_escola_pessoa_id', table_name='vinculos_escola')
    op.drop_index('ix_vinculos_escola_escola_id', table_name='vinculos_escola')
    op.drop_table('vinculos_escola')

    op.drop_index('ix_pessoas_bi', table_name='pessoas')
    op.drop_index('ix_pessoas_nome', table_name='pessoas')
    op.drop_table('pessoas')
