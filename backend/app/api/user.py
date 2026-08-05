from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schemas.user import UserCreate, UserResponse
from app.services.user_service import UserService

router = APIRouter(
    prefix="/api/users",
    tags=["Users"]
)


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED
)
def register_user(
    user: UserCreate,
    db: Session = Depends(get_db),
):
    return UserService.create_user(
        db=db,
        user_data=user,
    )

from app.core.dependencies import get_current_user
from app.models.user import User

@router.get("/me")
def get_me(
    current_user: User = Depends(get_current_user),
):
    return current_user