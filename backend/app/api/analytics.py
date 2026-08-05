from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schemas.analytics import AnalyticsOverviewResponse
from app.services.analytics_service import AnalyticsService

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
) -> AnalyticsOverviewResponse:

    return AnalyticsService.get_overview(db=db)
