import logging
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from backend.app.core.config import settings

logger = logging.getLogger("skillsync.db")

class DatabaseManager:
    client: AsyncIOMotorClient = None
    db: AsyncIOMotorDatabase = None

db_manager = DatabaseManager()

async def get_database() -> AsyncIOMotorDatabase:
    return db_manager.db

async def connect_to_mongo():
    logger.info(f"Connecting to MongoDB at {settings.MONGODB_URL}...")
    db_manager.client = AsyncIOMotorClient(settings.MONGODB_URL)
    db_manager.db = db_manager.client[settings.DATABASE_NAME]
    logger.info(f"Connected to database '{settings.DATABASE_NAME}'")
    await init_db_indexes()

async def close_mongo_connection():
    if db_manager.client:
        logger.info("Closing MongoDB connection...")
        db_manager.client.close()
        logger.info("MongoDB connection closed.")

async def init_db_indexes():
    """Initializes indexes specified in the MongoDB architecture documentation."""
    db = db_manager.db
    if db is None:
        return
    try:
        # users: { email: 1 } UNIQUE
        await db.users.create_index("email", unique=True)
        
        # students: { user_id: 1 } UNIQUE, { college_id: 1, department_id: 1 }
        await db.students.create_index("user_id", unique=True)
        await db.students.create_index([("college_id", 1), ("department_id", 1)])
        
        # student_skills: { student_id: 1, skill_id: 1 } UNIQUE
        await db.student_skills.create_index([("student_id", 1), ("skill_id", 1)], unique=True)
        
        # skill_evidence: { student_id: 1, skill_id: 1 }
        await db.skill_evidence.create_index([("student_id", 1), ("skill_id", 1)])
        
        # careers: { name: 1 }
        await db.careers.create_index("name")
        
        # career_goals: { student_id: 1, active: 1 }
        await db.career_goals.create_index([("student_id", 1), ("active", 1)])
        
        # assessments: { career_id: 1, skill_id: 1 }
        await db.assessments.create_index([("career_id", 1), ("skill_id", 1)])
        
        # assessment_attempts: { student_id: 1, assessment_id: 1 }
        await db.assessment_attempts.create_index([("student_id", 1), ("assessment_id", 1)])
        
        # resumes: { student_id: 1, created_at: -1 }
        await db.resumes.create_index([("student_id", 1), ("created_at", -1)])
        
        # jobs: { college_id: 1, status: 1 }
        await db.jobs.create_index([("college_id", 1), ("status", 1)])
        
        # job_matches: { student_id: 1, job_id: 1 } UNIQUE
        await db.job_matches.create_index([("student_id", 1), ("job_id", 1)], unique=True)
        
        # skill_gaps: { student_id: 1, priority: 1 }
        await db.skill_gaps.create_index([("student_id", 1), ("priority", 1)])
        
        # roadmaps: { student_id: 1, version: -1 }
        await db.roadmaps.create_index([("student_id", 1), ("version", -1)])
        
        # roadmap_tasks: { roadmap_id: 1, status: 1 }
        await db.roadmap_tasks.create_index([("roadmap_id", 1), ("status", 1)])
        
        # progress: { student_id: 1, updated_at: -1 }
        await db.progress.create_index([("student_id", 1), ("updated_at", -1)])
        
        # placement_drives: { college_id: 1, status: 1 }
        await db.placement_drives.create_index([("college_id", 1), ("status", 1)])
        
        # audit_logs: { college_id: 1, created_at: -1 }
        await db.audit_logs.create_index([("college_id", 1), ("created_at", -1)])
        
        logger.info("MongoDB indexes verified successfully.")
    except Exception as e:
        logger.warning(f"Index initialization note: {e}")
