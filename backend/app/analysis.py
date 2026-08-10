import asyncio
import hashlib
import uuid

import httpx
import trafilatura
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.cache import cache_key, get_redis
from app.config import (
    CACHE_TTL_SECONDS,
    HIGH_RISK_THRESHOLD,
    MIN_CLAUSE_LENGTH,
)
from app.groq_client import analyze_clause
from app.models import Clause, Document
from app.schemas import ClauseAnalysis

_MAX_CONCURRENCY = 5


def sha256_text(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def segment_clauses(text: str) -> list[str]:
    parts = text.split("\n\n")
    return [p.strip() for p in parts if len(p.strip()) >= MIN_CLAUSE_LENGTH]


async def _fetch_url_text(url: str) -> str | None:
    def _run() -> str | None:
        downloaded = trafilatura.fetch_url(url)
        if not downloaded:
            return None
        return trafilatura.extract(downloaded)

    return await asyncio.to_thread(_run)


async def _analyze_all(clause_texts: list[str]) -> list[ClauseAnalysis]:
    semaphore = asyncio.Semaphore(_MAX_CONCURRENCY)

    async with httpx.AsyncClient() as client:

        async def _one(text: str) -> ClauseAnalysis:
            async with semaphore:
                return await analyze_clause(client, text)

        return await asyncio.gather(*[_one(t) for t in clause_texts[:20]])


async def get_document(session: AsyncSession, document_id: uuid.UUID) -> Document | None:
    result = await session.execute(
        select(Document)
        .options(selectinload(Document.clauses))
        .where(Document.id == document_id)
    )
    return result.scalar_one_or_none()


async def analyze(
    session: AsyncSession,
    *,
    url: str | None = None,
    raw_text: str | None = None,
    source_url_override: str | None = None,
) -> Document:
    if url:
        text = await _fetch_url_text(url)
        if not text:
            raise ValueError("Could not fetch or extract text from the provided URL.")
        source_url = source_url_override or url
    else:
        text = raw_text
        source_url = source_url_override

    if not text or not text.strip():
        raise ValueError("No text available to analyze.")

    content_hash = sha256_text(text)
    redis_client = get_redis()

    cached_id = await redis_client.get(cache_key(content_hash))
    if cached_id:
        existing = await get_document(session, uuid.UUID(cached_id))
        if existing:
            return existing

    existing_row = await session.execute(
        select(Document).where(Document.content_hash == content_hash)
    )
    existing_doc = existing_row.scalar_one_or_none()
    if existing_doc:
        await redis_client.set(
            cache_key(content_hash), str(existing_doc.id), ex=CACHE_TTL_SECONDS
        )
        return await get_document(session, existing_doc.id)

    clause_texts = segment_clauses(text)
    if not clause_texts:
        raise ValueError("No clauses found after segmentation.")

    analyses = await _analyze_all(clause_texts)

    risk_scores = [a.risk_score for a in analyses]
    clause_count = len(analyses)
    high_risk_count = sum(1 for s in risk_scores if s >= HIGH_RISK_THRESHOLD)
    overall_risk_score = sum(risk_scores) / clause_count if clause_count else 0.0

    document = Document(
        source_url=source_url,
        content_hash=content_hash,
        raw_text=text,
        overall_risk_score=overall_risk_score,
        clause_count=clause_count,
        high_risk_count=high_risk_count,
    )
    for idx, (clause_text, a) in enumerate(zip(clause_texts, analyses)):
        document.clauses.append(
            Clause(
                clause_index=idx,
                clause_text=clause_text,
                category=a.category,
                risk_score=a.risk_score,
                plain_explanation=a.plain_explanation,
                risk_reason=a.risk_reason,
            )
        )

    session.add(document)
    await session.commit()

    document = await get_document(session, document.id)
    await redis_client.set(
        cache_key(content_hash), str(document.id), ex=CACHE_TTL_SECONDS
    )
    return document
