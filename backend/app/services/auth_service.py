from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.login_history import UserLoginHistory
from app.core.security import (
    verify_password,
    create_access_token,
)


class AuthService:

    @staticmethod
    def login(
        db: Session,
        email: str,
        password: str,
        ip_address: str | None = None,
        user_agent: str | None = None,
    ):

        user = (
            db.query(User)
            .filter(User.email == email)
            .first()
        )

        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
            )

        if not verify_password(password, user.password_hash):
            login_hist = UserLoginHistory(
                user_id=user.id,
                ip_address=ip_address,
                user_agent=user_agent,
                status="FAILED",
            )
            db.add(login_hist)
            db.commit()
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
            )

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account is deactivated. Contact administrator.",
            )

        login_hist = UserLoginHistory(
            user_id=user.id,
            ip_address=ip_address,
            user_agent=user_agent,
            status="SUCCESS",
        )
        db.add(login_hist)
        db.commit()

        token = create_access_token(
            {
                "sub": str(user.id),
                "email": user.email,
                "role": user.role,
            }
        )

        return {
            "access_token": token,
            "token_type": "bearer",
        }