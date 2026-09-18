import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Users, Search, Award, CheckCircle2, ChevronRight, BookOpen } from 'lucide-react';

export default function AssignedStudentsPage() {
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentDetails, setStudentDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await api.get('/faculty/students');
      setStudents(res.data);
      if (res.data.length > 0) {
        inspectStudent(res.data[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const inspectStudent = async (student) => {
    setSelectedStudent(student);
    try {
      const res = await api.get(`/faculty/students/${student.user_id}`);
      setStudentDetails(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = students.filter((s) => 
    s.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.roll_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Users className="w-6 h-6 text-purple-600" />
          Assigned Students & Evidence Tracking
        </h2>
        <p className="text-xs text-slate-500">
          Individual progress inspection, verified skill evidence, and roadmap adherence
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Student List */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by student name or roll..."
              className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            />
          </div>

          <div className="space-y-2">
            {filtered.map((st) => (
              <div
                key={st.id}
                onClick={() => inspectStudent(st)}
                className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                  selectedStudent?.id === st.id ? 'bg-purple-50 border-purple-300 shadow-xs' : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div>
                  <p className="text-xs font-bold text-slate-900">{st.name}</p>
                  <p className="text-[11px] text-slate-500">{st.roll_number} • CGPA: {st.cgpa}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Inspection */}
        <div className="lg:col-span-2 space-y-5">
          {studentDetails ? (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700 uppercase">
                    Student Profile
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 mt-1">{studentDetails.student?.name}</h3>
                  <p className="text-xs text-slate-500">
                    {studentDetails.student?.department_name} • Class of {studentDetails.student?.graduation_year}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-slate-400 uppercase">Target Role</p>
                  <p className="text-sm font-bold text-purple-700">{studentDetails.student?.target_career_name}</p>
                </div>
              </div>

              {/* Skills */}
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-2">Claimed & Verified Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {studentDetails.skills?.map((sk, i) => (
                    <span key={i} className="text-xs bg-slate-50 border border-slate-200 text-slate-700 px-3 py-1 rounded-xl font-medium">
                      {sk.name} ({sk.current_level})
                    </span>
                  ))}
                </div>
              </div>

              {/* Verified Evidence */}
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-emerald-700 mb-2">Verified Skill Evidence Graph</h4>
                <div className="space-y-2">
                  {studentDetails.evidence?.map((ev, i) => (
                    <div key={i} className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-200 text-xs flex items-center justify-between">
                      <span className="font-semibold text-emerald-950">{ev.skill_name}: {ev.evidence}</span>
                      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                        {(ev.confidence * 100).toFixed(0)}% Confidence
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center text-xs text-slate-400">
              Select a student to view verified capabilities and roadmap milestones.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
