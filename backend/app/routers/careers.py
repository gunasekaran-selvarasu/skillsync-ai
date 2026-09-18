from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId
from backend.app.core.database import get_database
from backend.app.dependencies.auth import get_current_user, get_current_active_student
from backend.app.schemas import CareerSelectRequest, WhatIfRequest
from backend.app.ai.skill_engine import calculate_skill_gap_analysis

router = APIRouter(prefix="/careers", tags=["Careers & What-If"])

@router.get("/")
async def list_careers(db=Depends(get_database)):
    cursor = db.careers.find({})
    careers = []
    async for c in cursor:
        c["id"] = str(c["_id"])
        c.pop("_id", None)
        careers.append(c)
    return careers

@router.get("/{career_id}")
async def get_career(career_id: str, db=Depends(get_database)):
    try:
        c = await db.careers.find_one({"_id": ObjectId(career_id)})
    except Exception:
        c = await db.careers.find_one({"_id": career_id})
    if not c:
        raise HTTPException(status_code=404, detail="Career not found")
    c["id"] = str(c["_id"])
    c.pop("_id", None)
    return c

@router.post("/select")
async def select_target_career(
    req: CareerSelectRequest,
    student_user: dict = Depends(get_current_active_student),
    db=Depends(get_database)
):
    try:
        career = await db.careers.find_one({"_id": ObjectId(req.career_id)})
    except Exception:
        career = await db.careers.find_one({"_id": req.career_id})
    if not career:
        raise HTTPException(status_code=404, detail="Career not found")

    await db.students.update_one(
        {"user_id": student_user["id"]},
        {"$set": {
            "target_career_id": req.career_id,
            "target_career_name": career.get("name")
        }}
    )
    return {"message": f"Target career updated to {career.get('name')}"}

@router.post("/what-if")
async def simulate_what_if_career(
    req: WhatIfRequest,
    student_user: dict = Depends(get_current_active_student),
    db=Depends(get_database)
):
    """
    Career What-If simulation:
    Loads target alternative career, compares student's existing skills and verified evidence,
    and returns transferable skills, missing skills, and estimated transition roadmap.
    """
    try:
        alt_career = await db.careers.find_one({"_id": ObjectId(req.alternative_career_id)})
    except Exception:
        alt_career = await db.careers.find_one({"_id": req.alternative_career_id})
    if not alt_career:
        raise HTTPException(status_code=404, detail="Alternative career not found")

    # Get student current skills
    skills_cursor = db.student_skills.find({"student_id": student_user["id"]})
    student_skills = []
    async for s in skills_cursor:
        student_skills.append(s)

    # Get verified skills
    evidence_cursor = db.skill_evidence.find({"student_id": student_user["id"]})
    verified_skills = []
    async for e in evidence_cursor:
        verified_skills.append(e.get("skill_name"))

    gap_analysis = calculate_skill_gap_analysis(
        target_career_name=alt_career.get("name"),
        required_skills=alt_career.get("skill_requirements", []),
        student_skills=student_skills,
        verified_skills=verified_skills
    )

    transferable_skills = [s["skill"] for s in gap_analysis["skills"] if s["status"] in ["VERIFIED", "ACQUIRED"]]
    missing_skills = [s["skill"] for s in gap_analysis["skills"] if s["status"] == "MISSING"]

    return {
        "current_career": student_user.get("student_profile", {}).get("target_career_name", "Full Stack Developer"),
        "alternative_career": alt_career.get("name"),
        "transition_readiness": gap_analysis["readiness_percentage"],
        "transferable_skills": transferable_skills,
        "missing_skills": missing_skills,
        "skill_breakdown": gap_analysis["skills"],
        "transition_advice": f"You already have {len(transferable_skills)} transferable capabilities ({', '.join(transferable_skills[:3])}). Focusing on {len(missing_skills)} missing skills can qualify you for campus interviews in approximately 6-8 weeks."
    }
