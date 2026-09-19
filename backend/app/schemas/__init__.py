from typing import List, Dict, Any, Optional
from pydantic import BaseModel, EmailStr, Field

# --- Auth Schemas ---
class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str = "student"  # "student", "faculty", "admin"
    college_id: Optional[str] = None
    department_id: Optional[str] = None
    roll_number: Optional[str] = None
    graduation_year: Optional[int] = 2026

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]

# --- Profile Schemas ---
class StudentProfileUpdate(BaseModel):
    name: Optional[str] = None
    department_id: Optional[str] = None
    roll_number: Optional[str] = None
    academic_year: Optional[str] = None
    graduation_year: Optional[int] = None
    cgpa: Optional[float] = None
    bio: Optional[str] = None
    target_career_id: Optional[str] = None

class SkillAddRequest(BaseModel):
    skill_name: str
    category: Optional[str] = "Technical"
    self_rating: int = Field(default=3, ge=1, le=5)
    current_level: str = "Intermediate"  # Beginner, Intermediate, Advanced

class StudentProjectCreate(BaseModel):
    title: str
    description: str
    technologies: List[str] = []
    repository_url: Optional[str] = None
    live_url: Optional[str] = None

# --- Career & What-If ---
class CareerSelectRequest(BaseModel):
    career_id: str
    target_date: Optional[str] = None

class WhatIfRequest(BaseModel):
    alternative_career_id: str

# --- Assessment Schemas ---
class SubmitAssessmentRequest(BaseModel):
    attempt_id: str
    answers: Dict[str, Any]  # question_id -> chosen option or text answer

# --- Resume Schemas ---
class ResumeBuildRequest(BaseModel):
    title: str = "My Resume"
    full_name: str
    email: str
    phone: Optional[str] = ""
    summary: str
    education: List[Dict[str, Any]] = []
    experience: List[Dict[str, Any]] = []
    projects: List[Dict[str, Any]] = []
    skills: List[str] = []
    certifications: List[str] = []
    template: str = "modern_clean"

# --- Job & Matching Schemas ---
class JobCreateRequest(BaseModel):
    company_name: str
    title: str
    description: str
    experience: str = "0-2 years"
    eligibility_min_cgpa: float = 6.0
    required_skills: List[str] = []
    preferred_skills: List[str] = []
    package: Optional[str] = "8-12 LPA"
    salary_package: Optional[str] = None
    location: Optional[str] = "Bangalore / Hybrid"

class JobUpdateRequest(BaseModel):
    company_name: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    experience: Optional[str] = None
    eligibility_min_cgpa: Optional[float] = None
    required_skills: Optional[List[str]] = None
    preferred_skills: Optional[List[str]] = None
    package: Optional[str] = None
    salary_package: Optional[str] = None
    location: Optional[str] = None
    status: Optional[str] = None

class JobAnalyzeRequest(BaseModel):
    job_description: str
    job_title: Optional[str] = None

# --- Roadmap & Task Schemas ---
class TaskStatusUpdateRequest(BaseModel):
    status: str  # "todo", "in_progress", "completed"

# --- Projects Schemas ---
class ProjectGenerateRequest(BaseModel):
    skill_to_focus: Optional[str] = None
    difficulty: Optional[str] = "Intermediate"

# --- Interview Schemas ---
class InterviewGenerateRequest(BaseModel):
    type: str = "technical"  # "technical", "coding", "system_design", "hr"
    question_count: int = 5
    topic: Optional[str] = None

class InterviewEvaluateRequest(BaseModel):
    interview_id: str
    question_id: str
    user_answer: str

# --- Verification Schemas ---
class VerificationSubmitRequest(BaseModel):
    verification_id: str
    answer_text: str

# --- Placement Drives Schemas ---
class PlacementDriveCreate(BaseModel):
    company_name: str
    job_title: str
    description: str
    min_cgpa: float = 6.5
    eligible_departments: List[str] = []
    required_skills: List[str] = []
    salary_package: str
    drive_date: str
    location: str = "On Campus"

class PlacementDriveUpdate(BaseModel):
    company_name: Optional[str] = None
    job_title: Optional[str] = None
    description: Optional[str] = None
    min_cgpa: Optional[float] = None
    eligible_departments: Optional[List[str]] = None
    required_skills: Optional[List[str]] = None
    salary_package: Optional[str] = None
    drive_date: Optional[str] = None
    location: Optional[str] = None
    status: Optional[str] = None

class ApplyDriveRequest(BaseModel):
    resume_id: Optional[str] = None
    cover_note: Optional[str] = None
