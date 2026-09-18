from typing import Dict, Any, List
from datetime import datetime, timezone

EVIDENCE_WEIGHTS = {
    "self_report": 0.3,
    "resume": 0.6,
    "project": 0.75,
    "assessment": 0.85,
    "verification": 0.95
}

def calculate_skill_gap_analysis(
    target_career_name: str,
    required_skills: List[Dict[str, Any]],
    student_skills: List[Dict[str, Any]],
    verified_skills: List[str]
) -> Dict[str, Any]:
    """
    Compares required career skills with the student's documented skills.
    Determines verified, matching, partial, and missing skills.
    """
    student_skill_map = {s["name"].lower(): s for s in student_skills}
    verified_set = set(s.lower() for s in verified_skills)
    
    analysis_items = []
    matched_count = 0
    total_required = len(required_skills) or 1
    
    missing_for_roadmap = []

    for req in required_skills:
        name = req.get("name", "")
        name_lower = name.lower()
        req_level = req.get("level", "Intermediate")
        priority = req.get("priority", "High")
        
        if name_lower in verified_set:
            status = "VERIFIED"
            matched_count += 1
            current_level = "Advanced"
            confidence = 0.95
        elif name_lower in student_skill_map:
            st_skill = student_skill_map[name_lower]
            current_level = st_skill.get("current_level", "Intermediate")
            status = "ACQUIRED"
            matched_count += 0.8
            confidence = 0.7
        else:
            status = "MISSING"
            current_level = "None"
            confidence = 0.0
            missing_for_roadmap.append(name)
            
        analysis_items.append({
            "skill": name,
            "required_level": req_level,
            "current_level": current_level,
            "status": status,
            "priority": priority,
            "confidence": confidence
        })
        
    readiness_percentage = min(100, int((matched_count / total_required) * 100))
    gap_percentage = 100 - readiness_percentage
    
    return {
        "target_career": target_career_name,
        "readiness_percentage": readiness_percentage,
        "gap_percentage": gap_percentage,
        "total_required": total_required,
        "verified_count": len([i for i in analysis_items if i["status"] == "VERIFIED"]),
        "acquired_count": len([i for i in analysis_items if i["status"] == "ACQUIRED"]),
        "missing_count": len([i for i in analysis_items if i["status"] == "MISSING"]),
        "skills": analysis_items,
        "top_missing": missing_for_roadmap
    }

def synthesize_career_twin(
    student_profile: Dict[str, Any],
    career: Dict[str, Any],
    skills_list: List[Dict[str, Any]],
    projects_list: List[Dict[str, Any]],
    assessments_list: List[Dict[str, Any]],
    verifications_list: List[Dict[str, Any]],
    resume_analysis: Optional[Dict[str, Any]] = None,
    next_action: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Synthesizes the comprehensive Section 9 AI Career Twin model.
    """
    required_career_skills = career.get("skill_requirements", [
        {"name": "Python", "level": "Advanced", "priority": "High"},
        {"name": "FastAPI", "level": "Intermediate", "priority": "High"},
        {"name": "MongoDB", "level": "Intermediate", "priority": "High"},
        {"name": "Docker", "level": "Intermediate", "priority": "Medium"},
        {"name": "AWS Cloud", "level": "Beginner", "priority": "Medium"},
        {"name": "System Design", "level": "Intermediate", "priority": "High"}
    ])

    verified_skill_names = [v.get("skill") for v in verifications_list if v.get("score", 0) >= 70]
    
    gap_data = calculate_skill_gap_analysis(
        target_career_name=career.get("name", "Software Engineer"),
        required_skills=required_career_skills,
        student_skills=skills_list,
        verified_skills=verified_skill_names
    )
    
    # Calculate Twin completeness
    completeness_score = 30  # Baseline for profile
    if skills_list:
        completeness_score += min(20, len(skills_list) * 4)
    if resume_analysis:
        completeness_score += 20
    if assessments_list:
        completeness_score += 15
    if projects_list:
        completeness_score += 15
    completeness_score = min(100, completeness_score)

    return {
        "target_career": career.get("name", "Software Engineer"),
        "target_career_id": str(career.get("_id", "")),
        "experience_level": student_profile.get("academic_year", "Final Year"),
        "education": {
            "department": student_profile.get("department_name", "Computer Science & Engineering"),
            "roll_number": student_profile.get("roll_number", "CS2026-001"),
            "cgpa": student_profile.get("cgpa", 8.4),
            "graduation_year": student_profile.get("graduation_year", 2026)
        },
        "completeness_score": completeness_score,
        "readiness_percentage": gap_data["readiness_percentage"],
        "gap_percentage": gap_data["gap_percentage"],
        "resume_score": resume_analysis.get("ats_score", 78) if resume_analysis else 70,
        "skills_summary": {
            "total": len(skills_list),
            "verified": gap_data["verified_count"],
            "acquired": gap_data["acquired_count"],
            "missing": gap_data["missing_count"]
        },
        "skill_details": gap_data["skills"],
        "projects_count": len(projects_list),
        "assessments_completed": len(assessments_list),
        "verifications_completed": len(verifications_list),
        "recommended_next_action": next_action or {
            "recommended_skill": gap_data["top_missing"][0] if gap_data["top_missing"] else "Cloud Microservices",
            "task": f"Complete hands-on certification challenge for {gap_data['top_missing'][0] if gap_data['top_missing'] else 'Cloud Microservices'}",
            "reason": "Required by target role and currently missing from verified evidence.",
            "priority": "HIGH"
        },
        "last_updated": datetime.now(timezone.utc).isoformat()
    }
