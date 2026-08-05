from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.logger import logger
from app.models.ticket import Ticket
from app.models.conversation import Conversation
from app.models.message import Message
from app.models.user import User
from app.schemas.conversation import ConversationCreate


class ConversationService:

    @staticmethod
    def create_conversation(
        db: Session,
        conversation_data: ConversationCreate,
        current_user: User,
    ):
        logger.info(
            f"Conversation creation initiated by user {current_user.email} (ID={current_user.id}) for ticket ID={conversation_data.ticket_id}"
        )
        ticket = (
            db.query(Ticket)
            .filter(
                Ticket.id == conversation_data.ticket_id,
                Ticket.user_id == current_user.id,
            )
            .first()
        )

        if not ticket:
            logger.warning(
                f"Conversation creation failed: Ticket ID={conversation_data.ticket_id} not found for user {current_user.email}"
            )
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Ticket not found",
            )

        conversation = Conversation(
            ticket_id=ticket.id,
        )

        db.add(conversation)
        db.commit()
        db.refresh(conversation)

        logger.info(
            f"Conversation created successfully: ID={conversation.id}, TicketID={ticket.id}"
        )

        return conversation

    @staticmethod
    def get_ticket_conversations(
        db: Session,
        ticket_id: int,
        current_user: User,
    ):

        ticket = (
            db.query(Ticket)
            .filter(
                Ticket.id == ticket_id,
                Ticket.user_id == current_user.id,
            )
            .first()
        )

        if not ticket:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Ticket not found",
            )

        return (
            db.query(Conversation)
            .filter(
                Conversation.ticket_id == ticket.id
            )
            .order_by(Conversation.created_at.desc())
            .all()
        )

    @staticmethod
    def get_conversation(
        db: Session,
        conversation_id: int,
        current_user: User,
    ):

        conversation = (
            db.query(Conversation)
            .join(Ticket)
            .filter(
                Conversation.id == conversation_id,
                Ticket.user_id == current_user.id,
            )
            .first()
        )

        if not conversation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversation not found",
            )

        return conversation

    @staticmethod
    def get_messages(
        db: Session,
        conversation_id: int,
        current_user: User,
    ):

        conversation = ConversationService.get_conversation(
            db,
            conversation_id,
            current_user,
        )

        return (
            db.query(Message)
            .filter(
                Message.conversation_id == conversation.id
            )
            .order_by(Message.created_at.asc())
            .all()
        )