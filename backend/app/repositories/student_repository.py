from typing import Optional, Dict, Any, List
from bson import ObjectId

class StudentRepository:
    def __init__(self, db):
        self.db = db

    async def get_by_user_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        doc = await self.db.students.find_one({"user_id": user_id})
        if doc:
            doc["id"] = str(doc["_id"])
        return doc

    async def create(self, student_data: Dict[str, Any]) -> Dict[str, Any]:
        result = await self.db.students.insert_one(student_data)
        student_data["id"] = str(result.inserted_id)
        return student_data

    async def update(self, user_id: str, update_data: Dict[str, Any]) -> bool:
        res = await self.db.students.update_one({"user_id": user_id}, {"$set": update_data})
        return res.modified_count > 0

    async def list_by_department(self, college_id: str, department_id: Optional[str] = None) -> List[Dict[str, Any]]:
        query = {"college_id": college_id}
        if department_id:
            query["department_id"] = department_id
        cursor = self.db.students.find(query)
        students = []
        async for doc in cursor:
            doc["id"] = str(doc["_id"])
            students.append(doc)
        return students
