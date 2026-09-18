from typing import Optional, Dict, Any, List
from bson import ObjectId

class UserRepository:
    def __init__(self, db):
        self.db = db

    async def get_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        try:
            doc = await self.db.users.find_one({"_id": ObjectId(user_id)})
        except Exception:
            doc = await self.db.users.find_one({"_id": user_id})
        if doc:
            doc["id"] = str(doc["_id"])
        return doc

    async def get_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        doc = await self.db.users.find_one({"email": email.lower().strip()})
        if doc:
            doc["id"] = str(doc["_id"])
        return doc

    async def create(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        user_data["email"] = user_data["email"].lower().strip()
        result = await self.db.users.insert_one(user_data)
        user_data["id"] = str(result.inserted_id)
        return user_data

    async def list_by_college(self, college_id: str, role: Optional[str] = None) -> List[Dict[str, Any]]:
        query = {"college_id": college_id}
        if role:
            query["role"] = role
        cursor = self.db.users.find(query)
        users = []
        async for doc in cursor:
            doc["id"] = str(doc["_id"])
            doc.pop("password_hash", None)
            users.append(doc)
        return users
