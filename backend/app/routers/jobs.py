from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId
from backend.app.core.database import get_database
from backend.app.dependencies.auth import get_current_user, get_current_active_student
from backend.app.schemas import JobAnalyzeRequest
from backend.app.ai.job_analyzer import analyze_job_description

router = APIRouter(prefix="/jobs", tags=["Jobs & JD Analyzer"])

@router.get("/")
async def list_jobs(db=Depends(get_database)):
    cursor = db.jobs.find({"status": "active"})
    jobs = []
    async for j in cursor:
        j["id"] = str(j["_id"])
        j.pop("_id", None)
        jobs.append(j)
    return jobs

@router.post("/analyze")
async def analyze_jd(
    req: JobAnalyzeRequest,
    student_user: dict = Depends(get_current_active_student),
    db=Depends(get_database)
):
    skills_cursor = db.student_skills.find({"student_id": student_user["id"]})
    skills = []
    async for s in skills_cursor:
        skills.append(s.get("name", ""))

    result = await analyze_job_description(
        job_description=req.job_description,
        job_title=req.job_title or "Software Developer",
        student_skills=skills
    )
    return result

@router.get("/{job_id}/match")
async def match_job_with_student(
    job_id: str,
    student_user: dict = Depends(get_current_active_student),
    db=Depends(get_database)
):
    try:
        job = await db.jobs.find_one({"_id": ObjectId(job_id)})
    except Exception:
        job = await db.jobs.find_one({"_id": job_id})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    skills_cursor = db.student_skills.find({"student_id": student_user["id"]})
    student_skills = []
    async for s in skills_cursor:
        student_skills.append(s.get("name", ""))

    job_desc = job.get("description", "") + " " + " ".join(job.get("required_skills", []))
    match_result = await analyze_job_description(
        job_description=job_desc,
        job_title=job.get("title", ""),
        student_skills=student_skills
    )

    # Cache job match
    await db.job_matches.update_one(
        {"student_id": student_user["id"], "job_id": job_id},
        {"$set": {
            "student_id": student_user["id"],
            "job_id": job_id,
            "match_score": match_result.get("overall_match_score", 70),
            "analysis": match_result
        }},
        upsert=True
    )

    return {
        "job_id": job_id,
        "company_name": job.get("company_name"),
        "title": job.get("title"),
        "salary_package": job.get("salary_package"),
        "match": match_result
    }
