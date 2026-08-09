"""initial schema: documents and clauses

Revision ID: 0001
Revises:
Create Date: 2026-06-01

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute('CREATE EXTENSION IF NOT EXISTS "pgcrypto"')

    op.create_table(
        "documents",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            server_default=sa.text("gen_random_uuid()"),
            primary_key=True,
        ),
        sa.Column("source_url", sa.Text(), nullable=True),
        sa.Column("content_hash", sa.Text(), nullable=True, unique=True),
        sa.Column("raw_text", sa.Text(), nullable=True),
        sa.Column(
            "created_at",
            sa.TIMESTAMP(),
            server_default=sa.text("now()"),
            nullable=True,
        ),
        sa.Column("overall_risk_score", sa.Float(), nullable=True),
        sa.Column("clause_count", sa.Integer(), nullable=True),
        sa.Column("high_risk_count", sa.Integer(), nullable=True),
    )

    op.create_table(
        "clauses",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            server_default=sa.text("gen_random_uuid()"),
            primary_key=True,
        ),
        sa.Column(
            "document_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("documents.id"),
            nullable=True,
        ),
        sa.Column("clause_index", sa.Integer(), nullable=True),
        sa.Column("clause_text", sa.Text(), nullable=True),
        sa.Column("category", sa.Text(), nullable=True),
        sa.Column("risk_score", sa.Integer(), nullable=True),
        sa.Column("plain_explanation", sa.Text(), nullable=True),
        sa.Column("risk_reason", sa.Text(), nullable=True),
    )


def downgrade() -> None:
    op.drop_table("clauses")
    op.drop_table("documents")
