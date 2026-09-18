from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime, timezone
from bson import ObjectId
from backend.app.core.database import get_database
from backend.app.dependencies.auth import get_current_active_student
from backend.app.schemas import SubmitAssessmentRequest

router = APIRouter(prefix="/assessments", tags=["Assessments"])

@router.get("/")
async def list_assessments(db=Depends(get_database)):
    cursor = db.assessments.find({})
    assessments = []
    async for a in cursor:
        a["id"] = str(a["_id"])
        a.pop("_id", None)
        # Hide answers from listing
        if "questions" in a:
            for q in a["questions"]:
                q.pop("correct_index", None)
                q.pop("explanation", None)
        assessments.append(a)
    return assessments

@router.post("/{assessment_id}/start")
async def start_assessment(
    assessment_id: str,
    student_user: dict = Depends(get_current_active_student),
    db=Depends(get_database)
):
    try:
        a = await db.assessments.find_one({"_id": ObjectId(assessment_id)})
    except Exception:
        a = await db.assessments.find_one({"_id": assessment_id})
    if not a:
        raise HTTPException(status_code=404, detail="Assessment not found")

    attempt_doc = {
        "student_id": student_user["id"],
        "assessment_id": assessment_id,
        "assessment_title": a.get("title"),
        "status": "in_progress",
        "started_at": datetime.now(timezone.utc).isoformat(),
        "score": None
    }
    res = await db.assessment_attempts.insert_one(attempt_doc)
    
    questions = a.get("questions", [])
    sanitized_questions = []
    for q in questions:
        q_copy = q.copy()
        q_copy.pop("correct_index", None)
        q_copy.pop("explanation", None)
        sanitized_questions.append(q_copy)

    return {
        "attempt_id": str(res.inserted_id),
        "assessment_title": a.get("title"),
        "duration_minutes": a.get("duration_minutes", 30),
        "questions": sanitized_questions
    }

@router.post("/{assessment_id}/submit")
async def submit_assessment(
    assessment_id: str,
    req: SubmitAssessmentRequest,
    student_user: dict = Depends(get_current_active_student),
    db=Depends(get_database)
):
    try:
        a = await db.assessments.find_one({"_id": ObjectId(assessment_id)})
    except Exception:
        a = await db.assessments.find_one({"_id": assessment_id})
    if not a:
        raise HTTPException(status_code=404, detail="Assessment not found")

    questions = a.get("questions", [])
    correct_count = 0
    feedback_details = []

    for q in questions:
        qid = q.get("id")
        user_choice = req.answers.get(qid)
        correct_idx = q.get("correct_index", 0)
        is_correct = (user_choice == correct_idx)
        if is_correct:
            correct_count += 1
        feedback_details.append({
            "question_id": qid,
            "question": q.get("question"),
            "user_choice": user_choice,
            "correct_choice": correct_idx,
            "is_correct": is_correct,
            "explanation": q.get("explanation", "")
        })

    total = len(questions) or 1
    score_percentage = int((correct_count / total) * 100)
    passed = score_percentage >= 60

    try:
        await db.assessment_attempts.update_one(
            {"_id": ObjectId(req.attempt_id)},
            {"$set": {
                "status": "completed",
                "score": score_percentage,
                "passed": passed,
                "submitted_at": datetime.now(timezone.utc).isoformat()
            }}
        )
    except Exception:
        pass

    # If passed, store skill evidence in DB
    if passed:
        skill_name = "Full Stack Core" if "Full Stack" in a.get("title", "") else "Backend Engineering"
        await db.skill_evidence.insert_one({
            "student_id": student_user["id"],
            "skill_name": skill_name,
            "source_type": "assessment",
            "source_id": assessment_id,
            "confidence": 0.85,
            "evidence": f"Scored {score_percentage}% on assessment '{a.get('title')}'",
            "created_at": datetime.now(timezone.utc).isoformat()
        })

    return {
        "assessment_title": a.get("title"),
        "total_questions": total,
        "correct_answers": correct_count,
        "score_percentage": score_percentage,
        "passed": passed,
        "details": feedback_details
    }

@router.get("/attempts")
async def get_attempts(
    student_user: dict = Depends(get_current_active_student),
    db=Depends(get_database)
):
    cursor = db.assessment_attempts.find({"student_id": student_user["id"]}).sort("started_at", -1)
    attempts = []
    async for att in cursor:
        att["id"] = str(att["_id"])
        att.pop("_id", None)
        attempts.append(att)
    return attempts
