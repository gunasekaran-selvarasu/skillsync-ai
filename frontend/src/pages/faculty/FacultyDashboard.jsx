import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { 
  Users, 
  Award, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  MessageSquare,
  ArrowRight
} from 'lucide-react';

export default function FacultyDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFacultyData();
  }, []);

  const fetchFacultyData = async () => {
    try {
      const res = await api.get('/analytics/faculty');
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
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const students = data?.students || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-800 to-indigo-900 rounded-3xl p-7 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-xs bg-white/20 text-purple-100 px-3 py-1 rounded-full font-semibold">
            Faculty Mentoring & Placement Coordinator Portal
          </span>
          <h2 className="text-2xl font-bold tracking-tight mt-2">Department Student Cohort Monitor</h2>
          <p className="text-purple-200 text-xs mt-1">
            Tracking verified technical evidence, assessment outcomes, and placement intervention alerts
          </p>
        </div>
      </div>

      {/* 4 Metric Cards (Section 20 specification) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Assigned Students</p>
          <p className="text-3xl font-extrabold text-slate-900 mt-1">{data?.assigned_students_count || 1}</p>
          <p className="text-xs text-purple-600 font-medium mt-1">Active departmental cohort</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Assessments Completed</p>
          <p className="text-3xl font-extrabold text-slate-900 mt-1">{data?.total_assessments_completed || 0}</p>
          <p className="text-xs text-emerald-600 font-medium mt-1">Standardized tests taken</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Avg Skill Evidence</p>
          <p className="text-3xl font-extrabold text-slate-900 mt-1">{data?.average_skill_evidence || 0}</p>
          <p className="text-xs text-purple-600 font-medium mt-1">Verified skills per student</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Intervention Needed</p>
          <p className="text-3xl font-extrabold text-rose-600 mt-1">{data?.students_requiring_training || 0}</p>
          <p className="text-xs text-rose-600 font-medium mt-1">Critical placement gaps</p>
        </div>
      </div>

      {/* Cohort Directory & Mentoring Interventions */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-600" />
            Mentees Placement Progress
          </h3>
          <button
            onClick={() => navigate('/faculty/students')}
            className="text-xs font-semibold text-purple-600 hover:text-purple-700"
          >
            Inspect Cohort Directory →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="pb-3">Student Name</th>
                <th className="pb-3">Roll Number</th>
                <th className="pb-3">Target Career</th>
                <th className="pb-3">CGPA</th>
                <th className="pb-3">Evidence Count</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.map((st) => (
                <tr key={st.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3 font-semibold text-slate-900">{st.name}</td>
                  <td className="py-3 text-slate-500 font-mono">{st.roll_number}</td>
                  <td className="py-3 text-purple-700 font-medium">{st.target_career_name || 'Full Stack Developer'}</td>
                  <td className="py-3 font-bold text-slate-800">{st.cgpa}</td>
                  <td className="py-3 text-slate-600">{st.evidence_count} items</td>
                  <td className="py-3">
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      st.training_flag ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {st.training_flag ? 'Training Needed' : 'On Track'}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => navigate(`/faculty/reports?student=${st.user_id}`)}
                      className="px-3 py-1 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 font-semibold transition"
                    >
                      Feedback & Report
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
