from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.core.dependencies import get_current_user

from app.models.user import User

from app.schemas.conversation import (
    ConversationCreate,
    ConversationResponse,
)

from app.schemas.message import MessageResponse

from app.services.conversation_service import ConversationService

router = APIRouter(
    prefix="/api/conversations",
    tags=["Conversations"],
)


@router.post(
    "",
    response_model=ConversationResponse,
)
def create_conversation(
    conversation: ConversationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return ConversationService.create_conversation(
        db,
        conversation,
        current_user,
    )


@router.get(
    "/ticket/{ticket_id}",
    response_model=list[ConversationResponse],
)
def get_ticket_conversations(
    ticket_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return ConversationService.get_ticket_conversations(
        db,
        ticket_id,
        current_user,
    )


@router.get(
    "/{conversation_id}",
    response_model=ConversationResponse,
)
def get_conversation(
    conversation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return ConversationService.get_conversation(
        db,
        conversation_id,
        current_user,
    )


@router.get(
    "/{conversation_id}/messages",
    response_model=list[MessageResponse],
)
def get_messages(
    conversation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return ConversationService.get_messages(
        db,
        conversation_id,
        current_user,
    )