from app.knowledge.retriever import Retriever


class RetrievalService:

    @staticmethod
    def retrieve(
        query: str,
        k: int = 3,
    ):

        results = Retriever.retrieve(
            query=query,
            k=k,
        )
        print(results)

        docs = results["documents"][0]

        metadata = results["metadatas"][0]

        context = "\n\n".join(docs)

        return {
            "context": context,
            "sources": metadata,
        }