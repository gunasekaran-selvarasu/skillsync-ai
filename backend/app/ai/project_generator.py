from typing import Dict, Any, List
from backend.app.ai.orchestrator import ai_orchestrator

PROJECT_GENERATOR_SYSTEM = """You are the SkillSync AI Project Generator.
Generate a project that closes identified skill gaps and aligns with the target career and current skill level.
Avoid projects that merely repeat strongly demonstrated skills.
Return strict, valid JSON matching the schema."""

async def generate_skill_gap_project(
    target_career: str,
    gap_skills: List[str],
    current_skills: List[str],
    difficulty: str = "Intermediate"
) -> Dict[str, Any]:
    primary_gap = gap_skills[0] if gap_skills else "Microservices & Cloud"
    second_gap = gap_skills[1] if len(gap_skills) > 1 else "Docker & CI/CD"
    
    fallback = {
        "title": f"Production-Grade Cloud Microservice with {primary_gap}",
        "problem_statement": f"College placement applicants need demonstrable real-world mastery in {primary_gap} and {second_gap} beyond academic toy examples.",
        "difficulty": difficulty,
        "estimated_hours": 24,
        "technologies": [primary_gap, second_gap, "FastAPI", "MongoDB", "Pytest"],
        "skills_to_learn": [primary_gap, second_gap, "Containerization", "Automated Testing"],
        "features": [
            f"Full CRUD REST API endpoints with robust {primary_gap} integration.",
            "Asynchronous processing queue with retry semantics.",
            "Docker Compose multi-container setup with database persistence.",
            "Automated integration test suite with >80% coverage."
        ],
        "milestones": [
            {"phase": 1, "title": "Architecture Design & Schema Setup", "duration_hours": 6},
            {"phase": 2, "title": f"Core Business Logic & {primary_gap} Implementation", "duration_hours": 10},
            {"phase": 3, "title": "Dockerization, Unit Tests & CI Pipeline", "duration_hours": 8}
        ],
        "expected_outcome": "A deployment-ready GitHub repository with comprehensive README, architectural diagrams, and Dockerized run instructions.",
        "portfolio_value": f"Demonstrates verified ability to build and deploy {primary_gap}-backed production workflows, a top filter for tier-1 campus hiring."
    }

    prompt = f"""You are the SkillSync AI Project Generator.
Target Career: {target_career}
Identified Skill Gaps to Close: {', '.join(gap_skills)}
Current Demonstrated Skills: {', '.join(current_skills)}
Requested Difficulty: {difficulty}

Return valid JSON:
{{
  "title": "string",
  "problem_statement": "string",
  "difficulty": "{difficulty}",
  "estimated_hours": 24,
  "technologies": ["string"],
  "skills_to_learn": ["string"],
  "features": ["string"],
  "milestones": [
    {{
      "phase": 1,
      "title": "string",
      "duration_hours": 6
    }}
  ],
  "expected_outcome": "string",
  "portfolio_value": "string"
}}
"""
    result = await ai_orchestrator.query_llm_json(prompt, PROJECT_GENERATOR_SYSTEM, fallback)
    return result
