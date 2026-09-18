from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime, timezone
from bson import ObjectId
from backend.app.core.database import get_database
from backend.app.dependencies.auth import get_current_active_student
from backend.app.schemas import InterviewGenerateRequest, InterviewEvaluateRequest
from backend.app.ai.interview_engine import generate_interview_session, evaluate_interview_answer

router = APIRouter(prefix="/interviews", tags=["Interview Prep"])

@router.post("/generate")
async def start_interview(
    req: InterviewGenerateRequest,
    student_user: dict = Depends(get_current_active_student),
    db=Depends(get_database)
):
    student = await db.students.find_one({"user_id": student_user["id"]})
    career_name = student.get("target_career_name", "Full Stack Developer") if student else "Full Stack Developer"

    session = await generate_interview_session(career_name, req.type, req.question_count)
    doc = {
        "student_id": student_user["id"],
        "career_name": career_name,
        "type": req.type,
        "questions": session.get("questions", []),
        "status": "in_progress",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    res = await db.interviews.insert_one(doc)
    doc["id"] = str(res.inserted_id)
    doc.pop("_id", None)
    return doc

@router.post("/evaluate")
async def evaluate_answer(
    req: InterviewEvaluateRequest,
    student_user: dict = Depends(get_current_active_student),
    db=Depends(get_database)
):
    try:
        iv = await db.interviews.find_one({"_id": ObjectId(req.interview_id)})
    except Exception:
        iv = await db.interviews.find_one({"_id": req.interview_id})
    if not iv:
        raise HTTPException(status_code=404, detail="Interview session not found")

    questions = iv.get("questions", [])
    target_q = next((q for q in questions if q.get("id") == req.question_id), None)
    q_text = target_q.get("question") if target_q else "Interview Question"

    eval_result = await evaluate_interview_answer(q_text, req.user_answer, iv.get("career_name", "Software Engineer"))

    # Record attempt
    attempt_doc = {
        "student_id": student_user["id"],
        "interview_id": req.interview_id,
        "question_id": req.question_id,
        "question": q_text,
        "answer": req.user_answer,
        "score": eval_result.get("score", 75),
        "feedback": eval_result,
        "submitted_at": datetime.now(timezone.utc).isoformat()
    }
    await db.interview_attempts.insert_one(attempt_doc)

    return eval_result

@router.get("/history")
async def get_history(
    student_user: dict = Depends(get_current_active_student),
    db=Depends(get_database)
):
    cursor = db.interview_attempts.find({"student_id": student_user["id"]}).sort("submitted_at", -1)
    attempts = []
    async for a in cursor:
        a["id"] = str(a["_id"])
        a.pop("_id", None)
        attempts.append(a)
    return attempts
