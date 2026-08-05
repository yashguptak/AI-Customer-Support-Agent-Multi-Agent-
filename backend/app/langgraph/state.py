from typing import TypedDict


class GraphState(TypedDict):

    user_query: str

    conversation_history: str

    retrieved_context: str

    retrieved_sources: list

    route: str

    answer: str