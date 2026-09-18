from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime, timezone
from pydantic import BaseModel
from backend.app.core.database import get_database
from backend.app.dependencies.auth import get_current_active_admin
from backend.app.core.config import settings

class AIConfigRequest(BaseModel):
    provider: str  # "claude", "ollama"
    model_name: str
    temperature: float = 0.2
    active_prompt_version: str = "v2.4"

router = APIRouter(prefix="/admin", tags=["Admin & TPO Portal"])

@router.get("/users")
async def list_institution_users(
    role: str = None,
    admin_user: dict = Depends(get_current_active_admin),
    db=Depends(get_database)
):
    college_id = admin_user.get("college_id", "col_apex_001")
    query = {"college_id": college_id}
    if role:
        query["role"] = role
    cursor = db.users.find(query).sort("created_at", -1)
    users = []
    async for u in cursor:
        u["id"] = str(u["_id"])
        u.pop("password_hash", None)
        u.pop("_id", None)
        users.append(u)
    return users

@router.get("/colleges")
async def get_college_info(
    admin_user: dict = Depends(get_current_active_admin),
    db=Depends(get_database)
):
    college_id = admin_user.get("college_id", "col_apex_001")
    col = await db.colleges.find_one({"code": "APEX-ENG"})
    if col:
        col["id"] = str(col["_id"])
        col.pop("_id", None)
        return col
    return {
        "name": "Apex Institute of Technology",
        "code": "APEX-ENG",
        "branding": {"primary_color": "#7c3aed", "accent_color": "#10b981"}
    }

@router.get("/audit-logs")
async def get_audit_logs(
    limit: int = 50,
    admin_user: dict = Depends(get_current_active_admin),
    db=Depends(get_database)
):
    college_id = admin_user.get("college_id", "col_apex_001")
    cursor = db.audit_logs.find({"college_id": college_id}).sort("created_at", -1).limit(limit)
    logs = []
    async for l in cursor:
        l["id"] = str(l["_id"])
        l.pop("_id", None)
        logs.append(l)
    return logs

@router.post("/ai-config")
async def update_ai_config(
    req: AIConfigRequest,
    admin_user: dict = Depends(get_current_active_admin),
    db=Depends(get_database)
):
    doc = {
        "college_id": admin_user.get("college_id", "col_apex_001"),
        "provider": req.provider,
        "model_name": req.model_name,
        "temperature": req.temperature,
        "active_prompt_version": req.active_prompt_version,
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    await db.ai_conversations.update_one(
        {"config_type": "global_ai_settings"},
        {"$set": doc},
        upsert=True
    )
    return {"message": "AI Orchestrator configuration updated successfully", "config": doc}
