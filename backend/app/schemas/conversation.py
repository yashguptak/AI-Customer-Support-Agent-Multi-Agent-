from datetime import datetime

from pydantic import BaseModel


class ConversationCreate(BaseModel):
    ticket_id: int


class ConversationResponse(BaseModel):
    id: int
    ticket_id: int
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True
    }