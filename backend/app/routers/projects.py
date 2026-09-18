from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime, timezone
from bson import ObjectId
from backend.app.core.database import get_database
from backend.app.dependencies.auth import get_current_active_student
from backend.app.schemas import ProjectGenerateRequest
from backend.app.ai.project_generator import generate_skill_gap_project
from backend.app.ai.skill_engine import calculate_skill_gap_analysis

router = APIRouter(prefix="/projects", tags=["Projects & Generator"])

@router.get("/recommendations")
async def get_recommended_projects(
    student_user: dict = Depends(get_current_active_student),
    db=Depends(get_database)
):
    student = await db.students.find_one({"user_id": student_user["id"]})
    career_name = student.get("target_career_name", "Full Stack Developer") if student else "Full Stack Developer"

    # Fetch gaps
    skills_cursor = db.student_skills.find({"student_id": student_user["id"]})
    current_skills = [s.get("name") async for s in skills_cursor]

    evidence_cursor = db.skill_evidence.find({"student_id": student_user["id"]})
    verified_skills = [e.get("skill_name") async for e in evidence_cursor]

    # Pre-built curated projects
    projects = [
        {
            "id": "rec_proj_1",
            "title": "High-Throughput Async Notification Microservice",
            "target_career": career_name,
            "difficulty": "Intermediate",
            "estimated_hours": 18,
            "skills_to_learn": ["Docker", "FastAPI", "MongoDB", "Async Queues"],
            "problem_statement": "Campus placement drives look for candidates capable of architecting asynchronous background tasks with zero dropped messages.",
            "features": [
                "FastAPI REST endpoints receiving push notification payloads.",
                "Async task processing worker with exponential retry policies.",
                "MongoDB state tracking with status transitions (queued, sent, failed).",
                "Containerized via Docker Compose with health checks."
            ],
            "portfolio_value": "Addresses the #1 missing cloud & backend competency on candidate resumes."
        },
        {
            "id": "rec_proj_2",
            "title": "Enterprise Role-Based Access Control (RBAC) Gateway",
            "target_career": career_name,
            "difficulty": "Advanced",
            "estimated_hours": 24,
            "skills_to_learn": ["JWT Security", "FastAPI Middleware", "React Security Patterns"],
            "problem_statement": "Secure modern multi-tenant apps require strict authorization enforcement, audit logging, and refresh token rotation.",
            "features": [
                "Cryptographically secure JWT issuance with Argon2id/bcrypt password hashing.",
                "Middleware enforcing object-level authorization and tenant isolation.",
                "React admin dashboard with route guards and permission gates."
            ],
            "portfolio_value": "Demonstrates security engineering fundamentals crucial for enterprise software companies."
        }
    ]
    return projects

@router.post("/generate")
async def generate_project(
    req: ProjectGenerateRequest,
    student_user: dict = Depends(get_current_active_student),
    db=Depends(get_database)
):
    student = await db.students.find_one({"user_id": student_user["id"]})
    career_name = student.get("target_career_name", "Full Stack Developer") if student else "Full Stack Developer"

    skills_cursor = db.student_skills.find({"student_id": student_user["id"]})
    current_skills = [s.get("name") async for s in skills_cursor]

    gap_skills = [req.skill_to_focus] if req.skill_to_focus else ["Docker", "AWS Cloud", "Microservices"]

    project = await generate_skill_gap_project(
        target_career=career_name,
        gap_skills=gap_skills,
        current_skills=current_skills,
        difficulty=req.difficulty or "Intermediate"
    )

    doc = {
        "student_id": student_user["id"],
        "project": project,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.project_recommendations.insert_one(doc)

    return project
