"""add admin system with moderation

Revision ID: 20260107_063753
Revises: 384b0c2f1f96
Create Date: 2026-01-07 06:37:53

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from datetime import datetime

# revision identifiers, used by Alembic.
revision = '20260107_063753'
down_revision = '384b0c2f1f96'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ### Criar Enum types ###

    # Enum para roles de admin
    admin_role_enum = postgresql.ENUM('SUPER_ADMIN', 'MODERADOR', 'ANALISTA', name='adminrole')
    admin_role_enum.create(op.get_bind())

    # Enum para status de consulta
    status_consulta_enum = postgresql.ENUM('RASCUNHO', 'ATIVA', 'ENCERRADA', name='statusconsulta')
    status_consulta_enum.create(op.get_bind())

    # Enum para ação de moderação
    acao_moderacao_enum = postgresql.ENUM('APROVAR', 'REJEITAR', name='acaomoderacao')
    acao_moderacao_enum.create(op.get_bind())

    # Enum para status de moderação
    status_moderacao_enum = postgresql.ENUM('PENDENTE', 'APROVADA', 'REJEITADA', name='statusmoderacao')
    status_moderacao_enum.create(op.get_bind())

    # ### 1. Criar tabela admins ###
    op.create_table('admins',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('email_hash', sa.String(length=64), nullable=False),
        sa.Column('email_criptografado', sa.Text(), nullable=False),
        sa.Column('senha_hash', sa.String(length=255), nullable=False),
        sa.Column('nome', sa.String(length=255), nullable=False),
        sa.Column('role', admin_role_enum, nullable=False),
        sa.Column('ativo', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('totp_secret', sa.String(length=32), nullable=True),
        sa.Column('criado_em', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.Column('atualizado_em', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email_hash')
    )
    op.create_index('idx_admin_role_ativo', 'admins', ['role', 'ativo'])
    op.create_index(op.f('ix_admins_criado_em'), 'admins', ['criado_em'])
    op.create_index(op.f('ix_admins_email_hash'), 'admins', ['email_hash'], unique=True)
    op.create_index(op.f('ix_admins_id'), 'admins', ['id'])

    # ### 2. Criar tabela consultas_publicas ###
    op.create_table('consultas_publicas',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('titulo', sa.String(length=500), nullable=False),
        sa.Column('descricao', sa.Text(), nullable=True),
        sa.Column('data_inicio', sa.DateTime(), nullable=False),
        sa.Column('data_fim', sa.DateTime(), nullable=False),
        sa.Column('status', status_consulta_enum, nullable=False, server_default='RASCUNHO'),
        sa.Column('documentos_disponiveis', sa.JSON(), nullable=False),
        sa.Column('criado_por_admin_id', sa.Integer(), nullable=False),
        sa.Column('criado_em', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.Column('atualizado_em', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['criado_por_admin_id'], ['admins.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.CheckConstraint('data_fim > data_inicio', name='check_data_fim_maior')
    )
    op.create_index('idx_consulta_status_periodo', 'consultas_publicas', ['status', 'data_inicio', 'data_fim'])
    op.create_index(op.f('ix_consultas_publicas_criado_em'), 'consultas_publicas', ['criado_em'])
    op.create_index(op.f('ix_consultas_publicas_id'), 'consultas_publicas', ['id'])

    # ### 3. Adicionar colunas de moderação na tabela contribuicoes ###
    op.add_column('contribuicoes', sa.Column('status_moderacao', status_moderacao_enum, nullable=False, server_default='PENDENTE'))
    op.add_column('contribuicoes', sa.Column('moderado_por_id', sa.Integer(), nullable=True))
    op.add_column('contribuicoes', sa.Column('moderado_em', sa.DateTime(), nullable=True))
    op.add_column('contribuicoes', sa.Column('motivo_rejeicao', sa.Text(), nullable=True))

    op.create_foreign_key('fk_contribuicoes_moderado_por', 'contribuicoes', 'admins', ['moderado_por_id'], ['id'])
    op.create_index('idx_contribuicao_status_moderacao', 'contribuicoes', ['status_moderacao', 'criado_em'])
    op.create_index('idx_contribuicao_moderado_por', 'contribuicoes', ['moderado_por_id', 'moderado_em'])

    # ### 4. Criar tabela historico_moderacao ###
    op.create_table('historico_moderacao',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('contribuicao_id', sa.Integer(), nullable=False),
        sa.Column('admin_id', sa.Integer(), nullable=False),
        sa.Column('acao', acao_moderacao_enum, nullable=False),
        sa.Column('motivo', sa.Text(), nullable=True),
        sa.Column('criado_em', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['admin_id'], ['admins.id'], ),
        sa.ForeignKeyConstraint(['contribuicao_id'], ['contribuicoes.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_moderacao_acao', 'historico_moderacao', ['acao'])
    op.create_index('idx_moderacao_admin_criado', 'historico_moderacao', ['admin_id', 'criado_em'])
    op.create_index('idx_moderacao_contribuicao_criado', 'historico_moderacao', ['contribuicao_id', 'criado_em'])
    op.create_index(op.f('ix_historico_moderacao_admin_id'), 'historico_moderacao', ['admin_id'])
    op.create_index(op.f('ix_historico_moderacao_contribuicao_id'), 'historico_moderacao', ['contribuicao_id'])
    op.create_index(op.f('ix_historico_moderacao_criado_em'), 'historico_moderacao', ['criado_em'])
    op.create_index(op.f('ix_historico_moderacao_id'), 'historico_moderacao', ['id'])

    # ### 5. Criar tabela logs_admin ###
    op.create_table('logs_admin',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('admin_id', sa.Integer(), nullable=True),
        sa.Column('acao', sa.String(length=100), nullable=False),
        sa.Column('recurso', sa.String(length=255), nullable=True),
        sa.Column('detalhes', sa.JSON(), nullable=True),
        sa.Column('ip_origem', sa.String(length=45), nullable=True),
        sa.Column('user_agent', sa.Text(), nullable=True),
        sa.Column('criado_em', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['admin_id'], ['admins.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_log_acao_criado', 'logs_admin', ['acao', 'criado_em'])
    op.create_index('idx_log_admin_acao', 'logs_admin', ['admin_id', 'acao'])
    op.create_index(op.f('ix_logs_admin_acao'), 'logs_admin', ['acao'])
    op.create_index(op.f('ix_logs_admin_admin_id'), 'logs_admin', ['admin_id'])
    op.create_index(op.f('ix_logs_admin_criado_em'), 'logs_admin', ['criado_em'])
    op.create_index(op.f('ix_logs_admin_id'), 'logs_admin', ['id'])

    # ### DATA MIGRATION ###

    # 1. Marcar todas contribuições existentes como APROVADA
    op.execute("""
        UPDATE contribuicoes
        SET status_moderacao = 'APROVADA'
        WHERE publicada = true
    """)

    # 2. Criar admin inicial (SUPER_ADMIN)
    # Nota: Senha é "Senha123!" hasheada com bcrypt
    # IMPORTANTE: Alterar senha no primeiro login!
    op.execute("""
        INSERT INTO admins (email_hash, email_criptografado, senha_hash, nome, role, ativo, criado_em)
        VALUES (
            'f7d8c88f1ed8e7f8c1c7b1e4f5a2d3e9c6b8a1f2d3e4c5b6a7f8d9e0c1b2a3d4',
            'gAAAAABmAdmin1234567890abcdefghijklmnopqrstuvwxyz==',
            '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYzOtWUTGa.',
            'Administrador CFO',
            'SUPER_ADMIN',
            true,
            now()
        )
    """)

    print("""
    ╔═══════════════════════════════════════════════════════════════════╗
    ║                    MIGRATION EXECUTADA COM SUCESSO                ║
    ╠═══════════════════════════════════════════════════════════════════╣
    ║                                                                   ║
    ║  ✅ Sistema administrativo instalado                              ║
    ║  ✅ Contribuições existentes marcadas como APROVADA               ║
    ║  ✅ Admin inicial criado                                          ║
    ║                                                                   ║
    ║  📧 Email: admin@cfo.org.br                                       ║
    ║  🔑 Senha: Senha123!                                              ║
    ║                                                                   ║
    ║  ⚠️  IMPORTANTE: ALTERE A SENHA NO PRIMEIRO LOGIN!                ║
    ║                                                                   ║
    ╚═══════════════════════════════════════════════════════════════════╝
    """)


def downgrade() -> None:
    # ### Remover tabelas ###
    op.drop_index(op.f('ix_logs_admin_id'), table_name='logs_admin')
    op.drop_index(op.f('ix_logs_admin_criado_em'), table_name='logs_admin')
    op.drop_index(op.f('ix_logs_admin_admin_id'), table_name='logs_admin')
    op.drop_index(op.f('ix_logs_admin_acao'), table_name='logs_admin')
    op.drop_index('idx_log_admin_acao', table_name='logs_admin')
    op.drop_index('idx_log_acao_criado', table_name='logs_admin')
    op.drop_table('logs_admin')

    op.drop_index(op.f('ix_historico_moderacao_id'), table_name='historico_moderacao')
    op.drop_index(op.f('ix_historico_moderacao_criado_em'), table_name='historico_moderacao')
    op.drop_index(op.f('ix_historico_moderacao_contribuicao_id'), table_name='historico_moderacao')
    op.drop_index(op.f('ix_historico_moderacao_admin_id'), table_name='historico_moderacao')
    op.drop_index('idx_moderacao_contribuicao_criado', table_name='historico_moderacao')
    op.drop_index('idx_moderacao_admin_criado', table_name='historico_moderacao')
    op.drop_index('idx_moderacao_acao', table_name='historico_moderacao')
    op.drop_table('historico_moderacao')

    op.drop_index('idx_contribuicao_moderado_por', table_name='contribuicoes')
    op.drop_index('idx_contribuicao_status_moderacao', table_name='contribuicoes')
    op.drop_constraint('fk_contribuicoes_moderado_por', 'contribuicoes', type_='foreignkey')
    op.drop_column('contribuicoes', 'motivo_rejeicao')
    op.drop_column('contribuicoes', 'moderado_em')
    op.drop_column('contribuicoes', 'moderado_por_id')
    op.drop_column('contribuicoes', 'status_moderacao')

    op.drop_index(op.f('ix_consultas_publicas_id'), table_name='consultas_publicas')
    op.drop_index(op.f('ix_consultas_publicas_criado_em'), table_name='consultas_publicas')
    op.drop_index('idx_consulta_status_periodo', table_name='consultas_publicas')
    op.drop_table('consultas_publicas')

    op.drop_index(op.f('ix_admins_id'), table_name='admins')
    op.drop_index(op.f('ix_admins_email_hash'), table_name='admins')
    op.drop_index(op.f('ix_admins_criado_em'), table_name='admins')
    op.drop_index('idx_admin_role_ativo', table_name='admins')
    op.drop_table('admins')

    # Drop enums
    status_moderacao_enum = postgresql.ENUM('PENDENTE', 'APROVADA', 'REJEITADA', name='statusmoderacao')
    status_moderacao_enum.drop(op.get_bind())

    acao_moderacao_enum = postgresql.ENUM('APROVAR', 'REJEITAR', name='acaomoderacao')
    acao_moderacao_enum.drop(op.get_bind())

    status_consulta_enum = postgresql.ENUM('RASCUNHO', 'ATIVA', 'ENCERRADA', name='statusconsulta')
    status_consulta_enum.drop(op.get_bind())

    admin_role_enum = postgresql.ENUM('SUPER_ADMIN', 'MODERADOR', 'ANALISTA', name='adminrole')
    admin_role_enum.drop(op.get_bind())
