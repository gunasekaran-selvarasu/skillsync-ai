from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime, timezone
from bson import ObjectId
from backend.app.core.database import get_database
from backend.app.dependencies.auth import get_current_active_student
from backend.app.schemas import TaskStatusUpdateRequest
from backend.app.ai.roadmap_engine import generate_dynamic_roadmap
from backend.app.ai.skill_engine import calculate_skill_gap_analysis

router = APIRouter(prefix="/roadmaps", tags=["Dynamic Roadmaps"])

@router.get("/")
async def get_roadmap(
    student_user: dict = Depends(get_current_active_student),
    db=Depends(get_database)
):
    roadmap = await db.roadmaps.find_one({"student_id": student_user["id"]}, sort=[("version", -1)])
    if not roadmap:
        # Auto-generate if not yet present
        return await generate_new_roadmap(student_user, db)
    roadmap["id"] = str(roadmap["_id"])
    roadmap.pop("_id", None)
    return roadmap

@router.post("/generate")
async def generate_new_roadmap(
    student_user: dict = Depends(get_current_active_student),
    db=Depends(get_database)
):
    student = await db.students.find_one({"user_id": student_user["id"]})
    career_id = student.get("target_career_id") if student else None
    
    career = None
    if career_id:
        try:
            career = await db.careers.find_one({"_id": ObjectId(career_id)})
        except Exception:
            career = await db.careers.find_one({"_id": career_id})
    if not career:
        career = await db.careers.find_one({})

    skills_cursor = db.student_skills.find({"student_id": student_user["id"]})
    student_skills = []
    async for s in skills_cursor:
        student_skills.append(s)

    evidence_cursor = db.skill_evidence.find({"student_id": student_user["id"]})
    verified_skills = []
    async for e in evidence_cursor:
        verified_skills.append(e.get("skill_name"))

    gap_data = calculate_skill_gap_analysis(
        target_career_name=career.get("name", "Full Stack Developer") if career else "Full Stack Developer",
        required_skills=career.get("skill_requirements", []) if career else [],
        student_skills=student_skills,
        verified_skills=verified_skills
    )

    generated = await generate_dynamic_roadmap(
        career_name=gap_data["target_career"],
        missing_skills=gap_data["top_missing"],
        current_skills=[s["name"] for s in student_skills]
    )

    doc = {
        "student_id": student_user["id"],
        "career_id": str(career["_id"]) if career else "",
        "career_name": gap_data["target_career"],
        "version": 1,
        "phases": generated.get("phases", []),
        "status": "active",
        "generated_at": datetime.now(timezone.utc).isoformat()
    }
    res = await db.roadmaps.insert_one(doc)
    doc["id"] = str(res.inserted_id)
    doc.pop("_id", None)
    return doc

@router.put("/task/{task_id}")
async def update_task_status(
    task_id: str,
    req: TaskStatusUpdateRequest,
    student_user: dict = Depends(get_current_active_student),
    db=Depends(get_database)
):
    roadmap = await db.roadmaps.find_one({"student_id": student_user["id"]}, sort=[("version", -1)])
    if not roadmap:
        raise HTTPException(status_code=404, detail="Roadmap not found")

    phases = roadmap.get("phases", [])
    updated = False
    task_skill = None

    for p in phases:
        for t in p.get("tasks", []):
            if t.get("id") == task_id or t.get("skill") == task_id:
                t["status"] = req.status
                updated = True
                task_skill = t.get("skill")
                break

    if not updated:
        raise HTTPException(status_code=404, detail="Task not found in roadmap")

    await db.roadmaps.update_one(
        {"_id": roadmap["_id"]},
        {"$set": {"phases": phases, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )

    # If marked completed, record skill evidence
    if req.status == "completed" and task_skill:
        await db.skill_evidence.update_one(
            {"student_id": student_user["id"], "skill_name": task_skill},
            {"$set": {
                "student_id": student_user["id"],
                "skill_name": task_skill,
                "source_type": "project",
                "confidence": 0.75,
                "evidence": f"Completed roadmap learning milestone task for {task_skill}",
                "updated_at": datetime.now(timezone.utc).isoformat()
            }},
            upsert=True
        )

    return {"message": "Task status updated successfully", "phases": phases}

@router.post("/recalculate")
async def recalculate_roadmap(
    student_user: dict = Depends(get_current_active_student),
    db=Depends(get_database)
):
    # Recalculate and generate new version
    new_roadmap = await generate_new_roadmap(student_user, db)
    return {"message": "Roadmap successfully recalculated based on latest evidence", "roadmap": new_roadmap}
