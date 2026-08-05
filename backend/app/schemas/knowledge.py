from typing import Any
from pydantic import BaseModel


class KnowledgeResponse(BaseModel):
    chunks: int
    message: str


class DocumentItem(BaseModel):
    id: str
    document: str | None = None
    metadata: dict[str, Any] | None = None


class DocumentListResponse(BaseModel):
    documents: list[DocumentItem]
    total: int


class DeleteDocumentResponse(BaseModel):
    message: str
    document_id: str