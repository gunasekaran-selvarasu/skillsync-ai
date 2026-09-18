import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
  Send, 
  Plus, 
  Users, 
  CheckCircle2, 
  Calendar, 
  MapPin, 
  Building2, 
  DollarSign,
  ArrowRight
} from 'lucide-react';

export default function PlacementDrivesPage() {
  const [drives, setDrives] = useState([]);
  const [selectedDrive, setSelectedDrive] = useState(null);
  const [matchedCandidates, setMatchedCandidates] = useState(null);
  const [applications, setApplications] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [matching, setMatching] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form
  const [newDrive, setNewDrive] = useState({
    company_name: 'Microsoft',
    job_title: 'Software Development Engineer - Cloud & AI',
    description: 'Looking for graduating seniors with verified abilities in distributed backends, REST APIs, and container deployment.',
    min_cgpa: 7.5,
    eligible_departments: ['CSE', 'IT'],
    required_skills: ['Python', 'FastAPI', 'Docker', 'MongoDB'],
    salary_package: '17.0 LPA',
    drive_date: '2026-11-10',
    location: 'Campus Tech Center & Virtual'
  });

  useEffect(() => {
    fetchDrives();
  }, []);

  const fetchDrives = async () => {
    try {
      const res = await api.get('/placements/drives');
      setDrives(res.data);
      if (res.data.length > 0) {
        handleInspectDrive(res.data[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInspectDrive = async (drive) => {
    setSelectedDrive(drive);
    setMatching(true);
    try {
      const matchRes = await api.post(`/placements/drives/${drive.id}/match`);
      setMatchedCandidates(matchRes.data);

      const appsRes = await api.get(`/placements/drives/${drive.id}/applications`);
      setApplications(appsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setMatching(false);
    }
  };

  const handleCreateDrive = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/placements/drives', newDrive);
      setShowCreateModal(false);
      await fetchDrives();
      handleInspectDrive(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Send className="w-6 h-6 text-emerald-600" />
            Placement Drive Management & Candidate Matching
          </h2>
          <p className="text-xs text-slate-500">
            Configure campus recruitment drives and filter eligible students automatically by CGPA & verified skills
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(!showCreateModal)}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-200 transition"
        >
          <Plus className="w-4 h-4" />
          Schedule New Placement Drive
        </button>
      </div>

      {/* Drive Creator Modal */}
      {showCreateModal && (
        <div className="bg-white rounded-3xl p-6 border-2 border-emerald-300 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-sm text-slate-900">Configure Placement Drive</h3>
            <button onClick={() => setShowCreateModal(false)} className="text-xs text-slate-400 hover:text-slate-600">✕ Cancel</button>
          </div>

          <form onSubmit={handleCreateDrive} className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Company Name</label>
                <input
                  type="text"
                  required
                  value={newDrive.company_name}
                  onChange={(e) => setNewDrive({ ...newDrive, company_name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Job Role Title</label>
                <input
                  type="text"
                  required
                  value={newDrive.job_title}
                  onChange={(e) => setNewDrive({ ...newDrive, job_title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Salary Package</label>
                <input
                  type="text"
                  required
                  value={newDrive.salary_package}
                  onChange={(e) => setNewDrive({ ...newDrive, salary_package: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Min CGPA Filter</label>
                <input
                  type="number"
                  step="0.1"
                  value={newDrive.min_cgpa}
                  onChange={(e) => setNewDrive({ ...newDrive, min_cgpa: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Drive Date</label>
                <input
                  type="date"
                  value={newDrive.drive_date}
                  onChange={(e) => setNewDrive({ ...newDrive, drive_date: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Location</label>
                <input
                  type="text"
                  value={newDrive.location}
                  onChange={(e) => setNewDrive({ ...newDrive, location: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Required Skills (comma separated)</label>
              <input
                type="text"
                value={newDrive.required_skills.join(', ')}
                onChange={(e) => setNewDrive({ ...newDrive, required_skills: e.target.value.split(',').map((s) => s.trim()) })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
              />
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-md transition"
            >
              Publish Campus Drive
            </button>
          </form>
        </div>
      )}

      {/* Drives and Eligible Candidate Matching */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Drive Selector */}
        <div className="space-y-4">
          <h3 className="font-bold text-sm text-slate-900">Published Campus Drives</h3>
          <div className="space-y-2.5">
            {drives.map((d) => (
              <div
                key={d.id}
                onClick={() => handleInspectDrive(d)}
                className={`p-4 rounded-2xl border cursor-pointer transition ${
                  selectedDrive?.id === d.id ? 'bg-emerald-50/80 border-emerald-300 shadow-xs' : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">{d.company_name}</h4>
                    <p className="text-[11px] text-slate-600">{d.job_title}</p>
                  </div>
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
                    {d.salary_package}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-2">
                  <span>📅 {d.drive_date}</span>
                  <span>Min CGPA: {d.min_cgpa}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Matched Eligible Candidates (Section 21 & 18) */}
        <div className="lg:col-span-2 space-y-6">
          {selectedDrive && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full uppercase">
                    Eligibility & Matching Pipeline
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-1">
                    {selectedDrive.company_name} — {selectedDrive.job_title}
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-emerald-600">
                    {matchedCandidates?.total_eligible_students || 0} Eligible Students
                  </span>
                  <p className="text-[11px] text-slate-400">Meeting CGPA & skill threshold</p>
                </div>
              </div>

              {matching ? (
                <div className="p-8 text-center text-xs text-slate-400">Computing eligible matches...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase tracking-wider">
                        <th className="pb-3">Candidate</th>
                        <th className="pb-3">Department</th>
                        <th className="pb-3">CGPA</th>
                        <th className="pb-3">Skill Match</th>
                        <th className="pb-3">Eligibility</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {matchedCandidates?.candidates?.map((c, i) => (
                        <tr key={i} className="hover:bg-slate-50/70 transition">
                          <td className="py-3 font-semibold text-slate-900">
                            <div>{c.name}</div>
                            <div className="text-[10px] text-slate-400 font-normal">{c.email}</div>
                          </td>
                          <td className="py-3 text-slate-600">{c.department}</td>
                          <td className="py-3 font-bold text-slate-800">{c.cgpa}</td>
                          <td className="py-3">
                            <span className="font-bold text-purple-700">{c.skill_match_percentage}% Match</span>
                          </td>
                          <td className="py-3">
                            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                              Eligible
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Submitted Applications */}
              <div className="pt-4 border-t border-slate-100">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-3">
                  Direct Applications Received ({applications.length})
                </h4>
                {applications.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No applications submitted yet for this drive.</p>
                ) : (
                  <div className="space-y-2">
                    {applications.map((app) => (
                      <div key={app.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
                        <div>
                          <p className="font-bold text-slate-800">{app.student_name || 'Alex Morgan'}</p>
                          <p className="text-[11px] text-slate-500">{app.cover_note}</p>
                        </div>
                        <span className="text-[10px] font-bold bg-purple-100 text-purple-800 px-2.5 py-0.5 rounded-full uppercase">
                          {app.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
