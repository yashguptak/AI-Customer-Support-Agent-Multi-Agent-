from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.logger import logger
from app.models.conversation import Conversation
from app.models.message import Message, Sender
from app.models.ticket import Ticket
from app.models.user import User
from app.schemas.chat import ChatResponse

from app.services.prompt_builder import PromptBuilder
from app.langgraph.graph import customer_support_graph


class ChatService:

    @staticmethod
    def chat(
        db: Session,
        conversation_id: int,
        message: str,
        current_user: User,
    ) -> ChatResponse:
        logger.info(
            f"Chat request received: ConversationID={conversation_id}, User={current_user.email} (ID={current_user.id})"
        )

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
            logger.warning(
                f"Chat request failed: ConversationID={conversation_id} not found for user {current_user.email}"
            )
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversation not found",
            )

        # Save user message
        user_message = Message(
            conversation_id=conversation.id,
            sender=Sender.USER,
            message=message,
        )

        db.add(user_message)
        db.commit()

        # Load conversation history
        history = (
            db.query(Message)
            .filter(
                Message.conversation_id == conversation.id
            )
            .order_by(Message.created_at.asc())
            .all()
        )

        # Build conversation prompt
        conversation_history = PromptBuilder.build(history)

        # Run LangGraph
        result = customer_support_graph.invoke(
            {
                "user_query": message,
                "conversation_history": conversation_history,
                "retrieved_context": "",
                "retrieved_sources": [],
                "route": "",
                "answer": "",
            }
        )

        reply = result.get("answer", "")

        # Save AI response
        ai_message = Message(
            conversation_id=conversation.id,
            sender=Sender.AI,
            message=reply,
            model=settings.LLM_MODEL,
        )

        db.add(ai_message)
        db.commit()

        logger.info(
            f"Chat response generated successfully: ConversationID={conversation_id}, Reply length={len(reply)} chars"
        )

        return ChatResponse(reply=reply)
