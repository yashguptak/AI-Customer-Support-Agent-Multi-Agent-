import json
from typing import Any, Dict, Optional
from fastapi import APIRouter, Depends, Query, Request, UploadFile, File, HTTPException, status
from fastapi.responses import Response
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.core.dependencies import require_admin
from app.models.user import User
from app.services.admin_service import AdminService
from app.services.knowledge_service import KnowledgeService

router = APIRouter(
    prefix="/api/admin",
    tags=["Admin"],
    dependencies=[Depends(require_admin)]
)


# ==========================================
# DASHBOARD
# ==========================================
@router.get("/dashboard")
def get_admin_dashboard(
    db: Session = Depends(get_db),
):
    return AdminService.get_dashboard_metrics(db)


# ==========================================
# USER MANAGEMENT
# ==========================================
@router.get("/users")
def list_users(
    query: Optional[str] = Query(None),
    role: Optional[str] = Query(None),
    is_active: Optional[bool] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    return AdminService.get_users(
        db, query=query, role=role, is_active=is_active, page=page, limit=limit
    )


@router.get("/users/{user_id}")
def get_user_details(
    user_id: int,
    db: Session = Depends(get_db),
):
    return AdminService.get_user_detail(db, user_id=user_id)


@router.patch("/users/{user_id}/status")
def update_user_status(
    user_id: int,
    payload: Dict[str, Any],
    request: Request,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
):
    is_active = payload.get("is_active")
    if is_active is None:
        raise HTTPException(status_code=400, detail="Field 'is_active' is required")
    ip_address = request.client.host if request.client else None
    return AdminService.update_user_status(
        db, user_id=user_id, is_active=bool(is_active), admin_user=admin_user, ip_address=ip_address
    )


@router.patch("/users/{user_id}/role")
def update_user_role(
    user_id: int,
    payload: Dict[str, Any],
    request: Request,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
):
    role = payload.get("role")
    if not role:
        raise HTTPException(status_code=400, detail="Field 'role' is required")
    ip_address = request.client.host if request.client else None
    return AdminService.update_user_role(
        db, user_id=user_id, new_role=str(role), admin_user=admin_user, ip_address=ip_address
    )


@router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    request: Request,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
):
    ip_address = request.client.host if request.client else None
    return AdminService.delete_user(
        db, user_id=user_id, admin_user=admin_user, ip_address=ip_address
    )


# ==========================================
# TICKET MANAGEMENT
# ==========================================
@router.get("/tickets")
def list_tickets(
    query: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    assigned_to_id: Optional[int] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    return AdminService.get_tickets(
        db,
        query=query,
        status_filter=status,
        priority_filter=priority,
        category_filter=category,
        assigned_to_id=assigned_to_id,
        page=page,
        limit=limit,
    )


@router.patch("/tickets/{ticket_id}")
def update_ticket(
    ticket_id: int,
    payload: Dict[str, Any],
    request: Request,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
):
    ip_address = request.client.host if request.client else None
    return AdminService.update_ticket(
        db,
        ticket_id=ticket_id,
        status_val=payload.get("status"),
        priority_val=payload.get("priority"),
        category_val=payload.get("category"),
        assigned_to_id=payload.get("assigned_to_id"),
        notes=payload.get("notes"),
        admin_user=admin_user,
        ip_address=ip_address,
    )


@router.delete("/tickets/{ticket_id}")
def delete_ticket(
    ticket_id: int,
    request: Request,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
):
    ip_address = request.client.host if request.client else None
    return AdminService.delete_ticket(
        db, ticket_id=ticket_id, admin_user=admin_user, ip_address=ip_address
    )


@router.get("/tickets/{ticket_id}/history")
def get_ticket_history(
    ticket_id: int,
    db: Session = Depends(get_db),
):
    return AdminService.get_ticket_history(db, ticket_id=ticket_id)


# ==========================================
# CHAT MANAGEMENT
# ==========================================
@router.get("/conversations")
def list_conversations(
    query: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    return AdminService.get_conversations(db, query=query, page=page, limit=limit)


@router.get("/conversations/{conversation_id}")
def get_conversation_details(
    conversation_id: int,
    db: Session = Depends(get_db),
):
    return AdminService.get_conversation_detail(db, conversation_id=conversation_id)


@router.post("/conversations/{conversation_id}/takeover")
def takeover_conversation(
    conversation_id: int,
    request: Request,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
):
    ip_address = request.client.host if request.client else None
    return AdminService.takeover_conversation(
        db, conversation_id=conversation_id, admin_user=admin_user, ip_address=ip_address
    )


@router.post("/conversations/{conversation_id}/resume-ai")
def resume_ai_conversation(
    conversation_id: int,
    request: Request,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
):
    ip_address = request.client.host if request.client else None
    return AdminService.resume_ai_conversation(
        db, conversation_id=conversation_id, admin_user=admin_user, ip_address=ip_address
    )


@router.post("/conversations/{conversation_id}/reply")
def admin_reply(
    conversation_id: int,
    payload: Dict[str, Any],
    request: Request,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
):
    message = payload.get("message")
    if not message:
        raise HTTPException(status_code=400, detail="Field 'message' is required")
    ip_address = request.client.host if request.client else None
    return AdminService.admin_reply(
        db,
        conversation_id=conversation_id,
        message_text=str(message),
        admin_user=admin_user,
        ip_address=ip_address,
    )


@router.delete("/conversations/{conversation_id}/messages/{message_id}")
def delete_message(
    conversation_id: int,
    message_id: int,
    request: Request,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
):
    ip_address = request.client.host if request.client else None
    return AdminService.delete_message(
        db, message_id=message_id, admin_user=admin_user, ip_address=ip_address
    )


@router.delete("/conversations/{conversation_id}")
def delete_conversation(
    conversation_id: int,
    request: Request,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
):
    ip_address = request.client.host if request.client else None
    return AdminService.delete_conversation(
        db, conversation_id=conversation_id, admin_user=admin_user, ip_address=ip_address
    )


# ==========================================
# AI CONTROL PANEL
# ==========================================
@router.get("/ai-control")
def get_ai_settings(db: Session = Depends(get_db)):
    return AdminService.get_ai_settings(db)


@router.post("/ai-control")
def update_ai_settings(
    payload: Dict[str, Any],
    request: Request,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
):
    ip_address = request.client.host if request.client else None
    return AdminService.update_ai_settings(
        db, ai_data=payload, admin_user=admin_user, ip_address=ip_address
    )


@router.post("/ai-control/clear-cache")
def clear_vector_cache(
    request: Request,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
):
    ip_address = request.client.host if request.client else None
    return AdminService.clear_vector_cache(db, admin_user=admin_user, ip_address=ip_address)


@router.post("/ai-control/rebuild-embeddings")
def rebuild_embeddings(
    request: Request,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
):
    ip_address = request.client.host if request.client else None
    return AdminService.rebuild_embeddings(db, admin_user=admin_user, ip_address=ip_address)


# ==========================================
# KNOWLEDGE BASE
# ==========================================
@router.get("/knowledge/documents")
def get_knowledge_documents():
    return KnowledgeService.get_uploaded_files()


@router.post("/knowledge/upload")
async def upload_knowledge_file(
    file: UploadFile = File(...),
    request: Request = None,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
):
    res = await KnowledgeService.upload_file(file)
    ip_address = request.client.host if request and request.client else None
    AdminService.log_audit(
        db,
        user_id=admin_user.id,
        action="UPLOAD_KNOWLEDGE_FILE",
        details={"filename": file.filename},
        ip_address=ip_address,
    )
    return res


@router.delete("/knowledge/documents/{filename}")
def delete_knowledge_document(
    filename: str,
    request: Request,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
):
    ip_address = request.client.host if request.client else None
    res = KnowledgeService.delete_file(filename)
    AdminService.log_audit(
        db,
        user_id=admin_user.id,
        action="DELETE_KNOWLEDGE_FILE",
        details={"filename": filename},
        ip_address=ip_address,
    )
    return res


@router.post("/knowledge/reindex")
def reindex_knowledge(
    request: Request,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
):
    ip_address = request.client.host if request.client else None
    return AdminService.rebuild_embeddings(db, admin_user=admin_user, ip_address=ip_address)


# ==========================================
# SYSTEM SETTINGS & BACKUP
# ==========================================
@router.get("/settings")
def get_system_settings(db: Session = Depends(get_db)):
    return AdminService.get_system_settings(db)


@router.post("/settings")
def update_system_settings(
    payload: Dict[str, Any],
    request: Request,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
):
    ip_address = request.client.host if request.client else None
    return AdminService.update_system_settings(
        db, settings_dict=payload, admin_user=admin_user, ip_address=ip_address
    )


@router.post("/settings/backup")
def generate_backup(
    request: Request,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
):
    ip_address = request.client.host if request.client else None
    return AdminService.generate_database_backup(db, admin_user=admin_user, ip_address=ip_address)


# ==========================================
# ANALYTICS & EXPORT
# ==========================================
@router.get("/analytics")
def get_analytics(db: Session = Depends(get_db)):
    return AdminService.get_analytics_deep(db)


@router.get("/analytics/export")
def export_analytics(
    format_type: str = Query("csv", alias="format"),
    db: Session = Depends(get_db),
):
    metrics = AdminService.get_dashboard_metrics(db)
    analytics = AdminService.get_analytics_deep(db)

    if format_type.lower() == "csv":
        csv_data = "Metric,Value\n"
        csv_data += f"Total Users,{metrics['total_users']}\n"
        csv_data += f"Total Tickets,{metrics['total_tickets']}\n"
        csv_data += f"Open Tickets,{metrics['open_tickets']}\n"
        csv_data += f"Closed Tickets,{metrics['closed_tickets']}\n"
        csv_data += f"Avg AI Latency MS,{analytics['average_ai_latency_ms']}\n"
        csv_data += f"Customer Satisfaction %,{analytics['customer_satisfaction_percent']}\n"
        return Response(content=csv_data, media_type="text/csv", headers={"Content-Disposition": "attachment; filename=analytics_export.csv"})

    return {"metrics": metrics, "analytics": analytics}


# ==========================================
# SEARCH, AUDIT LOGS, HEALTH
# ==========================================
@router.get("/search")
def global_search(
    q: str = Query("", alias="q"),
    db: Session = Depends(get_db),
):
    return AdminService.global_search(db, query=q)


@router.get("/audit-logs")
def list_audit_logs(
    page: int = Query(1, ge=1),
    limit: int = Query(30, ge=1, le=100),
    db: Session = Depends(get_db),
):
    return AdminService.get_audit_logs(db, page=page, limit=limit)


@router.get("/system/health")
def get_system_health(db: Session = Depends(get_db)):
    return AdminService.get_system_health(db)
