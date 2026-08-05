from app.knowledge.embeddings import EmbeddingService
from app.knowledge.vector_store import VectorStore


class Retriever:

    @staticmethod
    def retrieve(
        query: str,
        k: int = 3,
    ):

        embedding = EmbeddingService.encode(
            [query]
        )[0]

        results = VectorStore.collection.query(
            query_embeddings=[embedding],
            n_results=k,
        )

        return results