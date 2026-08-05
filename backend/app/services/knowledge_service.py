import uuid
from fastapi import HTTPException, status

from app.core.logger import logger
from app.knowledge.loader import PDFLoader
from app.knowledge.chunker import TextChunker
from app.knowledge.embeddings import EmbeddingService
from app.knowledge.vector_store import VectorStore
from app.schemas.knowledge import (
    KnowledgeResponse,
    DocumentListResponse,
    DocumentItem,
    DeleteDocumentResponse,
)


class KnowledgeService:

    @staticmethod
    def ingest_pdf(path: str) -> KnowledgeResponse:
        logger.info(f"Knowledge PDF ingestion initiated: Path={path}")

        text = PDFLoader.load(path)

        chunks = TextChunker.chunk(text)

        embeddings = EmbeddingService.encode(chunks)

        for index, (chunk, embedding) in enumerate(zip(chunks, embeddings)):

            VectorStore.collection.add(
                ids=[str(uuid.uuid4())],
                documents=[chunk],
                embeddings=[embedding],
                metadatas=[
                    {
                        "source": path,
                        "chunk_index": index,
                    }
                ],
            )

        logger.info(
            f"Knowledge PDF ingested successfully: Path={path}, Chunks={len(chunks)}"
        )

        return KnowledgeResponse(
            chunks=len(chunks),
            message="Knowledge Base Updated",
        )

    @staticmethod
    def get_documents() -> DocumentListResponse:

        results = VectorStore.collection.get(
            include=["documents", "metadatas"]
        )

        ids = results.get("ids", [])
        documents = results.get("documents", [])
        metadatas = results.get("metadatas", [])

        doc_items: list[DocumentItem] = []

        for i in range(len(ids)):
            doc_text = documents[i] if documents and i < len(documents) else None
            doc_meta = metadatas[i] if metadatas and i < len(metadatas) else None

            doc_items.append(
                DocumentItem(
                    id=ids[i],
                    document=doc_text,
                    metadata=doc_meta,
                )
            )

        return DocumentListResponse(
            documents=doc_items,
            total=len(doc_items),
        )

    @staticmethod
    def delete_document(document_id: str) -> DeleteDocumentResponse:
        logger.info(
            f"Knowledge document/source deletion requested: ID/Source={document_id}"
        )

        # Check if matching by chunk ID
        by_id = VectorStore.collection.get(ids=[document_id])
        if by_id and by_id.get("ids"):
            VectorStore.collection.delete(ids=[document_id])
            logger.info(
                f"Knowledge document deleted successfully: ID/Source={document_id} (matched by chunk ID)"
            )
            return DeleteDocumentResponse(
                message="Document deleted successfully",
                document_id=document_id,
            )

        # Check if matching by source metadata
        by_source = VectorStore.collection.get(where={"source": document_id})
        if by_source and by_source.get("ids"):
            VectorStore.collection.delete(where={"source": document_id})
            logger.info(
                f"Knowledge document deleted successfully: ID/Source={document_id} (matched by source metadata)"
            )
            return DeleteDocumentResponse(
                message="Document deleted successfully",
                document_id=document_id,
            )

        logger.warning(
            f"Knowledge document deletion failed: ID/Source='{document_id}' not found"
        )
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document '{document_id}' not found",
        )