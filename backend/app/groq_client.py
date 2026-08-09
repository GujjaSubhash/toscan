import json

import httpx

from app.config import GROQ_API_KEY, GROQ_BASE_URL, GROQ_MODEL
from app.schemas import ClauseAnalysis

SYSTEM_PROMPT = (
    "You are a legal risk analyst. Analyze the following Terms of Service clause. "
    "Return ONLY valid JSON: { category: one of [Data Collection, Data Sharing, "
    "User Rights, Liability, Termination, Arbitration, Content Ownership, Payment, "
    "Other], risk_score: integer 1-5 where 1=safe 5=very risky, plain_explanation: "
    "2-3 sentence plain English explanation, risk_reason: 1 sentence why this score }"
)


async def analyze_clause(client: httpx.AsyncClient, clause_text: str) -> ClauseAnalysis:
    payload = {
        "model": GROQ_MODEL,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": clause_text},
        ],
        "temperature": 0,
        "response_format": {"type": "json_object"},
    }
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json",
    }

    resp = await client.post(GROQ_BASE_URL, json=payload, headers=headers, timeout=60.0)
    resp.raise_for_status()
    content = resp.json()["choices"][0]["message"]["content"]
    data = json.loads(content)
    return ClauseAnalysis(**data)
