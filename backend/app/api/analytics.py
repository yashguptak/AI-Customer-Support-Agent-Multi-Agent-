from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schemas.analytics import AnalyticsOverviewResponse
from app.services.analytics_service import AnalyticsService
from app.models.user import User

# Use the SAME get_current_user import used by your other protected routes
from app.core.dependencies import get_current_user


router = APIRouter(
    prefix="/api/analytics",
    tags=["Analytics"],
)


@router.get(
    "",
    response_model=AnalyticsOverviewResponse,
)
def get_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> AnalyticsOverviewResponse:

    return AnalyticsService.get_overview(
        db=db,
        current_user=current_user,
    )
