from app.providers.openai_provider import llm


TECHNICAL_PROMPT = """
You are a Senior Technical Support Engineer.

Answer ONLY using the provided documentation.

If the documentation does not contain the answer,
say you cannot find it.
"""


def technical_node(state):

    prompt = f"""
{TECHNICAL_PROMPT}

Documentation:

{state["retrieved_context"]}

Conversation:

{state["conversation_history"]}

Question:

{state["user_query"]}
"""

    response = llm.invoke(prompt)

    state["answer"] = response.content

    return state