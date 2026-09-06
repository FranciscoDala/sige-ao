"""init
Revision ID: 65f66620877b
Revises:
Create Date: 2026-09-06 12:04:42.744267
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID

revision = '65f66620877b'
down_revision = None

def upgrade():
    # 1. ENUMs na mão com DO $$ pra não quebrar
    op.execute("""
    DO $$ BEGIN
        CREATE TYPE nivelensino AS ENUM ('PRIMARIO', 'I_CICLO', 'II_CICLO', 'COMPLEXO', 'MEDIO_TECNICO', 'SUPERIOR');
    EXCEPTION
        WHEN duplicate_object THEN null;
    END $$;
    """)
    op.execute("""
    DO $$ BEGIN
        CREATE TYPE nivelacesso AS ENUM ('MINISTERIO', 'DIRECAO', 'DIRETOR', 'SUBDIRETOR_PEDAGOGICO', 'SUBDIRETOR_ADMINISTRATIVO', 'SECRETARIO', 'PROFESSOR', 'COORDENADOR_CURSO', 'COORDENADOR_CLASSE', 'ALUNO', 'ENCARREGADO', 'FUNCIONARIO');
    EXCEPTION
        WHEN duplicate_object THEN null;
    END $$;
    """)

    # 2. Tabelas - IMPORTANTE: usar String ao inves de sa.Enum pra não tentar criar 2x
    op.create_table('escolas',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('nome', sa.String(255), nullable=False),
        sa.Column('sigla', sa.String(10)),
        sa.Column('id_curto', sa.String(10), unique=True, nullable=False),
        sa.Column('nif', sa.String(50)),
        sa.Column('nivel_ensino', sa.String(50), nullable=False, server_default='PRIMARIO'), # String em vez de Enum
        sa.Column('endereco', sa.String(500)),
        sa.Column('provincia', sa.String(50)),
        sa.Column('municipio', sa.String(50)),
        sa.Column('telefone', sa.String(20)),
        sa.Column('email', sa.String(255)),
        sa.Column('logo_url', sa.Text()),
        sa.Column('cor_primaria', sa.String(7), server_default='#0056b3'),
        sa.Column('cor_secundaria', sa.String(7), server_default='#FFC107'),
        sa.Column('cor_fundo', sa.String(7), server_default='#FFFFFF'),
        sa.Column('tema', sa.String(20), server_default='claro'),
        sa.Column('ativo', sa.Boolean(), server_default='true'),
        sa.Column('criado_em', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'))
    )

    op.create_table('usuarios',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('nome', sa.String(255), nullable=False),
        sa.Column('email', sa.String(255), unique=True, nullable=False),
        sa.Column('senha', sa.String(255), nullable=False),
        sa.Column('telefone', sa.String(20)),
        sa.Column('foto_url', sa.String(500)),
        sa.Column('ativo', sa.Boolean(), server_default='true'),
        sa.Column('criado_em', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'))
    )

    op.create_table('usuario_escola',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('usuario_id', UUID(as_uuid=True), sa.ForeignKey('usuarios.id', ondelete='CASCADE'), nullable=False),
        sa.Column('escola_id', UUID(as_uuid=True), sa.ForeignKey('escolas.id', ondelete='CASCADE'), nullable=True),
        sa.Column('nivel', sa.String(50), nullable=False), # String em vez de Enum
        sa.Column('aluno_id', UUID(as_uuid=True)),
        sa.Column('professor_id', UUID(as_uuid=True)),
        sa.Column('criado_em', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()')),
        sa.UniqueConstraint('usuario_id', 'escola_id', name='uq_usuario_escola'),
    )

    op.create_table('turmas',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('nome', sa.String(100), nullable=False),
        sa.Column('ano_letivo', sa.String(10), nullable=False),
        sa.Column('escola_id', UUID(as_uuid=True), sa.ForeignKey('escolas.id', ondelete='CASCADE'), nullable=False)
    )

    op.create_table('alunos',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('nome', sa.String(255), nullable=False),
        sa.Column('matricula', sa.String(50), unique=True, nullable=False),
        sa.Column('escola_id', UUID(as_uuid=True), sa.ForeignKey('escolas.id', ondelete='CASCADE'), nullable=False)
    )

    op.create_table('professores',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('nome', sa.String(255), nullable=False),
        sa.Column('especialidade', sa.String(100)),
        sa.Column('escola_id', UUID(as_uuid=True), sa.ForeignKey('escolas.id', ondelete='CASCADE'), nullable=False)
    )

def downgrade():
    op.drop_table('professores')
    op.drop_table('alunos')
    op.drop_table('turmas')
    op.drop_table('usuario_escola')
    op.drop_table('usuarios')
    op.drop_table('escolas')
    op.execute('DROP TYPE IF EXISTS nivelacesso')
    op.execute('DROP TYPE IF EXISTS nivelensino')
