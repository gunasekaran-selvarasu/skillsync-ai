from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from datetime import datetime, timezone
from bson import ObjectId
from pydantic import BaseModel, EmailStr
from backend.app.core.database import get_database
from backend.app.dependencies.auth import get_current_active_admin
from backend.app.core.security import get_password_hash
from backend.app.core.config import settings

class ProvisionUserRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str  # "faculty", "admin", "student"
    department_id: Optional[str] = "dept_cse"
    designation: Optional[str] = None
    employee_code: Optional[str] = None

class UpdateUserRequest(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[str] = None
    status: Optional[str] = None
    password: Optional[str] = None
    roll_number: Optional[str] = None
    cgpa: Optional[float] = None
    graduation_year: Optional[int] = None
    designation: Optional[str] = None
    employee_code: Optional[str] = None

class AIConfigRequest(BaseModel):
    provider: str  # "claude", "ollama"
    model_name: str
    temperature: float = 0.2
    active_prompt_version: str = "v2.4"

router = APIRouter(prefix="/admin", tags=["Admin & TPO Portal"])

@router.post("/users")
async def provision_institution_user(
    req: ProvisionUserRequest,
    admin_user: dict = Depends(get_current_active_admin),
    db=Depends(get_database)
):
    """
    Allows authorized administrators to provision Faculty and Staff accounts.
    """
    clean_email = req.email.lower().strip()
    existing = await db.users.find_one({"email": clean_email})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists in the institution"
        )

    college_id = admin_user.get("college_id", "col_apex_001")
    pwd_hash = get_password_hash(req.password)
    valid_roles = ["faculty", "admin", "student"]
    assigned_role = req.role.lower().strip()
    if assigned_role not in valid_roles:
        raise HTTPException(status_code=400, detail="Role must be faculty, admin, or student")

    user_doc = {
        "college_id": college_id,
        "name": req.name,
        "email": clean_email,
        "password_hash": pwd_hash,
        "role": assigned_role,
        "status": "active",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "last_login": None,
        "provisioned_by": admin_user.get("email")
    }
    user_res = await db.users.insert_one(user_doc)
    user_id = str(user_res.inserted_id)

    if assigned_role == "faculty":
        await db.faculty.insert_one({
            "user_id": user_id,
            "college_id": college_id,
            "department_id": req.department_id or "dept_cse",
            "employee_code": req.employee_code or f"FAC-{user_id[-4:].upper()}",
            "designation": req.designation or "Assistant Professor"
        })

    user_doc["id"] = user_id
    user_doc.pop("password_hash", None)
    user_doc.pop("_id", None)
    return user_doc

@router.put("/users/{user_id}")
async def update_institution_user(
    user_id: str,
    req: UpdateUserRequest,
    admin_user: dict = Depends(get_current_active_admin),
    db=Depends(get_database)
):
    try:
        user = await db.users.find_one({"_id": ObjectId(user_id)})
    except Exception:
        user = await db.users.find_one({"_id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    update_fields = {}
    if req.name is not None and req.name.strip():
        update_fields["name"] = req.name.strip()
    if req.email is not None:
        clean_email = req.email.lower().strip()
        dup = await db.users.find_one({"email": clean_email, "_id": {"$ne": user["_id"]}})
        if dup:
            raise HTTPException(status_code=400, detail="Email already taken by another user")
        update_fields["email"] = clean_email
    if req.role is not None:
        valid_roles = ["student", "faculty", "admin"]
        new_role = req.role.lower().strip()
        if new_role in valid_roles:
            update_fields["role"] = new_role
    if req.status is not None:
        update_fields["status"] = req.status.lower().strip()
    if req.password and req.password.strip():
        update_fields["password_hash"] = get_password_hash(req.password.strip())

    if update_fields:
        update_fields["updated_at"] = datetime.now(timezone.utc).isoformat()
        await db.users.update_one({"_id": user["_id"]}, {"$set": update_fields})

    # Update role-specific records
    target_role = update_fields.get("role", user.get("role"))
    if target_role == "student":
        st_update = {}
        if req.roll_number:
            st_update["roll_number"] = req.roll_number
        if req.cgpa is not None:
            st_update["cgpa"] = req.cgpa
        if req.graduation_year:
            st_update["graduation_year"] = req.graduation_year
        if st_update:
            await db.students.update_one({"user_id": str(user["_id"])}, {"$set": st_update}, upsert=True)
    elif target_role == "faculty":
        fac_update = {}
        if req.designation:
            fac_update["designation"] = req.designation
        if req.employee_code:
            fac_update["employee_code"] = req.employee_code
        if fac_update:
            await db.faculty.update_one({"user_id": str(user["_id"])}, {"$set": fac_update}, upsert=True)

    updated = await db.users.find_one({"_id": user["_id"]})
    updated["id"] = str(updated["_id"])
    updated.pop("password_hash", None)
    updated.pop("_id", None)
    return updated

@router.delete("/users/{user_id}")
async def delete_institution_user(
    user_id: str,
    admin_user: dict = Depends(get_current_active_admin),
    db=Depends(get_database)
):
    try:
        user = await db.users.find_one({"_id": ObjectId(user_id)})
    except Exception:
        user = await db.users.find_one({"_id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Prevent admin from deleting themselves
    if str(user["_id"]) == str(admin_user.get("id")):
        raise HTTPException(status_code=400, detail="Cannot delete your own active administrator account")

    user_oid_str = str(user["_id"])
    await db.users.delete_one({"_id": user["_id"]})
    await db.students.delete_many({"user_id": user_oid_str})
    await db.faculty.delete_many({"user_id": user_oid_str})
    await db.student_skills.delete_many({"student_id": user_oid_str})
    await db.skill_evidence.delete_many({"student_id": user_oid_str})
    await db.roadmaps.delete_many({"student_id": user_oid_str})

    return {"message": f"User {user.get('email')} successfully deleted"}

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
        uid_str = str(u["_id"])
        u["id"] = uid_str
        u.pop("password_hash", None)
        u.pop("_id", None)
        
        # Enrich student details
        if u.get("role") == "student":
            st = await db.students.find_one({"user_id": uid_str})
            if st:
                u["roll_number"] = st.get("roll_number", "")
                u["cgpa"] = st.get("cgpa", 0.0)
                u["graduation_year"] = st.get("graduation_year", 2026)
        elif u.get("role") == "faculty":
            fac = await db.faculty.find_one({"user_id": uid_str})
            if fac:
                u["designation"] = fac.get("designation", "")
                u["employee_code"] = fac.get("employee_code", "")
                
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
