import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Briefcase, Building2, Plus, DollarSign, MapPin } from 'lucide-react';

export default function CompaniesJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newJob, setNewJob] = useState({
    company_name: 'Oracle Cloud',
    title: 'Cloud Systems Developer',
    description: 'Build mission-critical cloud telemetry and database microservices.',
    experience: '0-1 years',
    eligibility_min_cgpa: 7.0,
    required_skills: ['Python', 'SQL', 'Docker', 'REST API'],
    preferred_skills: ['MongoDB', 'Linux'],
    salary_package: '15.0 LPA',
    location: 'Bangalore / Pune'
  });

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await api.get('/jobs/');
      setJobs(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateJob = async (e) => {
    e.preventDefault();
    try {
      // Create job via direct seed/post
      await api.post('/placements/drives', {
        company_name: newJob.company_name,
        job_title: newJob.title,
        description: newJob.description,
        min_cgpa: newJob.eligibility_min_cgpa,
        eligible_departments: ['CSE', 'IT'],
        required_skills: newJob.required_skills,
        salary_package: newJob.salary_package,
        drive_date: '2026-11-20',
        location: newJob.location
      });
      setShowAddModal(false);
      await fetchJobs();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-emerald-600" />
            Partner Companies & Active Job Roles
          </h2>
          <p className="text-xs text-slate-500">
            Corporate recruitment partners and active job specifications
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(!showAddModal)}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-200 transition"
        >
          <Plus className="w-4 h-4" /> Add Partner Job Opening
        </button>
      </div>

      {showAddModal && (
        <div className="bg-white rounded-3xl p-6 border-2 border-emerald-300 shadow-xl space-y-4">
          <h3 className="font-bold text-sm text-slate-900">Add Company Job Role</h3>
          <form onSubmit={handleCreateJob} className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Company</label>
                <input
                  type="text"
                  required
                  value={newJob.company_name}
                  onChange={(e) => setNewJob({ ...newJob, company_name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Role Title</label>
                <input
                  type="text"
                  required
                  value={newJob.title}
                  onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Salary</label>
                <input
                  type="text"
                  required
                  value={newJob.salary_package}
                  onChange={(e) => setNewJob({ ...newJob, salary_package: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
              <textarea
                rows={2}
                value={newJob.description}
                onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
              />
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-md transition"
            >
              Save Job Opening
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {jobs.map((j) => (
          <div key={j.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md">
                  {j.company_name}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">{j.title}</h3>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-xl">
                {j.salary_package}
              </span>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">{j.description}</p>

            <div className="flex flex-wrap gap-1.5 pt-2">
              {j.required_skills?.map((sk, i) => (
                <span key={i} className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium">
                  {sk}
                </span>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>📍 {j.location}</span>
              <span>Min CGPA: {j.eligibility_min_cgpa}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
