from datetime import datetime
from pydantic import BaseModel, Field


class FeedbackCreate(BaseModel):
    message_id: int
    rating: int = Field(..., ge=1, le=5, description="Rating from 1 to 5")
    comment: str | None = None


class FeedbackResponse(BaseModel):
    id: int
    message_id: int
    rating: int
    comment: str | None = None
    created_at: datetime

    model_config = {
        "from_attributes": True
    }
