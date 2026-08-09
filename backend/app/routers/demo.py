from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_session
from app.demo_data import DEMO_SLUGS, demo_source_url
from app.models import Document

router = APIRouter()


@router.get("/demo/clause-risk-engine")
async def demo_clause_risk_engine(
    slug: str,
    session: AsyncSession = Depends(get_session),
):
    if slug not in DEMO_SLUGS:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown demo slug. Available: {', '.join(DEMO_SLUGS)}.",
        )

    result = await session.execute(
        select(Document).where(Document.source_url == demo_source_url(slug))
    )
    document = result.scalars().first()
    if not document:
        raise HTTPException(
            status_code=404,
            detail=f"Demo '{slug}' not seeded yet. Run scripts/seed_demos.py.",
        )

    return {"document_id": document.id}
