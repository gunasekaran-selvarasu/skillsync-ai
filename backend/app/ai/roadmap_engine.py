from typing import Dict, Any, List
from datetime import datetime, timezone
from backend.app.ai.orchestrator import ai_orchestrator

ROADMAP_SYSTEM = """You are the SkillSync AI Dynamic Roadmap Engine.
Generate an actionable, phased multi-stage learning and placement roadmap.
Each task must include skill, task, reason, priority, difficulty, estimated effort, prerequisites, expected outcome and verification method.
Return strictly valid JSON."""

async def generate_dynamic_roadmap(
    career_name: str,
    missing_skills: List[str],
    current_skills: List[str],
    timeframe_months: int = 3
) -> Dict[str, Any]:
    gaps = missing_skills or ["Docker Containerization", "AWS Cloud Deployment", "Microservices Architecture", "Automated Testing"]
    
    # Fallback robust structured roadmap
    phases = [
        {
            "phase": 1,
            "title": "Foundations & Critical Skill Closures",
            "focus": "Close high-priority missing skills for placement eligibility",
            "tasks": [
                {
                    "id": "t1",
                    "skill": gaps[0] if len(gaps) > 0 else "Advanced Data Structures",
                    "task": f"Core Mastery & Hands-on Lab: {gaps[0] if len(gaps) > 0 else 'Advanced Data Structures'}",
                    "reason": "Top prerequisite evaluated in initial technical screening rounds.",
                    "priority": "HIGH",
                    "difficulty": "Intermediate",
                    "estimated_effort": "12 hours",
                    "prerequisites": [current_skills[0]] if current_skills else ["Programming Basics"],
                    "expected_outcome": "Demonstrated ability to configure and solve standard real-world challenges.",
                    "verification_method": "Practical Verification Challenge & MCQ Assessment",
                    "status": "in_progress"
                },
                {
                    "id": "t2",
                    "skill": gaps[1] if len(gaps) > 1 else "RESTful API Integration",
                    "task": f"Architecting Modular Services with {gaps[1] if len(gaps) > 1 else 'RESTful API Integration'}",
                    "reason": "Essential for full-stack system interaction and capstone project.",
                    "priority": "HIGH",
                    "difficulty": "Intermediate",
                    "estimated_effort": "10 hours",
                    "prerequisites": ["t1"],
                    "expected_outcome": "Complete working service with unit test coverage.",
                    "verification_method": "Project Repository Submission",
                    "status": "todo"
                }
            ]
        },
        {
            "phase": 2,
            "title": "System Integration & Portfolio Capstone",
            "focus": "Build tangible evidence and project artifacts",
            "tasks": [
                {
                    "id": "t3",
                    "skill": gaps[2] if len(gaps) > 2 else "System Architecture",
                    "task": f"Design and Deploy End-to-End Project featuring {gaps[2] if len(gaps) > 2 else 'System Architecture'}",
                    "reason": "Differentiates candidate resume for Tier-1 companies.",
                    "priority": "MEDIUM",
                    "difficulty": "Advanced",
                    "estimated_effort": "20 hours",
                    "prerequisites": ["t1", "t2"],
                    "expected_outcome": "Public GitHub repo with Docker setup and live demo link.",
                    "verification_method": "Peer & Faculty Review",
                    "status": "todo"
                }
            ]
        },
        {
            "phase": 3,
            "title": "Placement Simulation & Interview Sprints",
            "focus": "Mock interviews, timed assessments, and ATS resume refinement",
            "tasks": [
                {
                    "id": "t4",
                    "skill": "Technical Interview Readiness",
                    "task": "Complete 3 Mock Technical and Coding Sessions under timed conditions",
                    "reason": "Boosts speed and clarity in placement drive interviews.",
                    "priority": "HIGH",
                    "difficulty": "Advanced",
                    "estimated_effort": "8 hours",
                    "prerequisites": ["t3"],
                    "expected_outcome": "Consistently score >= 80% on mock question sets.",
                    "verification_method": "AI Mock Interview Evaluation",
                    "status": "todo"
                }
            ]
        }
    ]

    fallback = {
        "career": career_name,
        "version": 1,
        "timeframe_months": timeframe_months,
        "phases": phases,
        "generated_at": datetime.now(timezone.utc).isoformat()
    }

    prompt = f"""You are the SkillSync AI Dynamic Roadmap Engine.
Generate a structured 3-phase roadmap for a college student aiming for '{career_name}'.
Missing Skills to address: {', '.join(missing_skills)}
Current Skills: {', '.join(current_skills)}

Return valid JSON:
{{
  "career": "{career_name}",
  "version": 1,
  "timeframe_months": {timeframe_months},
  "phases": [
    {{
      "phase": 1,
      "title": "string",
      "focus": "string",
      "tasks": [
        {{
          "id": "t1",
          "skill": "string",
          "task": "string",
          "reason": "string",
          "priority": "HIGH",
          "difficulty": "Intermediate",
          "estimated_effort": "10 hours",
          "prerequisites": ["string"],
          "expected_outcome": "string",
          "verification_method": "string",
          "status": "todo"
        }}
      ]
    }}
  ]
}}
"""
    result = await ai_orchestrator.query_llm_json(prompt, ROADMAP_SYSTEM, fallback)
    if "phases" not in result:
        result["phases"] = phases
    return result
