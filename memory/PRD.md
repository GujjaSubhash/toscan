# ClarityToS — Backend PRD

## Problem statement
Standalone backend for ClarityToS: analyze Terms of Service documents clause-by-clause
using Groq (`llama-3.1-70b-versatile`), score risk, return plain-English explanations.

## Tech stack (as specified — final, no reinterpretation)
Python · FastAPI · PostgreSQL (SQLAlchemy async + asyncpg) · Redis · Alembic ·
trafilatura · slowapi

## Architecture
- `app/main.py` — FastAPI app, CORS (all origins), slowapi middleware + 429 handler.
- `app/config.py` — env-driven config (GROQ_API_KEY, DATABASE_URL, REDIS_URL, GROQ_MODEL).
- `app/database.py` — async engine + session factory.
- `app/models.py` — `Document`, `Clause` SQLAlchemy models (UUID PK via gen_random_uuid()).
- `app/schemas.py` — Pydantic: AnalyzeRequest, ClauseAnalysis, AnalyzeResponse, DocumentOut, EvalItem, EvalResponse.
- `app/groq_client.py` — Groq OpenAI-compatible call with exact system prompt, JSON mode.
- `app/analysis.py` — fetch(trafilatura)/hash/cache/segment/analyze/store orchestration.
- `app/cache.py` — Redis client + key helper.
- `app/rate_limit.py` — slowapi limiter (10/hour) + message.
- `app/demo_data.py` — bundled ToS text for spotify/twitter/whatsapp.
- `app/routers/*` — analyze, document, eval, demo.
- `alembic/` — migration 0001 creates documents + clauses (+ pgcrypto extension).
- `scripts/seed_demos.py` — seeds the 3 demos (source_url = `demo:<slug>`).
- `requirements.txt`, `.env.example`, `Dockerfile`, `README.md`.

## Endpoints
- POST `/api/analyze` (rate limited 10/IP/hour → 429 "Rate limit reached. Try again in 1 hour.")
- GET `/api/document/{document_id}`
- POST `/api/eval/run`
- GET `/api/demo/clause-risk-engine?slug=`
- GET `/api/health`

## Decisions
- High-risk threshold = risk_score >= 4. overall_risk_score = mean of clause scores.
- Cache key `tos:hash:<sha256>` TTL 24h; also dedupes via unique content_hash.
- Demos stored in the fixed `documents` table using `source_url = demo:<slug>` (no schema additions).

## Status (2026-06)
- All modules implemented; imports clean; routes registered; Alembic renders exact schema; core logic unit-verified.
- NOT run end-to-end in this container: Postgres/Redis are not provisioned here (user chose code + Dockerfile delivery). Requires GROQ_API_KEY + running Postgres/Redis to exercise live.

## Backlog / next
- P1: Seed demos against live Groq once key + DB provided.
- P2: Add pytest suite with mocked Groq for CI.
- P2: Frontend UI for the analyzer.
