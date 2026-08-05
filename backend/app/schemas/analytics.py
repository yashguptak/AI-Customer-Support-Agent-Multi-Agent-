from pydantic import BaseModel


class AnalyticsOverviewResponse(BaseModel):
    total_users: int
    total_tickets: int
    open_tickets: int
    closed_tickets: int
    total_conversations: int
    total_messages: int
    knowledge_documents: int
