from fastapi import APIRouter, Depends, HTTPException, status
from datetime import datetime, timezone
from bson import ObjectId
from backend.app.core.database import get_database
from backend.app.dependencies.auth import get_current_user, get_current_active_student, get_current_active_admin
from backend.app.schemas import PlacementDriveCreate, PlacementDriveUpdate, ApplyDriveRequest

router = APIRouter(prefix="/placements", tags=["Placement Drives"])

@router.get("/drives")
async def list_drives(db=Depends(get_database)):
    cursor = db.placement_drives.find({}).sort("created_at", -1)
    drives = []
    async for d in cursor:
        d["id"] = str(d["_id"])
        d.pop("_id", None)
        drives.append(d)
    return drives

@router.post("/drives")
async def create_drive(
    req: PlacementDriveCreate,
    admin_user: dict = Depends(get_current_active_admin),
    db=Depends(get_database)
):
    college_id = admin_user.get("college_id", "col_apex_001")
    drive_doc = {
        "college_id": college_id,
        "company_name": req.company_name,
        "job_title": req.job_title,
        "description": req.description,
        "min_cgpa": req.min_cgpa,
        "eligible_departments": req.eligible_departments,
        "required_skills": req.required_skills,
        "salary_package": req.salary_package,
        "drive_date": req.drive_date,
        "location": req.location,
        "status": "active",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    res = await db.placement_drives.insert_one(drive_doc)
    drive_doc["id"] = str(res.inserted_id)
    drive_doc.pop("_id", None)
    return drive_doc

@router.put("/drives/{drive_id}")
async def update_drive(
    drive_id: str,
    req: PlacementDriveUpdate,
    admin_user: dict = Depends(get_current_active_admin),
    db=Depends(get_database)
):
    try:
        drive = await db.placement_drives.find_one({"_id": ObjectId(drive_id)})
    except Exception:
        drive = await db.placement_drives.find_one({"_id": drive_id})
    if not drive:
        raise HTTPException(status_code=404, detail="Placement drive not found")

    update_fields = {}
    if req.company_name is not None:
        update_fields["company_name"] = req.company_name
    if req.job_title is not None:
        update_fields["job_title"] = req.job_title
    if req.description is not None:
        update_fields["description"] = req.description
    if req.min_cgpa is not None:
        update_fields["min_cgpa"] = req.min_cgpa
    if req.eligible_departments is not None:
        update_fields["eligible_departments"] = req.eligible_departments
    if req.required_skills is not None:
        update_fields["required_skills"] = req.required_skills
    if req.salary_package is not None:
        update_fields["salary_package"] = req.salary_package
    if req.drive_date is not None:
        update_fields["drive_date"] = req.drive_date
    if req.location is not None:
        update_fields["location"] = req.location
    if req.status is not None:
        update_fields["status"] = req.status

    if update_fields:
        update_fields["updated_at"] = datetime.now(timezone.utc).isoformat()
        await db.placement_drives.update_one({"_id": drive["_id"]}, {"$set": update_fields})

    updated = await db.placement_drives.find_one({"_id": drive["_id"]})
    updated["id"] = str(updated["_id"])
    updated.pop("_id", None)
    return updated

@router.delete("/drives/{drive_id}")
async def delete_drive(
    drive_id: str,
    admin_user: dict = Depends(get_current_active_admin),
    db=Depends(get_database)
):
    try:
        drive = await db.placement_drives.find_one({"_id": ObjectId(drive_id)})
    except Exception:
        drive = await db.placement_drives.find_one({"_id": drive_id})
    if not drive:
        raise HTTPException(status_code=404, detail="Placement drive not found")

    await db.placement_drives.delete_one({"_id": drive["_id"]})
    # Also clean up student applications for this drive
    await db.student_applications.delete_many({"drive_id": str(drive["_id"])})
    return {"message": f"Placement drive for {drive.get('company_name')} successfully deleted"}

@router.post("/drives/{drive_id}/match")
async def match_students_for_drive(
    drive_id: str,
    admin_user: dict = Depends(get_current_active_admin),
    db=Depends(get_database)
):
    try:
        drive = await db.placement_drives.find_one({"_id": ObjectId(drive_id)})
    except Exception:
        drive = await db.placement_drives.find_one({"_id": drive_id})
    if not drive:
        raise HTTPException(status_code=404, detail="Placement drive not found")

    college_id = admin_user.get("college_id", "col_apex_001")
    min_cgpa = drive.get("min_cgpa", 6.0)
    req_skills = set(s.lower() for s in drive.get("required_skills", []))

    students_cursor = db.students.find({"college_id": college_id, "cgpa": {"$gte": min_cgpa}})
    matched_candidates = []

    async for st in students_cursor:
        u = await db.users.find_one({"_id": ObjectId(st["user_id"])}) if ObjectId.is_valid(st["user_id"]) else None
        st_name = u.get("name", "Student") if u else "Student"
        st_email = u.get("email", "") if u else ""

        # Check skills
        sk_cursor = db.student_skills.find({"student_id": st["user_id"]})
        st_skills = [s.get("name", "").lower() async for s in sk_cursor]
        
        overlap = [s for s in req_skills if s in st_skills]
        skill_match_rate = int((len(overlap) / (len(req_skills) or 1)) * 100)

        matched_candidates.append({
            "student_id": st["user_id"],
            "name": st_name,
            "email": st_email,
            "department": st.get("department_name", "CSE"),
            "cgpa": st.get("cgpa"),
            "matching_skills_count": len(overlap),
            "skill_match_percentage": skill_match_rate,
            "is_eligible": st.get("cgpa", 0) >= min_cgpa
        })

    matched_candidates.sort(key=lambda x: (x["skill_match_percentage"], x["cgpa"]), reverse=True)
    return {
        "drive_id": drive_id,
        "company_name": drive.get("company_name"),
        "job_title": drive.get("job_title"),
        "total_eligible_students": len(matched_candidates),
        "candidates": matched_candidates
    }

@router.post("/drives/{drive_id}/apply")
async def apply_for_drive(
    drive_id: str,
    req: ApplyDriveRequest,
    student_user: dict = Depends(get_current_active_student),
    db=Depends(get_database)
):
    try:
        drive = await db.placement_drives.find_one({"_id": ObjectId(drive_id)})
    except Exception:
        drive = await db.placement_drives.find_one({"_id": drive_id})
    if not drive:
        raise HTTPException(status_code=404, detail="Placement drive not found")

    existing = await db.student_applications.find_one({
        "student_id": student_user["id"],
        "drive_id": drive_id
    })
    if existing:
        return {"message": "You have already submitted an application for this placement drive", "status": existing.get("status")}

    app_doc = {
        "student_id": student_user["id"],
        "student_name": student_user.get("name"),
        "drive_id": drive_id,
        "company_name": drive.get("company_name"),
        "job_title": drive.get("job_title"),
        "resume_id": req.resume_id,
        "cover_note": req.cover_note,
        "status": "applied",
        "applied_at": datetime.now(timezone.utc).isoformat()
    }
    await db.student_applications.insert_one(app_doc)

    return {"message": f"Successfully applied for {drive.get('company_name')} - {drive.get('job_title')}", "status": "applied"}

@router.get("/drives/{drive_id}/applications")
async def get_drive_applications(
    drive_id: str,
    admin_user: dict = Depends(get_current_active_admin),
    db=Depends(get_database)
):
    cursor = db.student_applications.find({"drive_id": drive_id}).sort("applied_at", -1)
    apps = []
    async for a in cursor:
        a["id"] = str(a["_id"])
        a.pop("_id", None)
        apps.append(a)
    return apps
