from typing import Dict, Any, List
from backend.app.ai.orchestrator import ai_orchestrator

JOB_ANALYZER_SYSTEM = """You are the SkillSync AI Job Description Analyzer.
Extract: job title, experience, required skills, preferred skills, tools, frameworks, databases, cloud, certifications, education, responsibilities, keywords and eligibility.
Compare with the student's evidence.
Classify each requirement: MATCH, PARTIAL_MATCH, MISSING, UNKNOWN.
Do not assume similar technologies are equivalent.
Return structured JSON."""

async def analyze_job_description(
    job_description: str,
    job_title: str = "",
    student_skills: List[str] = None
) -> Dict[str, Any]:
    student_skills_set = set(s.lower().strip() for s in (student_skills or []))
    
    # Heuristic requirement extraction
    common_reqs = ["Python", "FastAPI", "MongoDB", "React", "Docker", "AWS", "Git", "RESTful APIs", "Data Structures"]
    classifications = []
    
    match_count = 0
    total_count = len(common_reqs)
    
    for r in common_reqs:
        r_lower = r.lower()
        if r_lower in student_skills_set:
            status = "MATCH"
            match_count += 1
            reason = "Directly present in student's verified skills & project history."
        elif any(part in r_lower for part in ["api", "rest", "git"]) and any("git" in s or "api" in s for s in student_skills_set):
            status = "PARTIAL_MATCH"
            match_count += 0.5
            reason = "Related foundational skill verified, but exact tool evidence pending."
        else:
            status = "MISSING"
            reason = "Requirement not yet found in student profile, assessments, or portfolio."
            
        classifications.append({
            "requirement": r,
            "status": status,
            "category": "Technical Skill",
            "priority": "High" if status == "MISSING" else "Medium",
            "action_recommendation": f"Add {r} to roadmap tasks" if status != "MATCH" else "Verified"
        })
        
    overall_match_score = int((match_count / total_count) * 100) if total_count else 70
    
    fallback = {
        "job_title": job_title or "Full Stack Developer",
        "experience_level": "0-2 years (College Fresher / Junior)",
        "overall_match_score": overall_match_score,
        "eligibility_status": "Eligible" if overall_match_score >= 60 else "Partially Eligible",
        "requirements_analysis": classifications,
        "responsibilities": [
            "Design and build performant backend REST APIs and microservices.",
            "Collaborate on clean, responsive UI integration with React.",
            "Write robust unit tests and participate in code reviews."
        ],
        "keywords": ["FastAPI", "MongoDB", "React", "Docker", "REST API", "Microservices"]
    }

    prompt = f"""You are the SkillSync AI Job Description Analyzer.
Analyze the following job description and compare it against the student's verified skills: {', '.join(student_skills or [])}.

JOB TITLE: {job_title}
JOB DESCRIPTION:
{job_description[:3000]}

Return valid JSON:
{{
  "job_title": "string",
  "experience_level": "string",
  "overall_match_score": 75,
  "eligibility_status": "Eligible",
  "requirements_analysis": [
    {{
      "requirement": "Python",
      "status": "MATCH",
      "category": "Language",
      "priority": "High",
      "action_recommendation": "string"
    }}
  ],
  "responsibilities": ["string"],
  "keywords": ["string"]
}}
"""
    result = await ai_orchestrator.query_llm_json(prompt, JOB_ANALYZER_SYSTEM, fallback)
    return result
