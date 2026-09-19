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
  ArrowRight,
  Edit2,
  Trash2,
  X,
  AlertCircle
} from 'lucide-react';

export default function PlacementDrivesPage() {
  const [drives, setDrives] = useState([]);
  const [selectedDrive, setSelectedDrive] = useState(null);
  const [matchedCandidates, setMatchedCandidates] = useState(null);
  const [applications, setApplications] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [matching, setMatching] = useState(false);
  const [loading, setLoading] = useState(true);

  // Create Form
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
  const [createError, setCreateError] = useState('');
  const [createSubmitting, setCreateSubmitting] = useState(false);

  // Edit Modal State
  const [editingDrive, setEditingDrive] = useState(null);
  const [editForm, setEditForm] = useState({
    company_name: '',
    job_title: '',
    description: '',
    min_cgpa: 6.5,
    required_skills: '',
    salary_package: '',
    drive_date: '',
    location: '',
    status: 'active'
  });
  const [editError, setEditError] = useState('');
  const [editSubmitting, setEditSubmitting] = useState(false);

  // Delete Modal State
  const [driveToDelete, setDriveToDelete] = useState(null);
  const [deleteError, setDeleteError] = useState('');
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  useEffect(() => {
    fetchDrives();
  }, []);

  const fetchDrives = async () => {
    try {
      const res = await api.get('/placements/drives');
      setDrives(res.data);
      if (res.data.length > 0 && !selectedDrive) {
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

  // Create Drive
  const handleCreateDrive = async (e) => {
    e.preventDefault();
    setCreateError('');
    setCreateSubmitting(true);
    try {
      const res = await api.post('/placements/drives', newDrive);
      setShowCreateModal(false);
      await fetchDrives();
      handleInspectDrive(res.data);
    } catch (err) {
      setCreateError(err.response?.data?.detail || 'Failed to schedule placement drive');
    } finally {
      setCreateSubmitting(false);
    }
  };

  // Open Edit Modal
  const openEditModal = (drive, e) => {
    e.stopPropagation();
    setEditingDrive(drive);
    setEditError('');
    setEditForm({
      company_name: drive.company_name || '',
      job_title: drive.job_title || '',
      description: drive.description || '',
      min_cgpa: drive.min_cgpa ?? 6.5,
      required_skills: Array.isArray(drive.required_skills) ? drive.required_skills.join(', ') : '',
      salary_package: drive.salary_package || '',
      drive_date: drive.drive_date || '',
      location: drive.location || '',
      status: drive.status || 'active'
    });
  };

  // Submit Edit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingDrive) return;
    setEditError('');
    setEditSubmitting(true);
    try {
      const skillsArray = typeof editForm.required_skills === 'string'
        ? editForm.required_skills.split(',').map(s => s.trim()).filter(Boolean)
        : editForm.required_skills;

      const updated = await api.put(`/placements/drives/${editingDrive.id}`, {
        company_name: editForm.company_name,
        job_title: editForm.job_title,
        description: editForm.description,
        min_cgpa: Number(editForm.min_cgpa),
        required_skills: skillsArray,
        salary_package: editForm.salary_package,
        drive_date: editForm.drive_date,
        location: editForm.location,
        status: editForm.status
      });

      setEditingDrive(null);
      const updatedDrive = updated.data;
      // Update in drives list
      setDrives(prev => prev.map(d => d.id === updatedDrive.id ? updatedDrive : d));
      if (selectedDrive?.id === updatedDrive.id) {
        handleInspectDrive(updatedDrive);
      }
    } catch (err) {
      setEditError(err.response?.data?.detail || 'Failed to update placement drive');
    } finally {
      setEditSubmitting(false);
    }
  };

  // Delete Drive
  const handleDeleteDrive = async () => {
    if (!driveToDelete) return;
    setDeleteError('');
    setDeleteSubmitting(true);
    try {
      await api.delete(`/placements/drives/${driveToDelete.id}`);
      const deletedId = driveToDelete.id;
      setDriveToDelete(null);
      
      const remaining = drives.filter(d => d.id !== deletedId);
      setDrives(remaining);
      if (selectedDrive?.id === deletedId) {
        if (remaining.length > 0) {
          handleInspectDrive(remaining[0]);
        } else {
          setSelectedDrive(null);
          setMatchedCandidates(null);
          setApplications([]);
        }
      }
    } catch (err) {
      setDeleteError(err.response?.data?.detail || 'Failed to delete placement drive');
    } finally {
      setDeleteSubmitting(false);
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
            Configure campus recruitment drives, edit criteria, and evaluate eligible students automatically
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-200 transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          Schedule New Placement Drive
        </button>
      </div>

      {/* Drives and Eligible Candidate Matching */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Drive Selector */}
        <div className="space-y-4">
          <h3 className="font-bold text-sm text-slate-900">Published Campus Drives ({drives.length})</h3>
          <div className="space-y-2.5">
            {drives.map((d) => (
              <div
                key={d.id}
                onClick={() => handleInspectDrive(d)}
                className={`p-4 rounded-2xl border cursor-pointer transition relative group ${
                  selectedDrive?.id === d.id ? 'bg-emerald-50/80 border-emerald-300 shadow-xs' : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">{d.company_name}</h4>
                    <p className="text-[11px] text-slate-600 font-medium">{d.job_title}</p>
                  </div>
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full shrink-0">
                    {d.salary_package}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-2">
                  <span>📅 {d.drive_date}</span>
                  <span>Min CGPA: {d.min_cgpa}</span>
                </div>

                {/* Edit / Delete quick controls */}
                <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className={`text-[10px] font-semibold ${d.status === 'closed' ? 'text-slate-400' : 'text-emerald-600'}`}>
                    {d.status === 'closed' ? '● Closed' : '● Active Drive'}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => openEditModal(d, e)}
                      className="p-1 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-white transition"
                      title="Edit Drive"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDriveToDelete(d);
                        setDeleteError('');
                      }}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-white transition"
                      title="Delete Drive"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {drives.length === 0 && (
              <div className="p-8 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
                No placement drives scheduled yet. Click above to create one.
              </div>
            )}
          </div>
        </div>

        {/* Matched Eligible Candidates */}
        <div className="lg:col-span-2 space-y-6">
          {selectedDrive ? (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full uppercase">
                    Eligibility & Matching Pipeline
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-1">
                    {selectedDrive.company_name} — {selectedDrive.job_title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    📍 {selectedDrive.location} • Min CGPA {selectedDrive.min_cgpa} • Package {selectedDrive.salary_package}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xs font-bold text-emerald-600">
                      {matchedCandidates?.total_eligible_students || 0} Eligible Students
                    </span>
                    <p className="text-[11px] text-slate-400">Meeting CGPA & skill threshold</p>
                  </div>

                  <button
                    onClick={(e) => openEditModal(selectedDrive, e)}
                    className="p-2 rounded-xl text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition border border-slate-200"
                    title="Edit Drive Settings"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
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

                      {(!matchedCandidates?.candidates || matchedCandidates.candidates.length === 0) && (
                        <tr>
                          <td colSpan={5} className="py-6 text-center text-slate-400 text-xs">
                            No students currently meet the minimum CGPA requirement ({selectedDrive.min_cgpa}).
                          </td>
                        </tr>
                      )}
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
          ) : (
            <div className="p-12 text-center text-xs text-slate-400 bg-white rounded-3xl border border-slate-200">
              Select or schedule a placement drive to view eligible candidates and applications.
            </div>
          )}
        </div>
      </div>

      {/* Schedule Drive Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900">Schedule Campus Placement Drive</h3>
              <button onClick={() => setShowCreateModal(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100">
                <X className="w-4 h-4" />
              </button>
            </div>

            {createError && (
              <div className="mt-3 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                {createError}
              </div>
            )}

            <form onSubmit={handleCreateDrive} className="mt-4 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Company Name</label>
                  <input
                    type="text"
                    required
                    value={newDrive.company_name}
                    onChange={(e) => setNewDrive({ ...newDrive, company_name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Job Role Title</label>
                  <input
                    type="text"
                    required
                    value={newDrive.job_title}
                    onChange={(e) => setNewDrive({ ...newDrive, job_title: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Min CGPA</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={newDrive.min_cgpa}
                    onChange={(e) => setNewDrive({ ...newDrive, min_cgpa: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Drive Date</label>
                  <input
                    type="date"
                    required
                    value={newDrive.drive_date}
                    onChange={(e) => setNewDrive({ ...newDrive, drive_date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Location</label>
                <input
                  type="text"
                  required
                  value={newDrive.location}
                  onChange={(e) => setNewDrive({ ...newDrive, location: e.target.value })}
                  placeholder="Campus Tech Center / Hybrid"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Required Skills (comma separated)</label>
                <input
                  type="text"
                  required
                  value={newDrive.required_skills.join(', ')}
                  onChange={(e) => setNewDrive({ ...newDrive, required_skills: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  required
                  value={newDrive.description}
                  onChange={(e) => setNewDrive({ ...newDrive, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3.5 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createSubmitting}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-md transition disabled:opacity-50"
                >
                  {createSubmitting ? 'Publishing...' : 'Publish Campus Drive'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Drive Modal */}
      {editingDrive && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900">Edit Placement Drive</h3>
              <button onClick={() => setEditingDrive(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100">
                <X className="w-4 h-4" />
              </button>
            </div>

            {editError && (
              <div className="mt-3 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                {editError}
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="mt-4 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Company Name</label>
                  <input
                    type="text"
                    required
                    value={editForm.company_name}
                    onChange={(e) => setEditForm({ ...editForm, company_name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Job Role Title</label>
                  <input
                    type="text"
                    required
                    value={editForm.job_title}
                    onChange={(e) => setEditForm({ ...editForm, job_title: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Salary Package</label>
                  <input
                    type="text"
                    required
                    value={editForm.salary_package}
                    onChange={(e) => setEditForm({ ...editForm, salary_package: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Min CGPA</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={editForm.min_cgpa}
                    onChange={(e) => setEditForm({ ...editForm, min_cgpa: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Drive Date</label>
                  <input
                    type="date"
                    required
                    value={editForm.drive_date}
                    onChange={(e) => setEditForm({ ...editForm, drive_date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Location</label>
                  <input
                    type="text"
                    required
                    value={editForm.location}
                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                  >
                    <option value="active">Active (Recruiting)</option>
                    <option value="closed">Closed / Completed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Required Skills (comma separated)</label>
                <input
                  type="text"
                  required
                  value={editForm.required_skills}
                  onChange={(e) => setEditForm({ ...editForm, required_skills: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  required
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingDrive(null)}
                  className="px-3.5 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSubmitting}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-md transition disabled:opacity-50"
                >
                  {editSubmitting ? 'Saving...' : 'Save Drive Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {driveToDelete && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-3">
              <AlertCircle className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Delete Placement Drive</h3>
            <p className="text-xs text-slate-500 mt-1">
              Are you sure you want to delete the campus recruitment drive for <strong>{driveToDelete.company_name}</strong> ({driveToDelete.job_title})? All student applications for this drive will also be cleared.
            </p>

            {deleteError && (
              <div className="mt-3 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                {deleteError}
              </div>
            )}

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDriveToDelete(null)}
                className="px-3.5 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteDrive}
                disabled={deleteSubmitting}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition disabled:opacity-50"
              >
                {deleteSubmitting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
