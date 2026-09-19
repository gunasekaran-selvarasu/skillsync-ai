from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime, timezone
from bson import ObjectId
from backend.app.core.database import get_database
from backend.app.dependencies.auth import get_current_active_faculty
from pydantic import BaseModel

class FacultyFeedbackRequest(BaseModel):
    feedback_text: str
    action_items: list = []

router = APIRouter(prefix="/faculty", tags=["Faculty Portal"])

@router.get("/students")
async def list_assigned_students(
    faculty_user: dict = Depends(get_current_active_faculty),
    db=Depends(get_database)
):
    college_id = faculty_user.get("college_id", "col_apex_001")
    students_cursor = db.students.find({"college_id": college_id})
    students = []
    async for s in students_cursor:
        s["id"] = str(s["_id"])
        s.pop("_id", None)
        u = await db.users.find_one({"_id": ObjectId(s["user_id"])}) if ObjectId.is_valid(s["user_id"]) else None
        s["name"] = u.get("name", "Student") if u else "Student"
        s["email"] = u.get("email", "") if u else ""
        
        # Count verified evidence
        ev_count = await db.skill_evidence.count_documents({"student_id": s["user_id"]})
        s["evidence_count"] = ev_count

        # Latest feedback
        fb = await db.notifications.find_one({"user_id": s["user_id"], "type": "faculty_feedback"}, sort=[("created_at", -1)])
        s["latest_feedback"] = fb.get("message") if fb else "No recent feedback"

        students.append(s)
    return students

@router.get("/students/{student_user_id}")
async def get_student_details(
    student_user_id: str,
    faculty_user: dict = Depends(get_current_active_faculty),
    db=Depends(get_database)
):
    student = await db.students.find_one({"user_id": student_user_id})
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    student["id"] = str(student["_id"])
    student.pop("_id", None)

    u = await db.users.find_one({"_id": ObjectId(student_user_id)}) if ObjectId.is_valid(student_user_id) else None
    student["name"] = u.get("name") if u else "Student"
    student["email"] = u.get("email") if u else ""

    # Skills & Evidence
    skills = []
    async for sk in db.student_skills.find({"student_id": student_user_id}):
        sk["id"] = str(sk["_id"])
        sk.pop("_id", None)
        skills.append(sk)

    evidence = []
    async for ev in db.skill_evidence.find({"student_id": student_user_id}):
        ev["id"] = str(ev["_id"])
        ev.pop("_id", None)
        evidence.append(ev)

    attempts = []
    async for a in db.assessment_attempts.find({"student_id": student_user_id}):
        a["id"] = str(a["_id"])
        a.pop("_id", None)
        attempts.append(a)

    roadmap = await db.roadmaps.find_one({"student_id": student_user_id}, sort=[("version", -1)])
    if roadmap:
        roadmap["id"] = str(roadmap["_id"])
        roadmap.pop("_id", None)

    return {
        "student": student,
        "skills": skills,
        "evidence": evidence,
        "assessment_attempts": attempts,
        "roadmap": roadmap
    }

@router.post("/students/{student_user_id}/feedback")
async def post_student_feedback(
    student_user_id: str,
    req: FacultyFeedbackRequest,
    faculty_user: dict = Depends(get_current_active_faculty),
    db=Depends(get_database)
):
    note_doc = {
        "user_id": student_user_id,
        "from_faculty_name": faculty_user.get("name", "Faculty Mentor"),
        "type": "faculty_feedback",
        "title": "Mentor Feedback from Faculty",
        "message": req.feedback_text,
        "action_items": req.action_items,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.notifications.insert_one(note_doc)
    return {"message": "Feedback recorded and notification dispatched to student"}
