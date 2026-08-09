"""Seed the three demo documents (spotify, twitter, whatsapp) from bundled ToS text.

Usage:
    python -m scripts.seed_demos
Requires GROQ_API_KEY, DATABASE_URL, REDIS_URL to be set (see .env.example).
"""
import asyncio

from app.analysis import analyze
from app.database import SessionLocal
from app.demo_data import DEMO_DOCUMENTS, demo_source_url


async def main() -> None:
    async with SessionLocal() as session:
        for slug, text in DEMO_DOCUMENTS.items():
            document = await analyze(
                session,
                raw_text=text,
                source_url_override=demo_source_url(slug),
            )
            print(f"Seeded demo '{slug}' -> document_id={document.id}")


if __name__ == "__main__":
    asyncio.run(main())
