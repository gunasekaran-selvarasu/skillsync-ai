from typing import Optional, Dict, Any, List
from bson import ObjectId

class SkillRepository:
    def __init__(self, db):
        self.db = db

    async def list_skills(self) -> List[Dict[str, Any]]:
        cursor = self.db.skills.find({})
        skills = []
        async for doc in cursor:
            doc["id"] = str(doc["_id"])
            skills.append(doc)
        return skills

    async def get_student_skills(self, student_id: str) -> List[Dict[str, Any]]:
        cursor = self.db.student_skills.find({"student_id": student_id})
        skills = []
        async for doc in cursor:
            doc["id"] = str(doc["_id"])
            skills.append(doc)
        return skills

    async def add_student_skill(self, student_id: str, skill_data: Dict[str, Any]) -> Dict[str, Any]:
        skill_data["student_id"] = student_id
        await self.db.student_skills.update_one(
            {"student_id": student_id, "name": skill_data["name"]},
            {"$set": skill_data},
            upsert=True
        )
        return skill_data

class JobRepository:
    def __init__(self, db):
        self.db = db

    async def list_jobs(self, college_id: Optional[str] = None) -> List[Dict[str, Any]]:
        query = {"status": "active"}
        if college_id:
            query["$or"] = [{"college_id": college_id}, {"college_id": None}]
        cursor = self.db.jobs.find(query)
        jobs = []
        async for doc in cursor:
            doc["id"] = str(doc["_id"])
            jobs.append(doc)
        return jobs

    async def create_job(self, job_data: Dict[str, Any]) -> Dict[str, Any]:
        res = await self.db.jobs.insert_one(job_data)
        job_data["id"] = str(res.inserted_id)
        return job_data

class RoadmapRepository:
    def __init__(self, db):
        self.db = db

    async def get_student_roadmap(self, student_id: str) -> Optional[Dict[str, Any]]:
        doc = await self.db.roadmaps.find_one({"student_id": student_id}, sort=[("version", -1)])
        if doc:
            doc["id"] = str(doc["_id"])
        return doc

    async def save_roadmap(self, student_id: str, roadmap_data: Dict[str, Any]) -> Dict[str, Any]:
        roadmap_data["student_id"] = student_id
        await self.db.roadmaps.update_one(
            {"student_id": student_id},
            {"$set": roadmap_data},
            upsert=True
        )
        return roadmap_data
