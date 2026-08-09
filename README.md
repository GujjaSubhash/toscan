# ClarityToS

Paste any Terms of Service URL and get a plain-English, clause-by-clause risk report in seconds.

## Problem statement

Terms of Service documents are long, dense, and written in legalese that most people never read
before agreeing. ClarityToS ingests a ToS document (via URL or raw text), fetches and cleans the
content, segments it into individual clauses, and uses an LLM (Groq · `llama-3.1-70b-versatile`)
to classify each clause into a legal category, score its risk from 1–5, and rewrite it in plain
English — producing an overall risk report so users understand what they are agreeing to.

## Architecture

| Service   | Tech                                                            | Port |
|-----------|-----------------------------------------------------------------|------|
| Frontend  | React + TypeScript (CRA/craco), Tailwind, Framer Motion, axios   | 3000 |
| Backend   | Python · FastAPI · SQLAlchemy async · asyncpg · Alembic · slowapi| 8000 |
| Database  | PostgreSQL 15                                                    | 5432 |
| Cache     | Redis 7                                                          | 6379 |

## Clause categories

| Category           | Description                                                                         |
|--------------------|-------------------------------------------------------------------------------------|
| Data Collection    | What personal data the service gathers about you (name, email, usage, device, etc.).|
| Data Sharing       | How your data is shared with third parties, advertisers, or affiliated companies.   |
| User Rights        | The rights you retain or are granted, including access, control, and opt-outs.      |
| Liability          | Limitations of the provider's liability and disclaimers of warranties.              |
| Termination        | Conditions under which the provider or user can suspend or close an account.        |
| Arbitration        | Mandatory arbitration, jury-trial waivers, and class-action waivers.                |
| Content Ownership  | Who owns the content you create/upload and what licenses you grant the provider.    |
| Payment            | Billing, subscriptions, auto-renewal, fees, and refund terms.                       |
| Other              | Any clause that does not fit the categories above.                                  |

## Risk scoring

Each clause is scored **1–5** (1 = safe, 5 = very risky). Clauses scoring **≥ 4** are counted as
high-risk. The document's `overall_risk_score` is the mean of all clause scores.

## Eval metrics

Run against the labeled set via `POST /api/eval/run`:

| Metric            | Value |
|-------------------|-------|
| Category Accuracy | XX%   |
| Risk MAE          | X.X   |
| High-Risk Recall  | XX%   |

## Local setup (docker-compose)

Spins up all four services (frontend, backend, postgres, redis) on one network.

1. Create a `.env` file at the project root with your Groq key:

   ```
   GROQ_API_KEY=your-groq-api-key-here
   ```

   (Get a key at https://console.groq.com/keys)

2. Build and start everything:

   ```bash
   docker compose up --build
   ```

   The backend container runs `alembic upgrade head` automatically on start.

3. Seed the demo documents (spotify / twitter / whatsapp) once the stack is up:

   ```bash
   docker compose exec backend python -m scripts.seed_demos
   ```

4. Open the app:

   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000/api
   - Health check: http://localhost:8000/api/health

To stop: `docker compose down` (add `-v` to also remove the Postgres volume).

## Railway deployment

The backend is deployed as a Dockerfile service using `railway.json`.

1. Install the CLI and log in:

   ```bash
   npm i -g @railway/cli
   railway login
   ```

2. Create a project and add managed **PostgreSQL** and **Redis** plugins from the Railway dashboard.

3. Point the service's **Root Directory** to `backend` so the Dockerfile build context resolves,
   then set these variables on the backend service (Postgres/Redis values come from the plugins):

   - `GROQ_API_KEY`
   - `DATABASE_URL` — use the plugin's `postgresql+asyncpg://…` connection string
   - `REDIS_URL`
   - `GROQ_MODEL` = `llama-3.1-70b-versatile`

4. Deploy:

   ```bash
   railway up
   ```

   `railway.json` runs `alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   and health-checks `/api/health`. A root `Procfile` is also provided for Nixpacks/Procfile-based
   platforms: `web: cd backend && alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}`.

5. Deploy the frontend as a separate service (Root Directory `frontend`) and set the build arg /
   variable `REACT_APP_BACKEND_URL` to your deployed backend URL.

The frontend reads its API base URL exclusively from the `REACT_APP_BACKEND_URL` environment
variable and calls `${REACT_APP_BACKEND_URL}/api/...`.

## API endpoints

### `POST /api/analyze`
Analyze a ToS document. Rate limited to **10 requests / IP / hour** (returns `429` with
`{"detail": "Rate limit reached. Try again in 1 hour."}`).

Request:
```json
{ "url": "https://example.com/terms" }        // or
{ "raw_text": "Full terms of service text…" }
```
Response:
```json
{ "document_id": "uuid", "clause_count": 12, "high_risk_count": 4, "overall_risk_score": 3.2 }
```

### `GET /api/document/{document_id}`
Returns the full document with all clauses and their analysis.
```json
{
  "id": "uuid",
  "source_url": "https://example.com/terms",
  "content_hash": "…",
  "raw_text": "…",
  "created_at": "2026-06-01T00:00:00Z",
  "overall_risk_score": 3.2,
  "clause_count": 12,
  "high_risk_count": 4,
  "clauses": [
    {
      "id": "uuid",
      "clause_index": 0,
      "clause_text": "…",
      "category": "Arbitration",
      "risk_score": 5,
      "plain_explanation": "…",
      "risk_reason": "…"
    }
  ]
}
```

### `POST /api/eval/run`
Runs the classifier against labeled clauses and returns evaluation metrics.

Request:
```json
[ { "clause_text": "…", "true_category": "Arbitration", "true_risk_score": 5 } ]
```
Response:
```json
{ "category_accuracy": 0.86, "risk_mae": 0.4, "high_risk_recall": 0.9 }
```

### `GET /api/demo/clause-risk-engine?slug={slug}`
`slug` is one of `spotify | twitter | whatsapp`. Returns the pre-seeded demo document id.
```json
{ "document_id": "uuid" }
```

### `GET /api/health`
Liveness probe → `{ "status": "ok" }`.

## Project structure

```
/app
  /backend            FastAPI app, Alembic migrations, seed script, Dockerfile
  /frontend           React + TypeScript app, Dockerfile
  docker-compose.yml  All 4 services on one network
  railway.json        Railway (backend) deployment config
  Procfile            Backend process definition
  README.md
```
