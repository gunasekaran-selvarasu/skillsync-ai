from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId
from backend.app.core.database import get_database
from backend.app.dependencies.auth import get_current_active_student
from backend.app.schemas import StudentProfileUpdate, SkillAddRequest, StudentProjectCreate

router = APIRouter(prefix="/profile", tags=["Student Profile"])

@router.get("/")
async def get_profile(student_user: dict = Depends(get_current_active_student), db=Depends(get_database)):
    student = await db.students.find_one({"user_id": student_user["id"]})
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")
        
    student["id"] = str(student["_id"])
    student.pop("_id", None)
    student["name"] = student_user.get("name", "Student")
    student["email"] = student_user.get("email", "")
    
    # Skills
    skills_cursor = db.student_skills.find({"student_id": student_user["id"]})
    skills = []
    async for s in skills_cursor:
        s["id"] = str(s["_id"])
        s.pop("_id", None)
        skills.append(s)
    student["skills"] = skills

    # Projects
    proj_cursor = db.student_projects.find({"student_id": student_user["id"]})
    projects = []
    async for p in proj_cursor:
        p["id"] = str(p["_id"])
        p.pop("_id", None)
        projects.append(p)
    student["projects"] = projects

    return student

@router.put("/")
async def update_profile(
    data: StudentProfileUpdate,
    student_user: dict = Depends(get_current_active_student),
    db=Depends(get_database)
):
    update_fields = {k: v for k, v in data.dict().items() if v is not None}
    if not update_fields:
        return {"message": "No updates provided"}
        
    if "name" in update_fields:
        await db.users.update_one({"_id": ObjectId(student_user["id"])}, {"$set": {"name": update_fields.pop("name")}})
        
    if update_fields:
        await db.students.update_one({"user_id": student_user["id"]}, {"$set": update_fields})

    return {"message": "Profile updated successfully"}

@router.post("/skills")
async def add_skill(
    req: SkillAddRequest,
    student_user: dict = Depends(get_current_active_student),
    db=Depends(get_database)
):
    doc = {
        "student_id": student_user["id"],
        "skill_id": req.skill_name.strip(),
        "name": req.skill_name.strip(),
        "category": req.category,
        "self_rating": req.self_rating,
        "current_level": req.current_level,
        "status": "active"
    }
    await db.student_skills.update_one(
        {"student_id": student_user["id"], "name": req.skill_name.strip()},
        {"$set": doc},
        upsert=True
    )
    return {"message": f"Skill '{req.skill_name}' saved to profile", "skill": doc}

@router.post("/projects")
async def add_project(
    req: StudentProjectCreate,
    student_user: dict = Depends(get_current_active_student),
    db=Depends(get_database)
):
    doc = {
        "student_id": student_user["id"],
        "title": req.title,
        "description": req.description,
        "technologies": req.technologies,
        "repository_url": req.repository_url,
        "live_url": req.live_url,
        "progress": 100,
        "status": "completed"
    }
    res = await db.student_projects.insert_one(doc)
    doc["id"] = str(res.inserted_id)
    doc.pop("_id", None)
    return {"message": "Project added successfully", "project": doc}
