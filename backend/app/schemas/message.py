from datetime import datetime

from pydantic import BaseModel

from app.models.message import Sender


class MessageCreate(BaseModel):
    message: str


class MessageResponse(BaseModel):
    id: int
    sender: Sender
    message: str

    model: str | None = None
    tokens_used: int | None = None
    latency_ms: int | None = None

    created_at: datetime

    model_config = {
        "from_attributes": True
    }