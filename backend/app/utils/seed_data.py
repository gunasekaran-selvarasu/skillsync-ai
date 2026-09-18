import logging
from datetime import datetime, timezone
from bson import ObjectId
from backend.app.core.security import get_password_hash

logger = logging.getLogger("skillsync.seed")

async def seed_database_if_empty(db):
    """
    Seeds initial reference data, careers, skills, assessments, jobs,
    and demo users if the database is newly initialized.
    """
    if db is None:
        return

    # Check if college exists
    college = await db.colleges.find_one({"code": "APEX-ENG"})
    if college:
        logger.info("Database already seeded with college data.")
        return

    logger.info("Seeding initial SkillSync AI platform data...")

    # 1. College
    college_id = "col_apex_001"
    await db.colleges.insert_one({
        "_id": ObjectId(),
        "college_id_str": college_id,
        "name": "Apex Institute of Technology",
        "code": "APEX-ENG",
        "branding": {
            "primary_color": "#7c3aed",
            "accent_color": "#10b981",
            "tagline": "Excellence in Engineering & Career Intelligence"
        },
        "settings": {"allow_student_signup": True, "require_roll_number": True},
        "status": "active",
        "created_at": datetime.now(timezone.utc).isoformat()
    })

    # 2. Departments
    dept_cse = {
        "_id": ObjectId(),
        "college_id": college_id,
        "name": "Computer Science & Engineering",
        "code": "CSE",
        "status": "active"
    }
    dept_it = {
        "_id": ObjectId(),
        "college_id": college_id,
        "name": "Information Technology",
        "code": "IT",
        "status": "active"
    }
    dept_ece = {
        "_id": ObjectId(),
        "college_id": college_id,
        "name": "Electronics & Communication",
        "code": "ECE",
        "status": "active"
    }
    await db.departments.insert_many([dept_cse, dept_it, dept_ece])
    cse_id_str = str(dept_cse["_id"])

    # 3. Skills Bank
    skills_data = [
        {"name": "Python", "category": "Programming", "level": "Core"},
        {"name": "FastAPI", "category": "Framework", "level": "Core"},
        {"name": "JavaScript", "category": "Programming", "level": "Core"},
        {"name": "React", "category": "Frontend", "level": "Core"},
        {"name": "MongoDB", "category": "Database", "level": "Core"},
        {"name": "SQL", "category": "Database", "level": "Core"},
        {"name": "Docker", "category": "DevOps", "level": "Advanced"},
        {"name": "AWS Cloud", "category": "Cloud", "level": "Advanced"},
        {"name": "Kubernetes", "category": "DevOps", "level": "Advanced"},
        {"name": "System Design", "category": "Architecture", "level": "Advanced"},
        {"name": "Data Structures", "category": "CS Fundamentals", "level": "Core"},
        {"name": "Git & CI/CD", "category": "DevOps", "level": "Core"}
    ]
    for s in skills_data:
        s["status"] = "active"
        await db.skills.update_one({"name": s["name"]}, {"$set": s}, upsert=True)

    # 4. Careers
    careers = [
        {
            "name": "Full Stack Developer",
            "description": "Design and engineer responsive web frontends, resilient RESTful microservices, and high-performance databases.",
            "experience_level": "Entry to Mid Level",
            "skill_requirements": [
                {"name": "Python", "level": "Advanced", "priority": "High"},
                {"name": "FastAPI", "level": "Intermediate", "priority": "High"},
                {"name": "React", "level": "Advanced", "priority": "High"},
                {"name": "MongoDB", "level": "Intermediate", "priority": "High"},
                {"name": "Docker", "level": "Intermediate", "priority": "High"},
                {"name": "AWS Cloud", "level": "Beginner", "priority": "Medium"},
                {"name": "System Design", "level": "Intermediate", "priority": "High"},
                {"name": "Git & CI/CD", "level": "Intermediate", "priority": "Medium"}
            ]
        },
        {
            "name": "Cloud & DevOps Engineer",
            "description": "Build, automate, and monitor production Kubernetes clusters, cloud infrastructures, and automated CI/CD pipelines.",
            "experience_level": "Entry to Mid Level",
            "skill_requirements": [
                {"name": "Docker", "level": "Advanced", "priority": "High"},
                {"name": "Kubernetes", "level": "Advanced", "priority": "High"},
                {"name": "AWS Cloud", "level": "Advanced", "priority": "High"},
                {"name": "Python", "level": "Intermediate", "priority": "Medium"},
                {"name": "Git & CI/CD", "level": "Advanced", "priority": "High"},
                {"name": "System Design", "level": "Intermediate", "priority": "High"}
            ]
        },
        {
            "name": "AI & Machine Learning Engineer",
            "description": "Develop and deploy scalable predictive pipelines, large language model integrations, and machine learning models.",
            "experience_level": "Entry to Mid Level",
            "skill_requirements": [
                {"name": "Python", "level": "Advanced", "priority": "High"},
                {"name": "Data Structures", "level": "Advanced", "priority": "High"},
                {"name": "FastAPI", "level": "Intermediate", "priority": "Medium"},
                {"name": "SQL", "level": "Intermediate", "priority": "Medium"},
                {"name": "Docker", "level": "Intermediate", "priority": "Medium"},
                {"name": "System Design", "level": "Intermediate", "priority": "High"}
            ]
        }
    ]
    inserted_careers = []
    for c in careers:
        res = await db.careers.insert_one(c)
        c["id"] = str(res.inserted_id)
        inserted_careers.append(c)

    default_career = inserted_careers[0]
    default_career_id = str(default_career["_id"])

    # 5. Users
    pwd_hash = get_password_hash("Password123!")

    # Student: Alex Morgan
    student_user_res = await db.users.insert_one({
        "college_id": college_id,
        "name": "Alex Morgan",
        "email": "student@skillsync.ai",
        "password_hash": pwd_hash,
        "role": "student",
        "status": "active",
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    student_user_id = str(student_user_res.inserted_id)

    student_res = await db.students.insert_one({
        "user_id": student_user_id,
        "college_id": college_id,
        "department_id": cse_id_str,
        "department_name": "Computer Science & Engineering",
        "roll_number": "CS2026-042",
        "academic_year": "Final Year (4th Year)",
        "graduation_year": 2026,
        "cgpa": 8.7,
        "target_career_id": default_career_id,
        "target_career_name": "Full Stack Developer",
        "bio": "Passionate aspiring full-stack engineer focused on Python, FastAPI, and React."
    })
    student_doc_id = str(student_res.inserted_id)

    # Faculty: Dr. Sarah Jenkins
    faculty_user_res = await db.users.insert_one({
        "college_id": college_id,
        "name": "Dr. Sarah Jenkins",
        "email": "faculty@skillsync.ai",
        "password_hash": pwd_hash,
        "role": "faculty",
        "status": "active",
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    await db.faculty.insert_one({
        "user_id": str(faculty_user_res.inserted_id),
        "college_id": college_id,
        "department_id": cse_id_str,
        "employee_code": "FAC-CSE-108",
        "designation": "Associate Professor & Placement Coordinator"
    })

    # Admin / TPO: Marcus Vance
    admin_user_res = await db.users.insert_one({
        "college_id": college_id,
        "name": "Marcus Vance",
        "email": "tpo@skillsync.ai",
        "password_hash": pwd_hash,
        "role": "admin",
        "status": "active",
        "created_at": datetime.now(timezone.utc).isoformat()
    })

    # 6. Student Skills & Evidence
    student_initial_skills = [
        {"name": "Python", "current_level": "Advanced", "self_rating": 5, "verified": True},
        {"name": "FastAPI", "current_level": "Intermediate", "self_rating": 4, "verified": True},
        {"name": "React", "current_level": "Intermediate", "self_rating": 4, "verified": False},
        {"name": "MongoDB", "current_level": "Intermediate", "self_rating": 4, "verified": True},
        {"name": "Git & CI/CD", "current_level": "Intermediate", "self_rating": 3, "verified": False}
    ]
    for sk in student_initial_skills:
        await db.student_skills.insert_one({
            "student_id": student_user_id,
            "skill_id": sk["name"],
            "name": sk["name"],
            "current_level": sk["current_level"],
            "self_rating": sk["self_rating"],
            "status": "active"
        })
        if sk["verified"]:
            await db.skill_evidence.insert_one({
                "student_id": student_user_id,
                "skill_name": sk["name"],
                "source_type": "verification",
                "confidence": 0.95,
                "evidence": f"Scored 88% on practical {sk['name']} architecture test"
            })

    # 7. Student Projects
    await db.student_projects.insert_one({
        "student_id": student_user_id,
        "title": "College Placement Automation Service",
        "description": "A microservices application built with FastAPI and MongoDB to track company registration and student eligibility.",
        "technologies": ["Python", "FastAPI", "MongoDB"],
        "repository_url": "https://github.com/alexmorgan/college-placement-api",
        "progress": 100,
        "status": "completed"
    })

    # 8. Assessments & Questions
    assessment_doc = {
        "_id": ObjectId(),
        "title": "Full Stack Python & API Engineering Assessment",
        "career_id": default_career_id,
        "duration_minutes": 25,
        "difficulty": "Intermediate",
        "total_questions": 5,
        "questions": [
            {
                "id": "q1",
                "question": "In FastAPI, which dependency mechanism is best suited for injecting database sessions across requests?",
                "options": ["Depends(get_db)", "Middleware context global", "Threading local storage", "Static class instance"],
                "correct_index": 0,
                "explanation": "Depends(get_db) leverages Python async generators for automatic session setup and cleanup."
            },
            {
                "id": "q2",
                "question": "Which MongoDB index type optimizes compound range queries on date while equality matching tenant college_id?",
                "options": ["Single field on date", "Compound index: {college_id: 1, created_at: -1}", "Text index", "Wildcard index"],
                "correct_index": 1,
                "explanation": "Compound indexes matching equality first then range follow the ESR rule (Equality, Sort, Range)."
            },
            {
                "id": "q3",
                "question": "What is the primary advantage of Docker multi-stage builds?",
                "options": ["Run multiple OS kernels", "Minimize final container image size and eliminate build tools", "Automatic GPU acceleration", "Instant horizontal scaling"],
                "correct_index": 1,
                "explanation": "Multi-stage builds leave compiler SDKs and build dependencies behind, yielding lightweight production images."
            },
            {
                "id": "q4",
                "question": "In React, when should useMemo be applied?",
                "options": ["On every single state declaration", "To memoize computationally heavy pure calculations between renders", "To trigger HTTP requests", "To modify direct DOM elements"],
                "correct_index": 1,
                "explanation": "useMemo caches the result of an expensive calculation between re-renders."
            },
            {
                "id": "q5",
                "question": "What is the computational complexity of searching an element in a balanced Binary Search Tree (BST)?",
                "options": ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
                "correct_index": 1,
                "explanation": "Each comparison in a balanced BST cuts the search space in half, resulting in O(log n)."
            }
        ]
    }
    await db.assessments.insert_one(assessment_doc)

    # 9. Active Companies, Jobs, and Placement Drives
    comp_google = {
        "college_id": college_id,
        "name": "Google Cloud",
        "website": "https://cloud.google.com",
        "industry": "Cloud & Infrastructure",
        "contact": "campus-recruitment@google.com"
    }
    comp_amazon = {
        "college_id": college_id,
        "name": "Amazon AWS",
        "website": "https://aws.amazon.com",
        "industry": "Enterprise Software & Cloud",
        "contact": "university-hires@amazon.com"
    }
    comp_msft = {
        "college_id": college_id,
        "name": "Microsoft",
        "website": "https://microsoft.com",
        "industry": "Software & AI",
        "contact": "recruiting@microsoft.com"
    }
    await db.companies.insert_many([comp_google, comp_amazon, comp_msft])

    job_1 = {
        "_id": ObjectId(),
        "college_id": college_id,
        "company_name": "Google Cloud",
        "title": "Associate Cloud & Backend Engineer",
        "description": "Join Google Cloud engineering team building high-scale distributed backend services with Python, Go, and Kubernetes.",
        "experience": "0-1 years (Fresher)",
        "salary_package": "18.5 LPA",
        "location": "Bangalore / Hyderabad",
        "eligibility_min_cgpa": 8.0,
        "required_skills": ["Python", "FastAPI", "Docker", "System Design"],
        "preferred_skills": ["Kubernetes", "AWS Cloud", "MongoDB"],
        "status": "active",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    job_2 = {
        "_id": ObjectId(),
        "college_id": college_id,
        "company_name": "Amazon AWS",
        "title": "Software Development Engineer - I (SDE-1)",
        "description": "Design customer-obsessed features on high-throughput microservices. Proficient in data structures and cloud architecture.",
        "experience": "0-1 years (Fresher)",
        "salary_package": "16.0 LPA",
        "location": "Bangalore / Hybrid",
        "eligibility_min_cgpa": 7.5,
        "required_skills": ["Data Structures", "Python", "System Design", "Git & CI/CD"],
        "preferred_skills": ["Docker", "MongoDB", "AWS Cloud"],
        "status": "active",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.jobs.insert_many([job_1, job_2])

    # Placement Drive
    await db.placement_drives.insert_one({
        "_id": ObjectId(),
        "college_id": college_id,
        "company_name": "Google Cloud",
        "job_title": "Associate Cloud & Backend Engineer",
        "job_id": str(job_1["_id"]),
        "salary_package": "18.5 LPA",
        "drive_date": "2026-10-15",
        "location": "Campus Auditorium & Virtual Assessment",
        "min_cgpa": 8.0,
        "eligible_departments": ["CSE", "IT"],
        "required_skills": ["Python", "FastAPI", "Docker"],
        "status": "active",
        "created_at": datetime.now(timezone.utc).isoformat()
    })

    logger.info("Database seeding completed successfully!")
