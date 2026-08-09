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

---

## Frontend (2026-06)
React 19 + TypeScript (CRA + craco), Tailwind, Framer Motion, axios, React Router 7.
Design system implemented exactly: Inter/Sora/JetBrains Mono, #0A0A0F bg, #111118 glass
cards, #6366F1 accent, risk colors green/amber/red, blur(12px) glass, 200ms ease-out
transitions, skeleton shimmer (no spinners), mobile responsive.

Pages:
- `/` Landing — hero, URL/raw-text toggle, Analyze Now, 3 feature cards, 3 demo cards, footer.
- `/loading` — full-page skeleton shimmer + progress bar + status messages cycling every 2s;
  performs the analyze/demo call then routes to results; error card on failure.
- `/results/:documentId` — fetches GET /api/document/:id; 60% left clause panel (JetBrains Mono,
  risk-color 15% tint, clickable), 40% sticky right panel (summary card w/ overall score,
  high-risk count, category breakdown bars; switches to clause detail on click), top bar
  (title, date, Share=copy URL, Download PDF placeholder), category filter chips,
  Framer Motion layoutId clause animation.

Files: src/App.tsx, src/index.tsx, src/index.css, src/lib/api.ts, src/lib/risk.ts,
src/pages/{Landing,Loading,Results}.tsx, tsconfig.json.

Backend contract wired: POST /api/analyze, GET /api/document/:id,
GET /api/demo/clause-risk-engine?slug= (real backend route). REACT_APP_BACKEND_URL used for all calls.

NOTE: Loading/Results not visually verified live in preview — requires the standalone backend
(Postgres+Redis+GROQ_API_KEY) running per backend/README.md. Landing verified via screenshot;
TypeScript type-check clean.
