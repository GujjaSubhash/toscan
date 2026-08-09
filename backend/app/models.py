import uuid
from datetime import datetime

from sqlalchemy import (
    Float,
    ForeignKey,
    Integer,
    Text,
    text,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.database import Base


class Document(Base):
    __tablename__ = "documents"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )
    source_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    content_hash: Mapped[str | None] = mapped_column(Text, unique=True)
    raw_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())
    overall_risk_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    clause_count: Mapped[int | None] = mapped_column(Integer, nullable=True)
    high_risk_count: Mapped[int | None] = mapped_column(Integer, nullable=True)

    clauses: Mapped[list["Clause"]] = relationship(
        back_populates="document",
        cascade="all, delete-orphan",
        order_by="Clause.clause_index",
    )


class Clause(Base):
    __tablename__ = "clauses"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )
    document_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("documents.id")
    )
    clause_index: Mapped[int | None] = mapped_column(Integer, nullable=True)
    clause_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    category: Mapped[str | None] = mapped_column(Text, nullable=True)
    risk_score: Mapped[int | None] = mapped_column(Integer, nullable=True)
    plain_explanation: Mapped[str | None] = mapped_column(Text, nullable=True)
    risk_reason: Mapped[str | None] = mapped_column(Text, nullable=True)

    document: Mapped["Document"] = relationship(back_populates="clauses")
