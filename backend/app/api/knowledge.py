from pathlib import Path
import shutil

from fastapi import APIRouter, UploadFile, File

from app.schemas.knowledge import (
    KnowledgeResponse,
    DocumentListResponse,
    DeleteDocumentResponse,
)
from app.services.knowledge_service import KnowledgeService

router = APIRouter(
    prefix="/api/knowledge",
    tags=["Knowledge"],
)

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)


@router.post(
    "/upload",
    response_model=KnowledgeResponse,
)
async def upload_pdf(
    file: UploadFile = File(...),
):

    file_path = UPLOAD_DIR / file.filename

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return KnowledgeService.ingest_pdf(
        str(file_path)
    )


@router.get(
    "/documents",
    response_model=DocumentListResponse,
)
def get_documents() -> DocumentListResponse:

    return KnowledgeService.get_documents()


@router.delete(
    "/{document_id}",
    response_model=DeleteDocumentResponse,
)
def delete_document(
    document_id: str,
) -> DeleteDocumentResponse:

    return KnowledgeService.delete_document(
        document_id=document_id
    )
