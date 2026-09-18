from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime, timezone
from bson import ObjectId
from backend.app.core.database import get_database
from backend.app.dependencies.auth import get_current_user, get_current_active_student
from backend.app.schemas import VerificationSubmitRequest
from backend.app.ai.skill_engine import calculate_skill_gap_analysis
from backend.app.ai.skill_verifier import generate_skill_challenge, evaluate_verification_submission

router = APIRouter(prefix="/skills", tags=["Skills & Verification"])

@router.get("/")
async def list_skills(db=Depends(get_database)):
    cursor = db.skills.find({"status": "active"})
    skills = []
    async for s in cursor:
        s["id"] = str(s["_id"])
        s.pop("_id", None)
        skills.append(s)
    return skills

@router.get("/gaps")
async def get_skill_gaps(
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

    gap_analysis = calculate_skill_gap_analysis(
        target_career_name=career.get("name", "Full Stack Developer") if career else "Full Stack Developer",
        required_skills=career.get("skill_requirements", []) if career else [],
        student_skills=student_skills,
        verified_skills=verified_skills
    )
    return gap_analysis

@router.post("/verify")
async def request_verification(
    skill_name: str,
    level: str = "Intermediate",
    student_user: dict = Depends(get_current_active_student),
    db=Depends(get_database)
):
    challenge = await generate_skill_challenge(skill_name, level)
    
    challenge_doc = {
        "student_id": student_user["id"],
        "skill_name": skill_name,
        "level": level,
        "challenge": challenge,
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    res = await db.skill_verifications.insert_one(challenge_doc)
    
    challenge_doc["id"] = str(res.inserted_id)
    challenge_doc.pop("_id", None)
    return challenge_doc

@router.post("/verify/submit")
async def submit_verification(
    req: VerificationSubmitRequest,
    student_user: dict = Depends(get_current_active_student),
    db=Depends(get_database)
):
    try:
        verif = await db.skill_verifications.find_one({"_id": ObjectId(req.verification_id)})
    except Exception:
        verif = await db.skill_verifications.find_one({"_id": req.verification_id})
        
    if not verif:
        raise HTTPException(status_code=404, detail="Verification challenge not found")

    skill_name = verif.get("skill_name", "Technical Skill")
    scenario = verif.get("challenge", {}).get("scenario", "")
    
    evaluation = await evaluate_verification_submission(skill_name, scenario, req.answer_text)
    score = evaluation.get("score", 75)
    passed = score >= 70

    await db.skill_verifications.update_one(
        {"_id": verif["_id"]},
        {"$set": {
            "status": "evaluated",
            "score": score,
            "evaluation": evaluation,
            "student_submission": req.answer_text,
            "passed": passed,
            "completed_at": datetime.now(timezone.utc).isoformat()
        }}
    )

    if passed:
        # Add to verified evidence
        await db.skill_evidence.update_one(
            {"student_id": student_user["id"], "skill_name": skill_name},
            {"$set": {
                "student_id": student_user["id"],
                "skill_name": skill_name,
                "source_type": "verification",
                "confidence": 0.95,
                "evidence": f"Passed adaptive engineering challenge with score of {score}%",
                "updated_at": datetime.now(timezone.utc).isoformat()
            }},
            upsert=True
        )
        # Update student skill level
        await db.student_skills.update_one(
            {"student_id": student_user["id"], "name": skill_name},
            {"$set": {
                "student_id": student_user["id"],
                "name": skill_name,
                "current_level": evaluation.get("estimated_level", "Advanced"),
                "status": "verified"
            }},
            upsert=True
        )

    return {
        "skill": skill_name,
        "score": score,
        "passed": passed,
        "evaluation": evaluation
    }
