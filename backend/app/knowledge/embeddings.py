from sentence_transformers import SentenceTransformer


class EmbeddingService:

    model = SentenceTransformer(
        "all-MiniLM-L6-v2"
    )

    @staticmethod
    def encode(texts):

        return EmbeddingService.model.encode(
            texts
        ).tolist()