import logging
import sys
from datetime import datetime, timezone
from typing import Optional, Dict, Any

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] [%(name)s]: %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)]
)

logger = logging.getLogger("skillsync")

async def record_audit_log(
    db,
    college_id: Optional[str],
    user_id: Optional[str],
    action: str,
    resource: str,
    resource_id: Optional[str] = None,
    metadata: Optional[Dict[str, Any]] = None
):
    """Records an administrative or sensitive action into the audit_logs collection."""
    if db is None:
        return
    try:
        log_doc = {
            "college_id": college_id,
            "user_id": user_id,
            "action": action,
            "resource": resource,
            "resource_id": resource_id,
            "metadata": metadata or {},
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.audit_logs.insert_one(log_doc)
    except Exception as e:
        logger.error(f"Failed to record audit log: {e}")
