import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  Award, 
  FolderGit2, 
  FileText, 
  HelpCircle,
  TrendingUp,
  Cpu,
  ArrowRight
} from 'lucide-react';

export default function CareerTwinPage() {
  const [twin, setTwin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTwin();
  }, []);

  const fetchTwin = async () => {
    try {
      const res = await api.get('/analytics/student');
      setTwin(res.data?.career_twin);
    } catch (err) {
      console.error(err);
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

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-100 text-purple-700">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl font-bold text-slate-900">AI Career Twin</h2>
              <p className="text-xs text-slate-500">Autonomous dynamic representation of your placement readiness profile</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs font-semibold text-slate-400 uppercase">Twin Fidelity</p>
            <p className="text-lg font-extrabold text-emerald-600">{twin?.completeness_score || 72}% Verified</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center font-bold text-sm">
            {twin?.completeness_score || 72}%
          </div>
        </div>
      </div>

      {/* Target Role & Education Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Target Career</span>
          <p className="text-base font-bold text-slate-900 mt-1">{twin?.target_career}</p>
          <span className="inline-block mt-2 text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-semibold">
            {twin?.experience_level}
          </span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Department</span>
          <p className="text-base font-bold text-slate-900 mt-1">{twin?.education?.department}</p>
          <p className="text-xs text-slate-500 mt-1">Roll: {twin?.education?.roll_number}</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Academic Standing</span>
          <p className="text-base font-bold text-slate-900 mt-1">{twin?.education?.cgpa} CGPA</p>
          <p className="text-xs text-slate-500 mt-1">Class of {twin?.education?.graduation_year}</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Evidence Sources</span>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="p-1 rounded-md bg-purple-50 text-purple-600" title="Assessment"><Award className="w-4 h-4" /></span>
            <span className="p-1 rounded-md bg-emerald-50 text-emerald-600" title="Verification"><ShieldCheck className="w-4 h-4" /></span>
            <span className="p-1 rounded-md bg-blue-50 text-blue-600" title="Project"><FolderGit2 className="w-4 h-4" /></span>
            <span className="p-1 rounded-md bg-amber-50 text-amber-600" title="Resume"><FileText className="w-4 h-4" /></span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">5 weighted sources active</p>
        </div>
      </div>

      {/* Competencies Matrix */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Cpu className="w-5 h-5 text-purple-600" />
          Evidence-Supported Skill Graph
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {twin?.skill_details?.map((item, idx) => {
            const isVerified = item.status === 'VERIFIED';
            const isAcquired = item.status === 'ACQUIRED';

            return (
              <div 
                key={idx} 
                className={`p-4 rounded-2xl border transition ${
                  isVerified 
                    ? 'bg-emerald-50/40 border-emerald-200' 
                    : (isAcquired ? 'bg-purple-50/40 border-purple-200' : 'bg-slate-50/60 border-slate-200')
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm text-slate-900">{item.skill}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    isVerified 
                      ? 'bg-emerald-100 text-emerald-700' 
                      : (isAcquired ? 'bg-purple-100 text-purple-700' : 'bg-rose-100 text-rose-700')
                  }`}>
                    {item.status}
                  </span>
                </div>

                <div className="text-xs text-slate-500 space-y-1">
                  <p>Required: <span className="font-semibold text-slate-700">{item.required_level}</span></p>
                  <p>Demonstrated: <span className="font-semibold text-slate-700">{item.current_level}</span></p>
                  <p>Priority: <span className="font-semibold text-slate-700">{item.priority}</span></p>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Confidence Weight</span>
                  <span className="font-bold text-slate-700">{(item.confidence * 100).toFixed(0)}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
