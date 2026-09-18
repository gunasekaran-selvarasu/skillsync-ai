from typing import Dict, Any, List
from backend.app.ai.orchestrator import ai_orchestrator

MASTER_CAREER_AGENT_SYSTEM = """You are SkillSync AI, an AI-powered career development and placement readiness assistant for college students.
Analyze only supplied student data, career requirements and job data.
Output MUST be strict, valid JSON matching the requested schema. Never fabricate evidence."""

async def recommend_next_task(
    student_profile: Dict[str, Any],
    target_career: str,
    current_skills: List[str],
    missing_skills: List[str],
    completed_tasks: List[str]
) -> Dict[str, Any]:
    """
    Implements Section 14: Next Learning Task Prompt
    """
    primary_missing = missing_skills[0] if missing_skills else "System Architecture & Production Deployment"
    fallback = {
        "recommended_skill": primary_missing,
        "task": f"Complete hands-on module and micro-project for {primary_missing}",
        "priority": "HIGH",
        "reason": f"Required by target role '{target_career}' and currently missing from verified evidence.",
        "prerequisites": [s for s in current_skills[:2]],
        "estimated_hours": 8,
        "expected_outcome": f"Build practical mastery in {primary_missing} to close placement eligibility gap.",
        "next_after_completion": ["Practical Verification Challenge", "Milestone Capstone Integration"]
    }

    prompt = f"""You are the SkillSync Next-Step Recommendation Agent.
Select the single most useful next learning task.

Target Career: {target_career}
Current Skills: {', '.join(current_skills)}
Identified Skill Gaps: {', '.join(missing_skills)}
Completed Tasks: {', '.join(completed_tasks)}

Return valid JSON:
{{
  "recommended_skill": "string",
  "task": "string",
  "priority": "HIGH",
  "reason": "string",
  "prerequisites": ["string"],
  "estimated_hours": 8,
  "expected_outcome": "string",
  "next_after_completion": ["string"]
}}
"""
    result = await ai_orchestrator.query_llm_json(prompt, MASTER_CAREER_AGENT_SYSTEM, fallback)
    return result
