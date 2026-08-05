from app.langgraph.prompts import SUPERVISOR_PROMPT
from app.providers.openai_provider import llm


def supervisor_node(state: dict) -> dict:

    prompt = f"""
{SUPERVISOR_PROMPT}

Customer:

{state["user_query"]}
"""

    response = llm.invoke(prompt)
    content = str(response.content).strip().upper()

    for route in ["FAQ", "TECHNICAL", "BILLING", "ESCALATION"]:
        if route in content:
            state["route"] = route
            return state

    state["route"] = "ESCALATION"
    return state
