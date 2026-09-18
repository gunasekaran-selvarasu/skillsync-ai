import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  Circle, 
  Flame, 
  FileText, 
  Target, 
  TrendingUp,
  BrainCircuit,
  Award
} from 'lucide-react';

export default function StudentDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/analytics/student');
      setData(res.data);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const twin = data?.career_twin || {};
  const nextTask = data?.what_should_i_learn_next || {};
  const skills = data?.skill_progress || [];
  const roadmapTasks = data?.roadmap_tasks || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* SECTION 19 HEADER GREETING & CAREER TWIN COMPLETENESS */}
      <div className="bg-gradient-to-r from-purple-700 via-purple-800 to-slate-900 rounded-3xl p-7 text-white shadow-xl shadow-purple-900/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs bg-purple-500/30 text-purple-200 border border-purple-400/30 px-3 py-0.5 rounded-full font-medium flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-300" />
              Target Role: {twin.target_career || 'Full Stack Developer'}
            </span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">
            {data?.greeting || 'Good Evening'}, {data?.student_name || 'Alex Morgan'}
          </h2>
          <p className="text-purple-200 text-sm mt-1">
            Your Placement Readiness & AI Career Twin is actively tracking your campus trajectory.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 min-w-[240px]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-purple-200 uppercase tracking-wider">Career Twin Completeness</span>
            <span className="text-lg font-extrabold text-white">{twin.completeness_score || 72}%</span>
          </div>
          <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-emerald-400 h-full rounded-full transition-all duration-500 shadow-sm shadow-emerald-400" 
              style={{ width: `${twin.completeness_score || 72}%` }}
            ></div>
          </div>
          <p className="text-[11px] text-purple-200 mt-2 flex items-center justify-between">
            <span>Verified Evidence: High</span>
            <button 
              onClick={() => navigate('/student/career-twin')} 
              className="text-emerald-300 font-semibold hover:underline"
            >
              Inspect Twin →
            </button>
          </p>
        </div>
      </div>

      {/* THREE METRICS CARDS: SKILLS % | GAP % | RESUME SCORE % */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Skills Acquired */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Skills Acquired</p>
            <p className="text-3xl font-extrabold text-slate-900 mt-1">{twin.readiness_percentage || 72}%</p>
            <p className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {twin.skills_summary?.acquired || 4} of {twin.skills_summary?.total || 6} role competencies
            </p>
          </div>
          <div className="w-13 h-13 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center p-3">
            <Target className="w-7 h-7" />
          </div>
        </div>

        {/* Card 2: Skill Gap */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Remaining Gap</p>
            <p className="text-3xl font-extrabold text-slate-900 mt-1">{twin.gap_percentage || 28}%</p>
            <p className="text-xs text-amber-600 font-medium mt-1 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              {twin.skills_summary?.missing || 2} missing skills to close
            </p>
          </div>
          <div className="w-13 h-13 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center p-3">
            <TrendingUp className="w-7 h-7" />
          </div>
        </div>

        {/* Card 3: Resume ATS Score */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Resume Alignment</p>
            <p className="text-3xl font-extrabold text-slate-900 mt-1">{twin.resume_score || 84}%</p>
            <p className="text-xs text-purple-600 font-medium mt-1 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5" />
              ATS Keyword match optimized
            </p>
          </div>
          <div className="w-13 h-13 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center p-3">
            <Award className="w-7 h-7" />
          </div>
        </div>
      </div>

      {/* WHAT SHOULD I LEARN NEXT? BANNER (SECTION 19 SPEC) */}
      <div className="rounded-3xl border-2 border-purple-200 bg-gradient-to-r from-purple-50 via-white to-emerald-50/50 p-6 shadow-md shadow-purple-100/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 bg-purple-600 text-white text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-xs">
                <BrainCircuit className="w-3.5 h-3.5" />
                What Should I Learn Next?
              </span>
              <span className="text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                Priority: {nextTask.priority || 'HIGH'}
              </span>
            </div>

            <h3 className="text-xl font-bold text-slate-900">
              {nextTask.recommended_skill || 'Docker Networking & Microservices'}
            </h3>
            
            <p className="text-sm text-slate-600">
              <span className="font-semibold text-slate-800">Reason: </span>
              {nextTask.reason || 'Required by target role and currently missing from verified evidence.'}
            </p>

            <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
              <span>⏱️ Est. Effort: {nextTask.estimated_hours || 8} hours</span>
              <span>• Outcome: Placement qualification for tier-1 campus drives</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate('/student/roadmap')}
              className="px-6 py-3.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm shadow-md shadow-purple-300 flex items-center justify-center gap-2 transition"
            >
              Start Learning
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('/student/verification')}
              className="px-5 py-3.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-sm flex items-center justify-center gap-2 transition"
            >
              Take Practical Challenge
            </button>
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION: SKILL PROGRESS & DYNAMIC ROADMAP (SECTION 19 SPEC) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Skill Progress */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              Skill Progress
            </h3>
            <button 
              onClick={() => navigate('/student/skills-gaps')}
              className="text-xs font-semibold text-purple-600 hover:text-purple-700"
            >
              View All Skills →
            </button>
          </div>

          <div className="space-y-4">
            {skills.map((s, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800">{s.name}</span>
                  <span className="text-slate-500 font-medium">{s.level} • {s.percentage}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      s.percentage >= 80 ? 'bg-emerald-500' : (s.percentage >= 60 ? 'bg-purple-500' : 'bg-amber-400')
                    }`}
                    style={{ width: `${s.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Dynamic Roadmap (Timeline from Section 19) */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-emerald-600" />
              Dynamic Roadmap Timeline
            </h3>
            <button 
              onClick={() => navigate('/student/roadmap')}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
            >
              Open Full Roadmap →
            </button>
          </div>

          <div className="space-y-3">
            {roadmapTasks.map((t, idx) => {
              const isDone = t.status === 'completed';
              const isInProgress = t.status === 'in_progress';

              return (
                <div 
                  key={idx} 
                  className={`p-3.5 rounded-2xl border flex items-center justify-between transition ${
                    isDone 
                      ? 'bg-emerald-50/50 border-emerald-200 text-emerald-900' 
                      : (isInProgress 
                          ? 'bg-purple-50/60 border-purple-300 text-purple-900 shadow-xs' 
                          : 'bg-slate-50/50 border-slate-200 text-slate-600')
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {isDone ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    ) : isInProgress ? (
                      <ArrowRight className="w-5 h-5 text-purple-600 flex-shrink-0 animate-pulse" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-300 flex-shrink-0" />
                    )}
                    <div>
                      <p className="text-sm font-semibold">{t.title}</p>
                      <p className="text-[11px] opacity-75 capitalize">
                        {isDone ? 'Milestone Verified' : (isInProgress ? 'Current Focus Phase' : 'Upcoming Requirement')}
                      </p>
                    </div>
                  </div>

                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                    isDone 
                      ? 'bg-emerald-100 text-emerald-700' 
                      : (isInProgress ? 'bg-purple-100 text-purple-700' : 'bg-slate-200 text-slate-600')
                  }`}>
                    {t.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
