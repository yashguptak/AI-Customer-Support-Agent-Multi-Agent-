from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.feedback import Feedback
from app.models.message import Message
from app.schemas.feedback import FeedbackCreate, FeedbackResponse


class FeedbackService:

    @staticmethod
    def create_feedback(
        db: Session,
        feedback_in: FeedbackCreate,
    ) -> FeedbackResponse:

        message = (
            db.query(Message)
            .filter(Message.id == feedback_in.message_id)
            .first()
        )

        if not message:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Message with ID {feedback_in.message_id} not found",
            )

        feedback = Feedback(
            message_id=feedback_in.message_id,
            rating=feedback_in.rating,
            comment=feedback_in.comment,
        )

        db.add(feedback)
        db.commit()
        db.refresh(feedback)

        return FeedbackResponse.model_validate(feedback)
