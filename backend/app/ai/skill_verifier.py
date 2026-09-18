from typing import Dict, Any, List
from backend.app.ai.orchestrator import ai_orchestrator

SKILL_VERIFICATION_SYSTEM = """You are the SkillSync Skill Verification Engine.
Create an adaptive practical assessment for a claimed skill.
Use conceptual questions, debugging, code analysis, implementation and real-world scenarios.
After submission evaluate correctness, reasoning, problem solving and code quality where applicable.
Return strict, valid JSON matching the schema."""

async def generate_skill_challenge(skill_name: str, level: str = "Intermediate") -> Dict[str, Any]:
    fallback = {
        "skill": skill_name,
        "difficulty": level,
        "challenge_type": "Debugging & Architecture",
        "title": f"{skill_name} Practical Engineering Challenge",
        "description": f"Analyze a realistic scenario involving {skill_name} under high concurrency and identify the bottleneck.",
        "scenario": f"A service utilizing {skill_name} experiences intermittent 504 timeouts during peak traffic bursts. Trace the root cause and propose an optimal fix with code.",
        "sample_starter_code": f"# Starter snippet for {skill_name}\ndef handle_transaction(payload):\n    # TODO: Implement robust handling\n    pass",
        "evaluation_criteria": [
            "Correctness and depth of technical reasoning",
            "Understanding of concurrency / resource cleanup",
            "Clean and idiomatic implementation"
        ]
    }
    
    prompt = f"""You are the SkillSync Skill Verification Engine.
Create an adaptive practical verification challenge for the skill: {skill_name} (Level: {level}).
Return valid JSON:
{{
  "skill": "{skill_name}",
  "difficulty": "{level}",
  "challenge_type": "Debugging & Architecture",
  "title": "string",
  "description": "string",
  "scenario": "string",
  "sample_starter_code": "string",
  "evaluation_criteria": ["string"]
}}
"""
    return await ai_orchestrator.query_llm_json(prompt, SKILL_VERIFICATION_SYSTEM, fallback)

async def evaluate_verification_submission(
    skill_name: str,
    challenge_scenario: str,
    student_submission: str
) -> Dict[str, Any]:
    # Heuristic scoring if offline
    sub_length = len(student_submission.strip())
    score = 75
    if sub_length > 100:
        score += 15
    if any(k in student_submission.lower() for k in ["async", "cache", "index", "pool", "lock", "exception", "try", "catch"]):
        score += 5
    score = min(98, max(50, score))
    
    estimated_level = "Advanced" if score >= 85 else ("Intermediate" if score >= 70 else "Beginner")
    
    fallback = {
        "skill": skill_name,
        "estimated_level": estimated_level,
        "score": score,
        "strengths": [
            "Demonstrates solid grasp of core concepts and execution flow.",
            "Addresses error handling and edge cases thoughtfully.",
            "Code explanation is structured and directly targets the bottleneck."
        ],
        "weaknesses": [
            "Could include explicit telemetry or performance logging.",
            "Benchmarking or unit test assertions could be further detailed."
        ],
        "recommended_next_topics": [
            f"Advanced Distributed Patterns in {skill_name}",
            "Load Testing & Automated Chaos Experiments"
        ]
    }

    prompt = f"""You are the SkillSync Skill Verification Engine.
Evaluate the student's submission for skill: {skill_name}.

CHALLENGE: {challenge_scenario}
STUDENT ANSWER:
{student_submission}

Return valid JSON:
{{
  "skill": "{skill_name}",
  "estimated_level": "Advanced",
  "score": 88,
  "strengths": ["string"],
  "weaknesses": ["string"],
  "recommended_next_topics": ["string"]
}}
"""
    return await ai_orchestrator.query_llm_json(prompt, SKILL_VERIFICATION_SYSTEM, fallback)
