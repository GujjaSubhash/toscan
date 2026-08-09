import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.analysis import get_document
from app.database import get_session
from app.schemas import DocumentOut

router = APIRouter()


@router.get("/document/{document_id}", response_model=DocumentOut)
async def get_document_endpoint(
    document_id: uuid.UUID,
    session: AsyncSession = Depends(get_session),
):
    document = await get_document(session, document_id)
    if not document:
        raise HTTPException(status_code=404, detail="Document not found.")
    return document
