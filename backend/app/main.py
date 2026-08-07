import traceback
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.api.auth import router as auth_router
from app.api.user import router as user_router
from app.api.ticket import router as ticket_router
from app.api.conversation import router as conversation_router
from app.api.chat import router as chat_router
from app.api.knowledge import router as knowledge_router
from app.api.feedback import router as feedback_router
from app.api.analytics import router as analytics_router
from app.api.admin import router as admin_router
from app.api.admin_websocket import router as ws_router
from app.core.logger import logger
from app.database.connection import engine
from app.database.base import Base
import app.models  # Ensure all models are imported

from fastapi.middleware.cors import CORSMiddleware

# Create database tables automatically
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Multi-Agent AI Customer Support",
    version="1.0.0",
    description="Backend API for Multi-Agent AI Customer Support System",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://ai-customer-support-agent-multi-age.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    if exc.status_code >= 500:
        logger.error(
            f"HTTP {exc.status_code} error during {request.method} {request.url.path}: {exc.detail}"
        )
    else:
        logger.warning(
            f"HTTP {exc.status_code} error during {request.method} {request.url.path}: {exc.detail}"
        )
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    logger.warning(
        f"Validation error during {request.method} {request.url.path}: {exc.errors()}"
    )
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors()},
    )


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(
        f"Unhandled exception during {request.method} {request.url.path}: {str(exc)}\n"
        f"{traceback.format_exc()}"
    )
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal Server Error"},
    )


app.include_router(auth_router)
app.include_router(user_router)
app.include_router(ticket_router)
app.include_router(conversation_router)
app.include_router(chat_router)
app.include_router(knowledge_router)
app.include_router(feedback_router)
app.include_router(analytics_router)
app.include_router(admin_router)
app.include_router(ws_router)




@app.get("/")
def root():
    return {
        "message": "Welcome to the Multi-Agent AI Customer Support API!"
    }
