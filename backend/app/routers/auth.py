from fastapi import APIRouter, Depends, HTTPException, status
from datetime import datetime, timezone
from bson import ObjectId
from backend.app.core.database import get_database
from backend.app.core.security import verify_password, get_password_hash, create_access_token, create_refresh_token, decode_token
from backend.app.schemas import LoginRequest, RegisterRequest, TokenResponse
from backend.app.dependencies.auth import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/signup", response_model=TokenResponse)
async def signup(req: RegisterRequest, db=Depends(get_database)):
    existing = await db.users.find_one({"email": req.email.lower().strip()})
    if existing:
        raise HTTPException(status_code=400, detail="User with this email already registered")

    # If college_id is not supplied, use default college
    college_id = req.college_id or "col_apex_001"
    
    pwd_hash = get_password_hash(req.password)
    user_doc = {
        "college_id": college_id,
        "name": req.name,
        "email": req.email.lower().strip(),
        "password_hash": pwd_hash,
        "role": req.role,
        "status": "active",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "last_login": datetime.now(timezone.utc).isoformat()
    }
    user_res = await db.users.insert_one(user_doc)
    user_id = str(user_res.inserted_id)

    # If student, create student profile
    if req.role == "student":
        # Get first career as default
        career = await db.careers.find_one({})
        career_id = str(career["_id"]) if career else ""
        career_name = career.get("name", "Full Stack Developer") if career else ""

        await db.students.insert_one({
            "user_id": user_id,
            "college_id": college_id,
            "department_id": req.department_id or "dept_cse",
            "department_name": "Computer Science & Engineering",
            "roll_number": req.roll_number or "CS2026-NEW",
            "academic_year": "Final Year",
            "graduation_year": req.graduation_year or 2026,
            "cgpa": 8.0,
            "target_career_id": career_id,
            "target_career_name": career_name,
            "bio": "Aspiring software professional"
        })

    token_data = {"sub": user_id, "email": user_doc["email"], "role": user_doc["role"], "college_id": college_id}
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)

    user_doc["id"] = user_id
    user_doc.pop("password_hash", None)
    user_doc.pop("_id", None)

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": user_doc
    }

@router.post("/signin", response_model=TokenResponse)
async def signin(req: LoginRequest, db=Depends(get_database)):
    user = await db.users.find_one({"email": req.email.lower().strip()})
    if not user or not verify_password(req.password, user.get("password_hash", "")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
        
    user_id = str(user["_id"])
    await db.users.update_one(
        {"_id": user["_id"]},
        {"$set": {"last_login": datetime.now(timezone.utc).isoformat()}}
    )

    college_id = user.get("college_id", "col_apex_001")
    token_data = {"sub": user_id, "email": user["email"], "role": user["role"], "college_id": college_id}
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)

    user["id"] = user_id
    user.pop("password_hash", None)
    user.pop("_id", None)

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": user
    }

@router.post("/refresh")
async def refresh_token(refresh_token: str, db=Depends(get_database)):
    payload = decode_token(refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid refresh token")
        
    user_id = payload.get("sub")
    try:
        user = await db.users.find_one({"_id": ObjectId(user_id)})
    except Exception:
        user = await db.users.find_one({"_id": user_id})

    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    token_data = {
        "sub": user_id,
        "email": user["email"],
        "role": user["role"],
        "college_id": user.get("college_id", "col_apex_001")
    }
    new_access_token = create_access_token(token_data)
    return {"access_token": new_access_token, "token_type": "bearer"}

@router.post("/logout")
async def logout(current_user: dict = Depends(get_current_user)):
    return {"message": "Logged out successfully"}

@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user), db=Depends(get_database)):
    user_info = current_user.copy()
    if current_user["role"] == "student":
        student = await db.students.find_one({"user_id": current_user["id"]})
        if student:
            student["id"] = str(student["_id"])
            student.pop("_id", None)
            user_info["student_profile"] = student
    return user_info
