import uuid
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field, model_validator

Category = Literal[
    "Data Collection",
    "Data Sharing",
    "User Rights",
    "Liability",
    "Termination",
    "Arbitration",
    "Content Ownership",
    "Payment",
    "Other",
]


class AnalyzeRequest(BaseModel):
    url: str | None = None
    raw_text: str | None = None

    @model_validator(mode="after")
    def _require_one(self):
        if not self.url and not self.raw_text:
            raise ValueError("Provide either 'url' or 'raw_text'.")
        return self


class ClauseAnalysis(BaseModel):
    category: Category
    risk_score: int = Field(ge=1, le=5)
    plain_explanation: str
    risk_reason: str


class AnalyzeResponse(BaseModel):
    document_id: uuid.UUID
    clause_count: int
    high_risk_count: int
    overall_risk_score: float


class ClauseOut(BaseModel):
    id: uuid.UUID
    clause_index: int | None
    clause_text: str | None
    category: str | None
    risk_score: int | None
    plain_explanation: str | None
    risk_reason: str | None

    model_config = {"from_attributes": True}


class DocumentOut(BaseModel):
    id: uuid.UUID
    source_url: str | None
    content_hash: str | None
    raw_text: str | None
    created_at: datetime | None
    overall_risk_score: float | None
    clause_count: int | None
    high_risk_count: int | None
    clauses: list[ClauseOut]

    model_config = {"from_attributes": True}


class EvalItem(BaseModel):
    clause_text: str
    true_category: str
    true_risk_score: int


class EvalResponse(BaseModel):
    category_accuracy: float
    risk_mae: float
    high_risk_recall: float
