import os
import shutil
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from datetime import datetime, timezone
from bson import ObjectId
from backend.app.core.database import get_database
from backend.app.core.config import settings
from backend.app.dependencies.auth import get_current_active_student
from backend.app.schemas import ResumeBuildRequest
from backend.app.utils.resume_parser import extract_text_from_file
from backend.app.ai.resume_analyzer import analyze_resume_text

router = APIRouter(prefix="/resumes", tags=["Resumes"])

@router.post("/upload")
async def upload_resume(
    file: UploadFile = File(...),
    student_user: dict = Depends(get_current_active_student),
    db=Depends(get_database)
):
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in [".pdf", ".docx", ".doc", ".txt"]:
        raise HTTPException(status_code=400, detail="Only PDF, DOCX, and TXT files are supported")

    saved_filename = f"{student_user['id']}_{int(datetime.now().timestamp())}_{file.filename}"
    file_path = os.path.join(settings.UPLOAD_DIR, saved_filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        extracted_text = extract_text_from_file(file_path)
    except Exception as e:
        extracted_text = f"Extracted summary for {file.filename}"

    resume_doc = {
        "student_id": student_user["id"],
        "title": file.filename,
        "file_path": file_path,
        "file_url": f"/uploads/{saved_filename}",
        "raw_text": extracted_text,
        "status": "uploaded",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    res = await db.resumes.insert_one(resume_doc)
    resume_id = str(res.inserted_id)

    # Automatically trigger initial AI analysis
    student_info = await db.students.find_one({"user_id": student_user["id"]})
    career_name = student_info.get("target_career_name", "Full Stack Developer") if student_info else "Full Stack Developer"
    analysis_result = await analyze_resume_text(extracted_text, career_name)

    await db.resume_analyses.update_one(
        {"resume_id": resume_id},
        {"$set": {
            "resume_id": resume_id,
            "student_id": student_user["id"],
            "career_name": career_name,
            "analysis": analysis_result,
            "created_at": datetime.now(timezone.utc).isoformat()
        }},
        upsert=True
    )

    resume_doc["id"] = resume_id
    resume_doc.pop("_id", None)
    resume_doc["analysis"] = analysis_result

    return resume_doc

@router.get("/")
async def list_resumes(
    student_user: dict = Depends(get_current_active_student),
    db=Depends(get_database)
):
    cursor = db.resumes.find({"student_id": student_user["id"]}).sort("created_at", -1)
    resumes = []
    async for r in cursor:
        r["id"] = str(r["_id"])
        r.pop("_id", None)
        # Check if analysis exists
        analysis = await db.resume_analyses.find_one({"resume_id": r["id"]})
        if analysis:
            r["analysis"] = analysis.get("analysis")
        resumes.append(r)
    return resumes

@router.get("/{resume_id}")
async def get_resume(
    resume_id: str,
    student_user: dict = Depends(get_current_active_student),
    db=Depends(get_database)
):
    try:
        r = await db.resumes.find_one({"_id": ObjectId(resume_id), "student_id": student_user["id"]})
    except Exception:
        r = await db.resumes.find_one({"_id": resume_id, "student_id": student_user["id"]})
    if not r:
        raise HTTPException(status_code=404, detail="Resume not found")

    r["id"] = str(r["_id"])
    r.pop("_id", None)
    analysis = await db.resume_analyses.find_one({"resume_id": resume_id})
    if analysis:
        r["analysis"] = analysis.get("analysis")
    return r

@router.post("/{resume_id}/analyze")
async def analyze_existing_resume(
    resume_id: str,
    student_user: dict = Depends(get_current_active_student),
    db=Depends(get_database)
):
    try:
        r = await db.resumes.find_one({"_id": ObjectId(resume_id), "student_id": student_user["id"]})
    except Exception:
        r = await db.resumes.find_one({"_id": resume_id, "student_id": student_user["id"]})
    if not r:
        raise HTTPException(status_code=404, detail="Resume not found")

    student_info = await db.students.find_one({"user_id": student_user["id"]})
    career_name = student_info.get("target_career_name", "Full Stack Developer") if student_info else "Full Stack Developer"
    text = r.get("raw_text", "")
    
    analysis_result = await analyze_resume_text(text, career_name)

    await db.resume_analyses.update_one(
        {"resume_id": resume_id},
        {"$set": {
            "resume_id": resume_id,
            "student_id": student_user["id"],
            "career_name": career_name,
            "analysis": analysis_result,
            "created_at": datetime.now(timezone.utc).isoformat()
        }},
        upsert=True
    )
    return analysis_result

@router.post("/build")
async def build_resume(
    req: ResumeBuildRequest,
    student_user: dict = Depends(get_current_active_student),
    db=Depends(get_database)
):
    content_text = f"{req.full_name}\n{req.email} | {req.phone}\n\nSummary:\n{req.summary}\n\nSkills:\n{', '.join(req.skills)}\n\nExperience:\n"
    for exp in req.experience:
        content_text += f"{exp.get('title')} at {exp.get('company')}: {exp.get('description')}\n"
    content_text += "\nProjects:\n"
    for p in req.projects:
        content_text += f"{p.get('name')}: {p.get('description')}\n"

    resume_doc = {
        "student_id": student_user["id"],
        "title": req.title,
        "template": req.template,
        "data": req.dict(),
        "raw_text": content_text,
        "status": "builder",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    res = await db.resumes.insert_one(resume_doc)
    resume_id = str(res.inserted_id)

    student_info = await db.students.find_one({"user_id": student_user["id"]})
    career_name = student_info.get("target_career_name", "Full Stack Developer") if student_info else "Full Stack Developer"
    analysis = await analyze_resume_text(content_text, career_name)

    await db.resume_analyses.update_one(
        {"resume_id": resume_id},
        {"$set": {
            "resume_id": resume_id,
            "student_id": student_user["id"],
            "career_name": career_name,
            "analysis": analysis,
            "created_at": datetime.now(timezone.utc).isoformat()
        }},
        upsert=True
    )

    resume_doc["id"] = resume_id
    resume_doc.pop("_id", None)
    resume_doc["analysis"] = analysis
    return resume_doc
