import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from backend.app.core.config import settings
from backend.app.core.database import connect_to_mongo, close_mongo_connection, db_manager
from backend.app.utils.seed_data import seed_database_if_empty

# Routers
from backend.app.routers.auth import router as auth_router
from backend.app.routers.profile import router as profile_router
from backend.app.routers.careers import router as careers_router
from backend.app.routers.assessments import router as assessments_router
from backend.app.routers.resumes import router as resumes_router
from backend.app.routers.jobs import router as jobs_router
from backend.app.routers.skills import router as skills_router
from backend.app.routers.roadmaps import router as roadmaps_router
from backend.app.routers.projects import router as projects_router
from backend.app.routers.interviews import router as interviews_router
from backend.app.routers.analytics import router as analytics_router
from backend.app.routers.placements import router as placements_router
from backend.app.routers.faculty import router as faculty_router
from backend.app.routers.admin import router as admin_router

logger = logging.getLogger("skillsync")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Initializing SkillSync AI backend...")
    await connect_to_mongo()
    await seed_database_if_empty(db_manager.db)
    yield
    # Shutdown
    logger.info("Shutting down SkillSync AI backend...")
    await close_mongo_connection()

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="College Career Intelligence & Placement Readiness Platform REST API",
    version="2.0.0",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static Uploads
if os.path.exists(settings.UPLOAD_DIR):
    app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Mount Routers
api_v1 = settings.API_V1_PREFIX
app.include_router(auth_router, prefix=api_v1)
app.include_router(profile_router, prefix=api_v1)
app.include_router(careers_router, prefix=api_v1)
app.include_router(assessments_router, prefix=api_v1)
app.include_router(resumes_router, prefix=api_v1)
app.include_router(jobs_router, prefix=api_v1)
app.include_router(skills_router, prefix=api_v1)
app.include_router(roadmaps_router, prefix=api_v1)
app.include_router(projects_router, prefix=api_v1)
app.include_router(interviews_router, prefix=api_v1)
app.include_router(analytics_router, prefix=api_v1)
app.include_router(placements_router, prefix=api_v1)
app.include_router(faculty_router, prefix=api_v1)
app.include_router(admin_router, prefix=api_v1)

@app.get("/")
async def root():
    return {
        "platform": "SkillSync AI",
        "version": "2.0.0",
        "status": "online",
        "docs_url": "/docs",
        "api_v1": api_v1
    }

@app.get("/health")
async def health_check():
    db_status = "connected" if db_manager.db is not None else "disconnected"
    return {
        "status": "healthy",
        "database": db_status,
        "mode": "production-ready"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="127.0.0.1", port=8000, reload=True)
