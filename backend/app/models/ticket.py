from enum import Enum
from datetime import datetime
from sqlalchemy import String, Text, DateTime, ForeignKey, Enum as SqlEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base


class TicketStatus(str, Enum):
    OPEN = "OPEN"
    IN_PROGRESS = "IN_PROGRESS"
    RESOLVED = "RESOLVED"
    CLOSED = "CLOSED"


class TicketPriority(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    URGENT = "URGENT"


class TicketCategory(str, Enum):
    TECHNICAL = "TECHNICAL"
    BILLING = "BILLING"
    ACCOUNT = "ACCOUNT"
    GENERAL = "GENERAL"


class Ticket(Base):
    __tablename__ = "tickets"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    title: Mapped[str] = mapped_column(String(200), nullable=False)

    description: Mapped[str] = mapped_column(Text, nullable=False)

    status: Mapped[TicketStatus] = mapped_column(
        SqlEnum(TicketStatus),
        default=TicketStatus.OPEN
    )

    priority: Mapped[TicketPriority] = mapped_column(
        SqlEnum(TicketPriority),
        default=TicketPriority.MEDIUM
    )

    category: Mapped[TicketCategory] = mapped_column(
        SqlEnum(TicketCategory),
        default=TicketCategory.GENERAL
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id")
    )

    assigned_to_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id"),
        nullable=True,
    )

    user = relationship("User", foreign_keys=[user_id], back_populates="tickets")
    assigned_to = relationship(
    "User",
    foreign_keys=[assigned_to_id],
    back_populates="assigned_tickets",
    )

    conversations = relationship(
        "Conversation",
        back_populates="ticket",
        cascade="all, delete-orphan",
    )