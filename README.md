# SkillSync AI 🎯
### College Career Intelligence & Placement Readiness Platform

SkillSync AI is an AI-powered career development and placement-readiness platform for colleges, supporting **Student**, **Faculty**, and **Admin / TPO** portals. It continuously connects student evidence with enterprise recruitment eligibility.

> **Core Principle:** Where am I now → Where do I want to go → What am I missing → What should I do next?

---

## 📚 Complete Architectural Documentation & Pitch

- 🗺️ **[Complete End-to-End Flow & Schema Design](ARCHITECTURE_AND_FLOW.md)**: Exhaustive Mermaid diagrams, complete MongoDB collection schemas, and architectural design decisions.
- 💡 **[Executive Pitch Document](pitch.md)**: Institutional value proposition, problem analysis, and campus placement ROI.
- 📊 **[Executive PowerPoint Presentation](SkillSync_AI_Pitch.pptx)**: Professional slide deck for College Deans, TPOs, and non-technical stakeholders.

---

## 🚀 Key Architectural Features

- **Three-Portals Architecture**:
  - 🎓 **Student Portal**: AI Career Twin, "What Should I Learn Next?", Skill Gap Matrix, Dynamic Roadmap with interactive task status toggling, Resume Studio (ATS Analyzer & Builder), Job Match & JD Analyzer, Assessments, AI Project Generator, Mock Interview room, Practical Skill Verification challenges, and Career What-If simulator.
  - 👨‍🏫 **Faculty Portal**: Assigned student cohort monitoring, assessment completions, average skill evidence telemetry, students requiring training alerts, and mentoring feedback.
  - 🏢 **Admin / TPO Portal**: Placement Intelligence telemetry, department skill heatmaps, placement drive scheduling, automated candidate eligibility matching by CGPA & skills, and AI configuration.
- **MongoDB Multi-Tenant Core**:
  - Motor async client with 30+ collections, tenant isolation (`college_id`), and 17 compound indexes following Section 3 of the specification.
- **AI Orchestrator with Deterministic Fallbacks**:
  - Implements Sections 11–16 prompts (Master Career Agent, Resume Analyzer, JD Analyzer, Next Task, Project Generator, Skill Verification).
  - Compatible with Anthropic Claude and local Ollama, with guaranteed deterministic fallback logic if offline.
- **Production Security**:
  - Cryptographically secure JWT tokens with access/refresh rotation.
  - Native bcrypt password hashing.

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React 18 + Vite | High-performance responsive SPA |
| **UI Design** | Tailwind CSS + Lucide Icons | Light purple + light green SaaS UI |
| **Backend** | Python + FastAPI | High-throughput REST API microservices |
| **Database** | MongoDB (Motor Async) | Flexible document storage & AI career profiles |
| **Auth** | JWT + Bcrypt | Multi-tenant RBAC |
| **AI Layer** | Claude 3.5 Sonnet / Ollama | Structured JSON output validation |

---

## 📦 Getting Started

### 1. Prerequisites
- Python 3.10+ (Tested on Python 3.14)
- Node.js 18+ (Tested on Node.js v22)
- MongoDB running locally on `mongodb://localhost:27017`

### 2. Backend Setup
```bash
# Install dependencies
pip install -r requirements.txt

# Start FastAPI server
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```
*Swagger API Docs: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)*

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
*Web Application: [http://localhost:5173](http://localhost:5173)*

---

## 🔑 Pre-Seeded Default Accounts (Login with Email & Password)

Authenticate via the login form using the following credentials:
- **Student**: `student@skillsync.ai` / `Password123!` (Alex Morgan — Final Year CSE)
- **Faculty Mentor**: `faculty@skillsync.ai` / `Password123!` (Dr. Sarah Jenkins)
- **TPO / Admin**: `tpo@skillsync.ai` / `Password123!` (Marcus Vance)
