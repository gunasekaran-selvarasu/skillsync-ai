import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
  FolderGit2, 
  Sparkles, 
  Layers, 
  Clock, 
  CheckCircle2, 
  ArrowRight,
  Code2
} from 'lucide-react';

export default function ProjectGeneratorPage() {
  const [recommendations, setRecommendations] = useState([]);
  const [customProject, setCustomProject] = useState(null);
  const [skillFocus, setSkillFocus] = useState('');
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      const res = await api.get('/projects/recommendations');
      setRecommendations(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setGenerating(true);
    try {
      const res = await api.post('/projects/generate', {
        skill_to_focus: skillFocus || 'Microservices Architecture',
        difficulty: difficulty
      });
      setCustomProject(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <FolderGit2 className="w-6 h-6 text-purple-600" />
          AI Skill-Gap Project Generator
        </h2>
        <p className="text-xs text-slate-500">
          Tailor-made capstone and microservice projects formulated specifically to close your identified hiring gaps
        </p>
      </div>

      {/* Generator Prompt Form */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
        <h3 className="font-bold text-sm text-slate-900 mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-600" /> Synthesize Project Spec
        </h3>
        <form onSubmit={handleGenerate} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={skillFocus}
            onChange={(e) => setSkillFocus(e.target.value)}
            placeholder="Focus Skill Gap (e.g. Docker, Redis, Kubernetes, WebSocket)..."
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/20"
          />
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-slate-200 text-xs bg-white text-slate-700"
          >
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced (Placement Differentiator)</option>
          </select>
          <button
            type="submit"
            disabled={generating}
            className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs transition disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {generating ? 'Formulating Specification...' : 'Generate Project Spec'}
          </button>
        </form>
      </div>

      {/* Generated Project Spec (Section 15 schema) */}
      {customProject && (
        <div className="bg-gradient-to-r from-purple-50 via-white to-emerald-50/50 rounded-3xl p-7 border-2 border-purple-200 shadow-md space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-purple-600 text-white uppercase tracking-wider">
              AI Generated Gap-Closing Capstone
            </span>
            <span className="text-xs text-slate-500 font-semibold">⏱️ Estimated: {customProject.estimated_hours} Hours</span>
          </div>

          <h3 className="text-xl font-extrabold text-slate-900">{customProject.title}</h3>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">{customProject.problem_statement}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="bg-white/90 p-4 rounded-2xl border border-purple-100">
              <p className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Key Features to Implement</p>
              <ul className="space-y-1.5 text-xs text-slate-600">
                {customProject.features?.map((f, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white/90 p-4 rounded-2xl border border-purple-100">
              <p className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Placement Portfolio Value</p>
              <p className="text-xs text-slate-600 leading-relaxed italic">{customProject.portfolio_value}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {customProject.technologies?.map((tech, i) => (
                  <span key={i} className="text-[10px] font-semibold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-md">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Curated Pre-Built Recommendations */}
      <div className="space-y-4">
        <h3 className="font-bold text-sm text-slate-900">Recommended Placement Projects</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {recommendations.map((p) => (
            <div key={p.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase">
                    {p.difficulty}
                  </span>
                  <span className="text-xs text-slate-400">⏱️ {p.estimated_hours} hrs</span>
                </div>
                <h4 className="font-bold text-slate-900 text-base">{p.title}</h4>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">{p.problem_statement}</p>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {p.skills_to_learn?.map((sk, idx) => (
                    <span key={idx} className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium">
                      {sk}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-purple-700 font-semibold">High Recruiter Signal</span>
                <button
                  onClick={() => setCustomProject(p)}
                  className="px-3.5 py-1.5 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 font-semibold text-xs flex items-center gap-1 transition"
                >
                  View Spec <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
