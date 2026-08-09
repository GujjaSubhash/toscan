from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.analysis import analyze
from app.database import get_session
from app.rate_limit import limiter
from app.schemas import AnalyzeRequest, AnalyzeResponse

router = APIRouter()


@router.post("/analyze", response_model=AnalyzeResponse)
@limiter.limit("10/hour")
async def analyze_endpoint(
    request: Request,
    body: AnalyzeRequest,
    session: AsyncSession = Depends(get_session),
):
    try:
        document = await analyze(session, url=body.url, raw_text=body.raw_text)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    return AnalyzeResponse(
        document_id=document.id,
        clause_count=document.clause_count or 0,
        high_risk_count=document.high_risk_count or 0,
        overall_risk_score=document.overall_risk_score or 0.0,
    )
