import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
  BarChart, 
  Users, 
  Award, 
  FileText, 
  Mic2, 
  Send, 
  TrendingUp, 
  Building2,
  CheckCircle2,
  Layers
} from 'lucide-react';

export default function TPODashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIntelligence();
  }, []);

  const fetchIntelligence = async () => {
    try {
      const res = await api.get('/analytics/college');
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  const intel = data?.placement_intelligence || {};
  const depts = data?.department_metrics || [];
  const distribution = data?.placement_eligibility_distribution || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-900 to-slate-900 rounded-3xl p-7 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-xs bg-white/20 text-emerald-100 px-3 py-1 rounded-full font-semibold">
            Institutional Placement Readiness Engine
          </span>
          <h2 className="text-2xl font-bold tracking-tight mt-2">Apex Institute Placement Intelligence</h2>
          <p className="text-emerald-200 text-xs mt-1">
            Real-time aggregate telemetry connecting student evidence with enterprise recruitment eligibility
          </p>
        </div>
      </div>

      {/* SECTION 21 PLACEMENT INTELLIGENCE 5 KEY METRICS */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Students Registered</p>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{intel.students_registered}</p>
          <span className="text-[10px] text-emerald-600 font-medium">98% Enrollment</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Profiles Completed</p>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{intel.profiles_completed}</p>
          <span className="text-[10px] text-purple-600 font-medium">Verified Twins</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Assessments Taken</p>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{intel.assessments_completed}</p>
          <span className="text-[10px] text-emerald-600 font-medium">Standardized</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Resumes Analyzed</p>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{intel.resumes_analyzed}</p>
          <span className="text-[10px] text-purple-600 font-medium">ATS Screened</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs col-span-2 md:col-span-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Interview Practice</p>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{intel.interview_practice_sessions}</p>
          <span className="text-[10px] text-emerald-600 font-medium">Simulated Sprints</span>
        </div>
      </div>

      {/* SECTION 21 DEPARTMENT BREAKDOWN TABLE */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
        <h3 className="font-bold text-sm text-slate-900 mb-4 flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-600" />
          Department Placement Readiness Breakdown
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="pb-3">Department</th>
                <th className="pb-3">Cohort Size</th>
                <th className="pb-3">Avg Skill Evidence</th>
                <th className="pb-3">Avg Progress</th>
                <th className="pb-3">Top Identified Gap</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {depts.map((d, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70 transition">
                  <td className="py-3.5 font-bold text-slate-800">{d.department}</td>
                  <td className="py-3.5 text-slate-600">{d.students} Students</td>
                  <td className="py-3.5 font-semibold text-purple-700">{d.avg_skill_evidence} items/student</td>
                  <td className="py-3.5 font-bold text-emerald-600">{d.avg_progress}</td>
                  <td className="py-3.5 text-rose-600 font-medium">{d.top_gap}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tier Distribution Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {distribution.map((dist, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{dist.tier}</span>
            <p className="text-3xl font-extrabold text-slate-900 mt-2">{dist.count} Candidates</p>
            <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
              <div 
                className={`h-full rounded-full ${i === 0 ? 'bg-emerald-500' : (i === 1 ? 'bg-purple-500' : 'bg-rose-500')}`}
                style={{ width: `${(dist.count / 42) * 100}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
