from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from bson import ObjectId
from backend.app.core.security import decode_token
from backend.app.core.database import get_database

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/signin")

async def get_current_user(token: str = Depends(oauth2_scheme), db=Depends(get_database)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials or token expired",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = decode_token(token)
    if payload is None:
        raise credentials_exception
    user_id: str = payload.get("sub")
    if user_id is None:
        raise credentials_exception
        
    try:
        user = await db.users.find_one({"_id": ObjectId(user_id)})
    except Exception:
        user = await db.users.find_one({"_id": user_id})

    if user is None:
        raise credentials_exception
        
    if user.get("status") == "inactive":
        raise HTTPException(status_code=400, detail="Inactive user")
        
    user["id"] = str(user["_id"])
    return user

async def get_current_active_student(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Operation restricted to student accounts"
        )
    return current_user

async def get_current_active_faculty(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") not in ["faculty", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Operation restricted to faculty accounts"
        )
    return current_user

async def get_current_active_admin(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Operation restricted to administrator / TPO accounts"
        )
    return current_user
