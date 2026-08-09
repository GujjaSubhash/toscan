# ClarityToS — Backend

Analyzes Terms of Service documents clause-by-clause using the Groq API
(`llama-3.1-70b-versatile`), scores each clause for risk, and returns plain-English
explanations.

## Tech stack
Python · FastAPI · PostgreSQL (SQLAlchemy async + asyncpg) · Redis · Alembic ·
trafilatura · slowapi

## Environment variables
Copy `.env.example` to `.env` and fill in:

| Var | Description |
|-----|-------------|
| `GROQ_API_KEY` | Groq API key — get one at https://console.groq.com/keys |
| `DATABASE_URL` | e.g. `postgresql+asyncpg://user:pass@host:5432/claritytos` |
| `REDIS_URL` | e.g. `redis://localhost:6379/0` |
| `GROQ_MODEL` | optional, defaults to `llama-3.1-70b-versatile` |

## Run locally

```bash
# Postgres + Redis (example via docker)
docker run -d --name ctos-pg -e POSTGRES_USER=clarity -e POSTGRES_PASSWORD=clarity \
  -e POSTGRES_DB=claritytos -p 5432:5432 postgres:16
docker run -d --name ctos-redis -p 6379:6379 redis:7

pip install -r requirements.txt
cp .env.example .env   # then edit values

alembic upgrade head              # create tables
python -m scripts.seed_demos      # seed spotify/twitter/whatsapp demos
uvicorn app.main:app --reload --port 8000
```

## Run with Docker

```bash
docker build -t claritytos .
docker run --env-file .env -p 8000:8000 claritytos   # runs migrations then serves
# seed demos once the container is up:
docker exec <container> python -m scripts.seed_demos
```

## API

### `POST /api/analyze`
Body: `{ "url": "..." }` or `{ "raw_text": "..." }`
Fetches/extracts text (trafilatura), SHA256-hashes it, checks Redis cache
(24h TTL), segments on double newlines (drops clauses < 30 chars), analyzes each
clause via Groq, stores document + clauses.
Returns: `{ document_id, clause_count, high_risk_count, overall_risk_score }`
Rate limited to **10 requests / IP / hour** (429 `"Rate limit reached. Try again in 1 hour."`).

### `GET /api/document/{document_id}`
Returns the full document with all clauses and their analysis.

### `POST /api/eval/run`
Body: `[{ clause_text, true_category, true_risk_score }]`
Returns: `{ category_accuracy, risk_mae, high_risk_recall }` (high risk = score ≥ 4).

### `GET /api/demo/clause-risk-engine?slug=spotify|twitter|whatsapp`
Returns `{ document_id }` for the pre-seeded demo.
