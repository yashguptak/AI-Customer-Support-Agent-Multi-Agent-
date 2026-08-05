from app.providers.openai_provider import llm


BILLING_PROMPT = """
You are a Billing Support Specialist.

Handle:

Refunds

Invoices

Subscriptions

Payments

Taxes

Never answer technical questions.
"""


def billing_node(state):

    prompt = f"""
{BILLING_PROMPT}

Customer:

{state["user_query"]}
"""

    response = llm.invoke(prompt)

    state["answer"] = response.content

    return state