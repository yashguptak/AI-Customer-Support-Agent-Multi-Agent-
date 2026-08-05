from app.providers.openai_provider import llm


FAQ_PROMPT = """
You are a Customer Support FAQ specialist.

Answer only general questions.

If the question requires technical troubleshooting,
billing information, or account changes,
reply exactly:

ESCALATE
"""


def faq_node(state):

    prompt = f"""
{FAQ_PROMPT}

Customer:
{state["user_query"]}
"""

    response = llm.invoke(prompt)

    state["answer"] = response.content

    return state