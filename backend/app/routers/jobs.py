from fastapi import APIRouter, Depends, HTTPException, status
from datetime import datetime, timezone
from bson import ObjectId
from backend.app.core.database import get_database
from backend.app.dependencies.auth import get_current_user, get_current_active_student, get_current_active_admin
from backend.app.schemas import JobAnalyzeRequest, JobCreateRequest, JobUpdateRequest
from backend.app.ai.job_analyzer import analyze_job_description

router = APIRouter(prefix="/jobs", tags=["Jobs & JD Analyzer"])

@router.get("/")
async def list_jobs(db=Depends(get_database)):
    cursor = db.jobs.find({}).sort("created_at", -1)
    jobs = []
    async for j in cursor:
        j["id"] = str(j["_id"])
        j.pop("_id", None)
        jobs.append(j)
    return jobs

@router.post("/")
async def create_job(
    req: JobCreateRequest,
    admin_user: dict = Depends(get_current_active_admin),
    db=Depends(get_database)
):
    college_id = admin_user.get("college_id", "col_apex_001")
    job_doc = {
        "college_id": college_id,
        "company_name": req.company_name,
        "title": req.title,
        "description": req.description,
        "experience": req.experience,
        "eligibility_min_cgpa": req.eligibility_min_cgpa,
        "required_skills": req.required_skills,
        "preferred_skills": req.preferred_skills,
        "salary_package": req.salary_package or req.package or "10.0 LPA",
        "location": req.location,
        "status": "active",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    res = await db.jobs.insert_one(job_doc)
    job_doc["id"] = str(res.inserted_id)
    job_doc.pop("_id", None)
    return job_doc

@router.put("/{job_id}")
async def update_job(
    job_id: str,
    req: JobUpdateRequest,
    admin_user: dict = Depends(get_current_active_admin),
    db=Depends(get_database)
):
    try:
        job = await db.jobs.find_one({"_id": ObjectId(job_id)})
    except Exception:
        job = await db.jobs.find_one({"_id": job_id})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    update_fields = {}
    if req.company_name is not None:
        update_fields["company_name"] = req.company_name
    if req.title is not None:
        update_fields["title"] = req.title
    if req.description is not None:
        update_fields["description"] = req.description
    if req.experience is not None:
        update_fields["experience"] = req.experience
    if req.eligibility_min_cgpa is not None:
        update_fields["eligibility_min_cgpa"] = req.eligibility_min_cgpa
    if req.required_skills is not None:
        update_fields["required_skills"] = req.required_skills
    if req.preferred_skills is not None:
        update_fields["preferred_skills"] = req.preferred_skills
    if req.salary_package is not None:
        update_fields["salary_package"] = req.salary_package
    elif req.package is not None:
        update_fields["salary_package"] = req.package
    if req.location is not None:
        update_fields["location"] = req.location
    if req.status is not None:
        update_fields["status"] = req.status

    if update_fields:
        update_fields["updated_at"] = datetime.now(timezone.utc).isoformat()
        await db.jobs.update_one({"_id": job["_id"]}, {"$set": update_fields})

    updated = await db.jobs.find_one({"_id": job["_id"]})
    updated["id"] = str(updated["_id"])
    updated.pop("_id", None)
    return updated

@router.delete("/{job_id}")
async def delete_job(
    job_id: str,
    admin_user: dict = Depends(get_current_active_admin),
    db=Depends(get_database)
):
    try:
        job = await db.jobs.find_one({"_id": ObjectId(job_id)})
    except Exception:
        job = await db.jobs.find_one({"_id": job_id})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    await db.jobs.delete_one({"_id": job["_id"]})
    await db.job_matches.delete_many({"job_id": str(job["_id"])})
    return {"message": f"Job {job.get('title')} at {job.get('company_name')} successfully deleted"}

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
