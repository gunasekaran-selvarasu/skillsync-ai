import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
  Briefcase, 
  Building2, 
  Plus, 
  DollarSign, 
  MapPin, 
  Edit2, 
  Trash2, 
  X, 
  Search, 
  AlertCircle 
} from 'lucide-react';

export default function CompaniesJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Add Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newJob, setNewJob] = useState({
    company_name: '',
    title: '',
    description: '',
    experience: '0-2 years',
    eligibility_min_cgpa: 7.0,
    required_skills: 'Python, Docker, SQL',
    salary_package: '12.0 LPA',
    location: 'Bangalore / Hybrid'
  });
  const [addError, setAddError] = useState('');
  const [addSubmitting, setAddSubmitting] = useState(false);

  // Edit Modal
  const [editingJob, setEditingJob] = useState(null);
  const [editForm, setEditForm] = useState({
    company_name: '',
    title: '',
    description: '',
    experience: '',
    eligibility_min_cgpa: 7.0,
    required_skills: '',
    salary_package: '',
    location: '',
    status: 'active'
  });
  const [editError, setEditError] = useState('');
  const [editSubmitting, setEditSubmitting] = useState(false);

  // Delete Modal
  const [jobToDelete, setJobToDelete] = useState(null);
  const [deleteError, setDeleteError] = useState('');
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await api.get('/jobs/');
      setJobs(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Create Job
  const handleCreateJob = async (e) => {
    e.preventDefault();
    setAddError('');
    setAddSubmitting(true);
    try {
      const skillsArray = typeof newJob.required_skills === 'string'
        ? newJob.required_skills.split(',').map(s => s.trim()).filter(Boolean)
        : newJob.required_skills;

      await api.post('/jobs/', {
        company_name: newJob.company_name,
        title: newJob.title,
        description: newJob.description,
        experience: newJob.experience,
        eligibility_min_cgpa: Number(newJob.eligibility_min_cgpa),
        required_skills: skillsArray,
        salary_package: newJob.salary_package,
        location: newJob.location
      });

      setShowAddModal(false);
      setNewJob({
        company_name: '',
        title: '',
        description: '',
        experience: '0-2 years',
        eligibility_min_cgpa: 7.0,
        required_skills: 'Python, Docker, SQL',
        salary_package: '12.0 LPA',
        location: 'Bangalore / Hybrid'
      });
      await fetchJobs();
    } catch (err) {
      setAddError(err.response?.data?.detail || 'Failed to create job posting');
    } finally {
      setAddSubmitting(false);
    }
  };

  // Open Edit Modal
  const openEditModal = (job) => {
    setEditingJob(job);
    setEditError('');
    setEditForm({
      company_name: job.company_name || '',
      title: job.title || '',
      description: job.description || '',
      experience: job.experience || '0-2 years',
      eligibility_min_cgpa: job.eligibility_min_cgpa ?? 7.0,
      required_skills: Array.isArray(job.required_skills) ? job.required_skills.join(', ') : '',
      salary_package: job.salary_package || '',
      location: job.location || '',
      status: job.status || 'active'
    });
  };

  // Save Edited Job
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingJob) return;
    setEditError('');
    setEditSubmitting(true);
    try {
      const skillsArray = typeof editForm.required_skills === 'string'
        ? editForm.required_skills.split(',').map(s => s.trim()).filter(Boolean)
        : editForm.required_skills;

      await api.put(`/jobs/${editingJob.id}`, {
        company_name: editForm.company_name,
        title: editForm.title,
        description: editForm.description,
        experience: editForm.experience,
        eligibility_min_cgpa: Number(editForm.eligibility_min_cgpa),
        required_skills: skillsArray,
        salary_package: editForm.salary_package,
        location: editForm.location,
        status: editForm.status
      });

      setEditingJob(null);
      await fetchJobs();
    } catch (err) {
      setEditError(err.response?.data?.detail || 'Failed to update job posting');
    } finally {
      setEditSubmitting(false);
    }
  };

  // Delete Job
  const handleDeleteJob = async () => {
    if (!jobToDelete) return;
    setDeleteError('');
    setDeleteSubmitting(true);
    try {
      await api.delete(`/jobs/${jobToDelete.id}`);
      setJobToDelete(null);
      await fetchJobs();
    } catch (err) {
      setDeleteError(err.response?.data?.detail || 'Failed to delete job posting');
    } finally {
      setDeleteSubmitting(false);
    }
  };

  const filteredJobs = jobs.filter((j) => {
    const q = searchTerm.toLowerCase();
    return (
      j.title?.toLowerCase().includes(q) ||
      j.company_name?.toLowerCase().includes(q) ||
      j.location?.toLowerCase().includes(q) ||
      j.required_skills?.some(s => s.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-emerald-600" />
            Partner Companies & Active Job Roles
          </h2>
          <p className="text-xs text-slate-500">
            Create, edit, and manage corporate recruitment partner job specifications
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search companies, roles, skills..."
              className="pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 w-64"
            />
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-200 transition shrink-0"
          >
            <Plus className="w-4 h-4" /> Add Partner Job Opening
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredJobs.map((j) => (
            <div key={j.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4 hover:shadow-md transition flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-2.5 py-0.5 rounded-md">
                      {j.company_name}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-1">{j.title}</h3>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-xl shrink-0">
                    {j.salary_package}
                  </span>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">{j.description}</p>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {j.required_skills?.map((sk, i) => (
                    <span key={i} className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium">
                      {sk}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="text-[11px] text-slate-400 space-y-0.5">
                  <div>📍 {j.location}</div>
                  <div>Min CGPA: <span className="font-semibold text-slate-600">{j.eligibility_min_cgpa}</span></div>
                </div>

                {/* Edit & Delete Action Buttons */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openEditModal(j)}
                    className="p-2 rounded-xl text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition"
                    title="Edit Job Details"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setJobToDelete(j);
                      setDeleteError('');
                    }}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                    title="Delete Job"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filteredJobs.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-400 text-xs">
              No matching company job postings found.
            </div>
          )}
        </div>
      )}

      {/* Add Job Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Add Partner Job Role</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100">
                <X className="w-4 h-4" />
              </button>
            </div>

            {addError && (
              <div className="mt-3 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                {addError}
              </div>
            )}

            <form onSubmit={handleCreateJob} className="mt-4 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Company Name</label>
                  <input
                    type="text"
                    required
                    value={newJob.company_name}
                    onChange={(e) => setNewJob({ ...newJob, company_name: e.target.value })}
                    placeholder="Google Cloud"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Role Title</label>
                  <input
                    type="text"
                    required
                    value={newJob.title}
                    onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                    placeholder="Cloud Software Engineer"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Salary Package</label>
                  <input
                    type="text"
                    required
                    value={newJob.salary_package}
                    onChange={(e) => setNewJob({ ...newJob, salary_package: e.target.value })}
                    placeholder="18.0 LPA"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Min CGPA</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={newJob.eligibility_min_cgpa}
                    onChange={(e) => setNewJob({ ...newJob, eligibility_min_cgpa: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Location</label>
                  <input
                    type="text"
                    required
                    value={newJob.location}
                    onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
                    placeholder="Bangalore / Hybrid"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Required Skills (comma separated)</label>
                <input
                  type="text"
                  required
                  value={newJob.required_skills}
                  onChange={(e) => setNewJob({ ...newJob, required_skills: e.target.value })}
                  placeholder="Python, FastAPI, Docker, Kubernetes"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  required
                  value={newJob.description}
                  onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                  placeholder="Describe role responsibilities and criteria..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addSubmitting}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition disabled:opacity-50"
                >
                  {addSubmitting ? 'Publishing...' : 'Publish Job Opening'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Job Modal */}
      {editingJob && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Edit Partner Job Role</h3>
              <button onClick={() => setEditingJob(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100">
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
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Role Title</label>
                  <input
                    type="text"
                    required
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
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
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Min CGPA</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={editForm.eligibility_min_cgpa}
                    onChange={(e) => setEditForm({ ...editForm, eligibility_min_cgpa: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Location</label>
                  <input
                    type="text"
                    required
                    value={editForm.location}
                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Required Skills (comma separated)</label>
                <input
                  type="text"
                  required
                  value={editForm.required_skills}
                  onChange={(e) => setEditForm({ ...editForm, required_skills: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  required
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                >
                  <option value="active">Active (Open)</option>
                  <option value="closed">Closed / Inactive</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingJob(null)}
                  className="px-3.5 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSubmitting}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition disabled:opacity-50"
                >
                  {editSubmitting ? 'Saving...' : 'Save Job Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {jobToDelete && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-3">
              <AlertCircle className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Delete Job Opening</h3>
            <p className="text-xs text-slate-500 mt-1">
              Are you sure you want to delete <strong>{jobToDelete.title}</strong> at <strong>{jobToDelete.company_name}</strong>? This action cannot be undone.
            </p>

            {deleteError && (
              <div className="mt-3 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                {deleteError}
              </div>
            )}

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setJobToDelete(null)}
                className="px-3.5 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteJob}
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
