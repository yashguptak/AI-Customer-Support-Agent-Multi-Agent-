from app.services.retrieval_service import RetrievalService


def retrieval_node(state):

    results = RetrievalService.retrieve(
        state["user_query"]
    )

    state["retrieved_context"] = results["context"]

    state["retrieved_sources"] = results["sources"]

    return state