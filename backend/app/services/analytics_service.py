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
    def get_overview(
        db: Session,
        current_user: User,
    ) -> AnalyticsOverviewResponse:

        # -----------------------------------------
        # Global statistics
        # -----------------------------------------

        total_users = (
            db.query(func.count(User.id)).scalar() or 0
        )

        # -----------------------------------------
        # Current user's tickets
        # -----------------------------------------

        user_tickets = (
            db.query(Ticket)
            .filter(Ticket.user_id == current_user.id)
        )

        total_tickets = (
            user_tickets.with_entities(
                func.count(Ticket.id)
            ).scalar() or 0
        )

        open_tickets = (
            user_tickets
            .filter(Ticket.status == TicketStatus.OPEN)
            .with_entities(func.count(Ticket.id))
            .scalar()
            or 0
        )

        closed_tickets = (
            user_tickets
            .filter(Ticket.status == TicketStatus.CLOSED)
            .with_entities(func.count(Ticket.id))
            .scalar()
            or 0
        )

        # -----------------------------------------
        # Current user's conversations
        #
        # Conversation belongs to a Ticket,
        # and Ticket belongs to the user.
        # -----------------------------------------

        total_conversations = (
            db.query(func.count(Conversation.id))
            .join(
                Ticket,
                Conversation.ticket_id == Ticket.id
            )
            .filter(
                Ticket.user_id == current_user.id
            )
            .scalar()
            or 0
        )

        # -----------------------------------------
        # Messages belonging to user's conversations
        # -----------------------------------------

        total_messages = (
            db.query(func.count(Message.id))
            .join(
                Conversation,
                Message.conversation_id == Conversation.id
            )
            .join(
                Ticket,
                Conversation.ticket_id == Ticket.id
            )
            .filter(
                Ticket.user_id == current_user.id
            )
            .scalar()
            or 0
        )

        # -----------------------------------------
        # Knowledge base is global
        # -----------------------------------------

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