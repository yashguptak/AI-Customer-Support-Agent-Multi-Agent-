from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.ticket import Ticket, TicketStatus
from app.models.conversation import Conversation
from app.models.message import Message
from app.knowledge.vector_store import VectorStore
from app.schemas.analytics import AnalyticsOverviewResponse


class AnalyticsService:

    @staticmethod
    def get_overview(db: Session) -> AnalyticsOverviewResponse:

        total_users = db.query(func.count(User.id)).scalar() or 0
        total_tickets = db.query(func.count(Ticket.id)).scalar() or 0
        open_tickets = (
            db.query(func.count(Ticket.id))
            .filter(Ticket.status == TicketStatus.OPEN)
            .scalar()
            or 0
        )
        closed_tickets = (
            db.query(func.count(Ticket.id))
            .filter(Ticket.status == TicketStatus.CLOSED)
            .scalar()
            or 0
        )
        total_conversations = (
            db.query(func.count(Conversation.id)).scalar() or 0
        )
        total_messages = db.query(func.count(Message.id)).scalar() or 0

        try:
            knowledge_documents = VectorStore.collection.count()
        except Exception:
            knowledge_documents = 0

        return AnalyticsOverviewResponse(
            total_users=total_users,
            total_tickets=total_tickets,
            open_tickets=open_tickets,
            closed_tickets=closed_tickets,
            total_conversations=total_conversations,
            total_messages=total_messages,
            knowledge_documents=knowledge_documents,
        )
