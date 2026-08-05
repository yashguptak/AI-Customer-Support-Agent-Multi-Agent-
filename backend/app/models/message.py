from datetime import datetime
from enum import Enum

from sqlalchemy import (
    DateTime,
    Enum as SQLEnum,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base


class Sender(str, Enum):
    USER = "USER"
    AI = "AI"
    ADMIN = "ADMIN"


class Message(Base):
    __tablename__ = "messages"

    id: Mapped[int] = mapped_column(primary_key=True)

    conversation_id: Mapped[int] = mapped_column(
        ForeignKey("conversations.id")
    )

    sender: Mapped[Sender] = mapped_column(
        SQLEnum(Sender)
    )

    message: Mapped[str] = mapped_column(Text)

    # ---------- AI Metadata ----------
    model: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    tokens_used: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    latency_ms: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )
    # -------------------------------

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
    )

    conversation = relationship(
        "Conversation",
        back_populates="messages",
    )