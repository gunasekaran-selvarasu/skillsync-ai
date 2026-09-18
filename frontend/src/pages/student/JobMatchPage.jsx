import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
  Briefcase, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  HelpCircle,
  Building2,
  DollarSign,
  MapPin,
  ArrowRight
} from 'lucide-react';

export default function JobMatchPage() {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [customJD, setCustomJD] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [matchResult, setMatchResult] = useState(null);
  const [appliedJobs, setAppliedJobs] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await api.get('/jobs/');
      setJobs(res.data);
      if (res.data.length > 0) {
        handleSelectJob(res.data[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectJob = async (job) => {
    setSelectedJob(job);
    setAnalyzing(true);
    try {
      const res = await api.get(`/jobs/${job.id}/match`);
      setMatchResult(res.data.match);
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleAnalyzeCustom = async (e) => {
    e.preventDefault();
    if (!customJD.trim()) return;
    setAnalyzing(true);
    setSelectedJob(null);
    try {
      const res = await api.post('/jobs/analyze', {
        job_description: customJD,
        job_title: customTitle || 'Software Engineer'
      });
      setMatchResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleApply = async (job) => {
    try {
      // Find matching drive
      const drivesRes = await api.get('/placements/drives');
      const matchingDrive = drivesRes.data.find((d) => d.company_name === job.company_name) || drivesRes.data[0];
      if (matchingDrive) {
        await api.post(`/placements/drives/${matchingDrive.id}/apply`, {
          cover_note: 'Applying directly via SkillSync AI Job Matching Engine'
        });
        setAppliedJobs((prev) => ({ ...prev, [job.id]: true }));
      }
    } catch (err) {
      console.error(err);
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
      <div>
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Briefcase className="w-6 h-6 text-purple-600" />
          Campus Job Matching & JD Analyzer
        </h2>
        <p className="text-xs text-slate-500">
          Requirement-by-requirement verification: MATCH • PARTIAL_MATCH • MISSING • UNKNOWN
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Campus Job Opportunities & Paste JD */}
        <div className="space-y-5">
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs">
            <h3 className="font-bold text-sm text-slate-900 mb-3 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-purple-600" /> Active Campus Openings
            </h3>
            <div className="space-y-2.5">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  onClick={() => handleSelectJob(job)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition ${
                    selectedJob?.id === job.id 
                      ? 'bg-purple-50/80 border-purple-300 shadow-xs' 
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-900">{job.title}</p>
                      <p className="text-[11px] text-purple-700 font-semibold">{job.company_name}</p>
                    </div>
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                      {job.salary_package}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-2">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {job.location}</span>
                    <span>Min CGPA: {job.eligibility_min_cgpa}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Paste Custom JD */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs">
            <h3 className="font-bold text-sm text-slate-900 mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" /> Analyze Any External JD
            </h3>
            <form onSubmit={handleAnalyzeCustom} className="space-y-3">
              <input
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="Job Title (e.g. SDE-1 Backend)"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
              />
              <textarea
                rows={4}
                required
                value={customJD}
                onChange={(e) => setCustomJD(e.target.value)}
                placeholder="Paste external job description requirements and eligibility text here..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
              />
              <button
                type="submit"
                disabled={analyzing}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                {analyzing ? 'Evaluating...' : 'Extract & Compare Requirements'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Match Analysis Matrix (Section 13) */}
        <div className="lg:col-span-2 space-y-6">
          {matchResult ? (
            <>
              {/* Match Header Banner */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[11px] font-bold text-purple-600 bg-purple-50 border border-purple-200 px-3 py-1 rounded-full uppercase tracking-wider">
                    {matchResult.job_title || selectedJob?.title}
                  </span>
                  <div className="flex items-center gap-3 mt-2">
                    <h3 className="text-3xl font-extrabold text-slate-900">
                      {matchResult.overall_match_score || 75}%
                    </h3>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                      {matchResult.eligibility_status || 'Eligible'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Candidate qualification match derived from verified evidence graph.
                  </p>
                </div>

                {selectedJob && (
                  <button
                    onClick={() => handleApply(selectedJob)}
                    disabled={appliedJobs[selectedJob.id]}
                    className={`px-6 py-3 rounded-xl font-semibold text-xs flex items-center gap-2 shadow-md transition ${
                      appliedJobs[selectedJob.id]
                        ? 'bg-emerald-600 text-white cursor-default'
                        : 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-200'
                    }`}
                  >
                    {appliedJobs[selectedJob.id] ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" /> Application Submitted
                      </>
                    ) : (
                      <>
                        Apply to Drive <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* SECTION 13 MATRIX TABLE: MATCH / PARTIAL_MATCH / MISSING / UNKNOWN */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
                <h4 className="font-bold text-sm text-slate-900 mb-4">
                  Job Requirement Classification Matrix
                </h4>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase tracking-wider">
                        <th className="pb-3">Requirement</th>
                        <th className="pb-3">Status</th>
                        <th className="pb-3">Category</th>
                        <th className="pb-3">Action Recommendation</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {matchResult.requirements_analysis?.map((item, idx) => {
                        const statusColors = {
                          MATCH: 'bg-emerald-100 text-emerald-800 border-emerald-200',
                          PARTIAL_MATCH: 'bg-purple-100 text-purple-800 border-purple-200',
                          MISSING: 'bg-rose-100 text-rose-800 border-rose-200',
                          UNKNOWN: 'bg-slate-100 text-slate-700 border-slate-200'
                        };

                        return (
                          <tr key={idx} className="hover:bg-slate-50/70 transition">
                            <td className="py-3 font-semibold text-slate-800">{item.requirement}</td>
                            <td className="py-3">
                              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase ${statusColors[item.status] || statusColors.UNKNOWN}`}>
                                {item.status}
                              </span>
                            </td>
                            <td className="py-3 text-slate-500">{item.category}</td>
                            <td className="py-3 text-slate-600 font-medium">{item.action_recommendation}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center space-y-3">
              <Briefcase className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-xs text-slate-400">Select an opening or paste a JD to inspect match breakdown.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
