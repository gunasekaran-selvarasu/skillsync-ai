import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Target, Plus, CheckCircle2, AlertTriangle, ShieldCheck, ArrowRight } from 'lucide-react';

export default function SkillsAndGapsPage() {
  const [gapData, setGapData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState('Intermediate');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchGaps();
  }, []);

  const fetchGaps = async () => {
    try {
      const res = await api.get('/skills/gaps');
      setGapData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;
    setSubmitting(true);
    try {
      await api.post('/profile/skills', {
        skill_name: newSkillName,
        current_level: newSkillLevel,
        self_rating: 4
      });
      setNewSkillName('');
      await fetchGaps();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const skills = gapData?.skills || [];
  const filtered = skills.filter((s) => {
    if (filter === 'VERIFIED') return s.status === 'VERIFIED';
    if (filter === 'ACQUIRED') return s.status === 'ACQUIRED';
    if (filter === 'MISSING') return s.status === 'MISSING';
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Target className="w-6 h-6 text-purple-600" />
            Skills & Gap Intelligence
          </h2>
          <p className="text-xs text-slate-500">
            Target Role: <span className="font-semibold text-slate-800">{gapData?.target_career}</span> • {gapData?.readiness_percentage}% Placement Readiness
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg transition ${filter === 'ALL' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
          >
            All ({skills.length})
          </button>
          <button
            onClick={() => setFilter('VERIFIED')}
            className={`px-3 py-1.5 rounded-lg transition ${filter === 'VERIFIED' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Verified ({gapData?.verified_count})
          </button>
          <button
            onClick={() => setFilter('ACQUIRED')}
            className={`px-3 py-1.5 rounded-lg transition ${filter === 'ACQUIRED' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Acquired ({gapData?.acquired_count})
          </button>
          <button
            onClick={() => setFilter('MISSING')}
            className={`px-3 py-1.5 rounded-lg transition ${filter === 'MISSING' ? 'bg-white text-rose-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Missing Gaps ({gapData?.missing_count})
          </button>
        </div>
      </div>

      {/* Inline Quick Add Skill */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <form onSubmit={handleAddSkill} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex-1 w-full">
            <input
              type="text"
              required
              value={newSkillName}
              onChange={(e) => setNewSkillName(e.target.value)}
              placeholder="Add or claim a new technical skill (e.g. Kubernetes, Redis, GraphQL)..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            />
          </div>
          <select
            value={newSkillLevel}
            onChange={(e) => setNewSkillLevel(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-slate-200 text-xs bg-white text-slate-700 font-medium"
          >
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
          <button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            Claim Skill
          </button>
        </form>
      </div>

      {/* Skills Matrix Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((item, idx) => {
          const isVerified = item.status === 'VERIFIED';
          const isAcquired = item.status === 'ACQUIRED';
          const isMissing = item.status === 'MISSING';

          return (
            <div
              key={idx}
              className={`bg-white rounded-2xl p-5 border transition flex flex-col justify-between ${
                isVerified 
                  ? 'border-emerald-200 hover:shadow-md hover:shadow-emerald-50' 
                  : (isAcquired ? 'border-purple-200 hover:shadow-md hover:shadow-purple-50' : 'border-rose-200 hover:shadow-md hover:shadow-rose-50')
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-slate-900 text-sm">{item.skill}</h4>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                    isVerified 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : (isAcquired ? 'bg-purple-100 text-purple-800' : 'bg-rose-100 text-rose-800')
                  }`}>
                    {item.status}
                  </span>
                </div>

                <div className="space-y-1 text-xs text-slate-500 mt-2">
                  <p>Required Level: <span className="font-semibold text-slate-700">{item.required_level}</span></p>
                  <p>Current Status: <span className="font-semibold text-slate-700">{item.current_level}</span></p>
                  <p>Placement Priority: <span className="font-semibold text-slate-700">{item.priority}</span></p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100">
                {isMissing ? (
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] text-rose-600 font-semibold flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> High Placement Gap
                    </span>
                    <button
                      onClick={() => navigate('/student/verification')}
                      className="text-xs font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-1"
                    >
                      Verify Now <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-emerald-600 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Confidence: {(item.confidence * 100).toFixed(0)}%
                    </span>
                    <button
                      onClick={() => navigate('/student/verification')}
                      className="text-slate-400 hover:text-purple-600 transition font-medium"
                    >
                      Re-certify
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
