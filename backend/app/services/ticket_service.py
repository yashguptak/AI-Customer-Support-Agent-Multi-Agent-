from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.logger import logger
from app.models.ticket import Ticket
from app.models.user import User
from app.schemas.ticket import TicketCreate, TicketUpdate


class TicketService:

    @staticmethod
    def create_ticket(
        db: Session,
        ticket_data: TicketCreate,
        current_user: User,
    ):
        logger.info(
            f"Ticket creation initiated by user {current_user.email} (ID={current_user.id})"
        )
        ticket = Ticket(
            title=ticket_data.title,
            description=ticket_data.description,
            priority=ticket_data.priority,
            category=ticket_data.category,
            user_id=current_user.id,
        )

        db.add(ticket)
        db.commit()
        db.refresh(ticket)

        logger.info(
            f"Ticket created successfully: ID={ticket.id}, Title='{ticket.title}', Priority={ticket.priority}"
        )

        return ticket

    @staticmethod
    def get_all_tickets(
        db: Session,
        current_user: User,
    ):
        return (
            db.query(Ticket)
            .filter(Ticket.user_id == current_user.id)
            .order_by(Ticket.created_at.desc())
            .all()
        )

    @staticmethod
    def get_ticket_by_id(
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

        return ticket

    @staticmethod
    def update_ticket(
        db: Session,
        ticket: Ticket,
        ticket_data: TicketUpdate,
    ):
        data = ticket_data.model_dump(exclude_unset=True)

        for key, value in data.items():
            setattr(ticket, key, value)

        db.commit()
        db.refresh(ticket)

        return ticket

    @staticmethod
    def delete_ticket(
        db: Session,
        ticket: Ticket,
    ):
        db.delete(ticket)
        db.commit()

        return {"message": "Ticket deleted successfully"}