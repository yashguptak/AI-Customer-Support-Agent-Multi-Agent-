from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schemas.feedback import FeedbackCreate, FeedbackResponse
from app.services.feedback_service import FeedbackService

router = APIRouter(
    prefix="/api/feedback",
    tags=["Feedback"],
)


@router.post(
    "",
    response_model=FeedbackResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_feedback(
    feedback_in: FeedbackCreate,
    db: Session = Depends(get_db),
) -> FeedbackResponse:

    return FeedbackService.create_feedback(
        db=db,
        feedback_in=feedback_in,
    )
