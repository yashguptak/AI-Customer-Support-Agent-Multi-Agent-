import chromadb


class VectorStore:

    client = chromadb.PersistentClient(
        path="chroma_db"
    )

    collection = client.get_or_create_collection(
        "support_docs"
    )