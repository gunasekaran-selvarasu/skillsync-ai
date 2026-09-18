from typing import Dict, Any, List
from backend.app.ai.orchestrator import ai_orchestrator

INTERVIEW_SYSTEM = """You are the SkillSync AI Technical & Behavioral Interviewer for college campus placements.
Provide realistic, challenging, and high-signal interview questions tailored to the candidate's target career.
Evaluate student answers with constructive feedback, score (0-100), and sample model answers."""

async def generate_interview_session(career: str, interview_type: str = "technical", count: int = 4) -> Dict[str, Any]:
    default_questions = {
        "technical": [
            {"id": "q1", "question": f"Explain the execution lifecycle and performance bottlenecks in a typical {career} stack.", "category": "Architecture"},
            {"id": "q2", "question": "What is the difference between synchronous blocking I/O and asynchronous event loops? Provide a production scenario.", "category": "Concurrency"},
            {"id": "q3", "question": "How do you design database indexing strategies for high-frequency write operations vs analytical queries?", "category": "Databases"},
            {"id": "q4", "question": "Walk me through how you implement zero-downtime rolling deployments and blue-green releases.", "category": "DevOps"}
        ],
        "coding": [
            {"id": "q1", "question": "Given an unsorted array of integers, find the length of the longest consecutive elements sequence in O(n) time.", "category": "Algorithms"},
            {"id": "q2", "question": "Implement an LRU Cache with get and put operations in O(1) time complexity.", "category": "Data Structures"},
            {"id": "q3", "question": "Design an algorithm to detect cycles in a directed graph representing package build dependencies.", "category": "Graphs"}
        ],
        "system_design": [
            {"id": "q1", "question": "Design a real-time collaborative code editor supporting 50 concurrent users per document.", "category": "Distributed Systems"},
            {"id": "q2", "question": "Design an API rate limiter supporting multi-tier throttling with distributed Redis clusters.", "category": "Scalability"}
        ],
        "hr": [
            {"id": "q1", "question": "Tell me about a challenging technical conflict you experienced in a team project and how you resolved it.", "category": "Behavioral"},
            {"id": "q2", "question": "Describe an instance where you had to learn a completely new framework or technology under a tight campus deadline.", "category": "Adaptability"},
            {"id": "q3", "question": "Where do you see yourself contributing within our engineering organization over your first 18 months?", "category": "Vision"}
        ]
    }
    
    selected = default_questions.get(interview_type, default_questions["technical"])
    fallback = {
        "interview_type": interview_type,
        "career": career,
        "questions": selected[:count]
    }
    
    prompt = f"""Generate {count} high-caliber {interview_type} interview questions for a college candidate targeting '{career}'.
Return valid JSON:
{{
  "interview_type": "{interview_type}",
  "career": "{career}",
  "questions": [
    {{
      "id": "q1",
      "question": "string",
      "category": "string"
    }}
  ]
}}
"""
    return await ai_orchestrator.query_llm_json(prompt, INTERVIEW_SYSTEM, fallback)

async def evaluate_interview_answer(question: str, user_answer: str, career: str) -> Dict[str, Any]:
    ans_len = len(user_answer.strip())
    score = 70
    if ans_len > 120:
        score += 15
    if any(k in user_answer.lower() for k in ["for example", "trade-off", "performance", "because", "latency", "scale"]):
        score += 10
    score = min(96, max(40, score))
    
    fallback = {
        "score": score,
        "strengths": [
            "Good articulation of foundational principles.",
            "Clearly states reasoning and practical trade-offs."
        ],
        "areas_for_improvement": [
            "Could cite concrete metrics or real-world project examples to stand out to hiring managers."
        ],
        "ideal_response_summary": "An optimal answer explains the core mechanism, highlights space/time complexity or operational trade-offs, and provides a concise real-world illustration."
    }
    
    prompt = f"""Evaluate this interview response for a candidate targeting '{career}'.
QUESTION: {question}
CANDIDATE ANSWER: {user_answer}

Return valid JSON:
{{
  "score": 85,
  "strengths": ["string"],
  "areas_for_improvement": ["string"],
  "ideal_response_summary": "string"
}}
"""
    return await ai_orchestrator.query_llm_json(prompt, INTERVIEW_SYSTEM, fallback)
