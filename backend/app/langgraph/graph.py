from langgraph.graph import StateGraph, START, END

from app.langgraph.state import GraphState
from app.langgraph.supervisor import supervisor_node
from app.langgraph.faq_agent import faq_node
from app.langgraph.technical_agent import technical_node
from app.langgraph.billing_agent import billing_node
from app.langgraph.escalation_agent import escalation_node
from app.langgraph.retrieval_node import retrieval_node
from app.langgraph.citation_node import citation_node

workflow = StateGraph(GraphState)

workflow.add_node("supervisor", supervisor_node)
workflow.add_node("faq", faq_node)
workflow.add_node("technical", technical_node)
workflow.add_node("billing", billing_node)
workflow.add_node("escalation", escalation_node)
workflow.add_node("retrieval", retrieval_node)
workflow.add_node("citation", citation_node)


def router(state: GraphState) -> str:
    route = state.get("route", "").strip().upper()

    routes = {
        "FAQ": "faq",
        "TECHNICAL": "retrieval",
        "BILLING": "billing",
        "ESCALATION": "escalation",
    }

    return routes.get(route, "escalation")


workflow.add_edge(START, "supervisor")

workflow.add_conditional_edges(
    "supervisor",
    router,
)

workflow.add_edge("faq", END)
workflow.add_edge("billing", END)
workflow.add_edge("escalation", END)
workflow.add_edge("retrieval", "technical")
workflow.add_edge("technical", "citation")
workflow.add_edge("citation", END)

customer_support_graph = workflow.compile()