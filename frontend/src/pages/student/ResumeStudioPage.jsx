import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
  FileText, 
  UploadCloud, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  Award,
  Layers,
  FileCheck
} from 'lucide-react';

export default function ResumeStudioPage() {
  const [activeTab, setActiveTab] = useState('analyzer'); // 'analyzer' | 'builder'
  const [resumes, setResumes] = useState([]);
  const [selectedResume, setSelectedResume] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);

  // Builder state
  const [builderForm, setBuilderForm] = useState({
    title: 'Alex Morgan - Placement Resume',
    full_name: 'Alex Morgan',
    email: 'alex.morgan@skillsync.ai',
    phone: '+91 98765 43210',
    summary: 'High-performing Computer Science senior specializing in scalable backend APIs, distributed microservices, and React. Looking for entry-level Software Development Engineer roles.',
    skills: ['Python', 'FastAPI', 'MongoDB', 'React', 'Docker', 'Git & CI/CD', 'Data Structures'],
    experience: [
      {
        title: 'Backend Engineering Intern',
        company: 'CloudScale Labs',
        description: 'Engineered high-throughput REST APIs using FastAPI and MongoDB, reducing average response latency by 24% across 10k daily active sessions.'
      }
    ],
    projects: [
      {
        name: 'SkillSync AI Placement Platform',
        description: 'Architected full-stack career intelligence system with JWT authentication, Motor MongoDB async pipeline, and structured LLM agents.'
      }
    ]
  });
  const [savingBuilder, setSavingBuilder] = useState(false);

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      const res = await api.get('/resumes/');
      setResumes(res.data);
      if (res.data.length > 0 && !selectedResume) {
        setSelectedResume(res.data[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await api.post('/resumes/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSelectedResume(res.data);
      setFile(null);
      await fetchResumes();
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleSaveBuilder = async () => {
    setSavingBuilder(true);
    try {
      const res = await api.post('/resumes/build', builderForm);
      setSelectedResume(res.data);
      setActiveTab('analyzer');
      await fetchResumes();
    } catch (err) {
      console.error(err);
    } finally {
      setSavingBuilder(false);
    }
  };

  const analysis = selectedResume?.analysis;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header with Mode Switcher */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-purple-600" />
            Resume Studio & ATS Analyzer
          </h2>
          <p className="text-xs text-slate-500">
            AI-driven ATS keyword optimization, evidence extraction, and live resume builder
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab('analyzer')}
            className={`px-4 py-2 rounded-lg transition ${
              activeTab === 'analyzer' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ATS Resume Analyzer
          </button>
          <button
            onClick={() => setActiveTab('builder')}
            className={`px-4 py-2 rounded-lg transition ${
              activeTab === 'builder' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Interactive Builder
          </button>
        </div>
      </div>

      {activeTab === 'analyzer' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upload & Past Resumes Column */}
          <div className="space-y-6">
            {/* Upload Box */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
              <h3 className="font-bold text-sm text-slate-900 mb-3 flex items-center gap-2">
                <UploadCloud className="w-4 h-4 text-purple-600" />
                Upload Resume (PDF / DOCX)
              </h3>
              <form onSubmit={handleFileUpload} className="space-y-3">
                <div className="border-2 border-dashed border-slate-200 hover:border-purple-300 rounded-2xl p-5 text-center cursor-pointer transition">
                  <input
                    type="file"
                    accept=".pdf,.docx,.doc,.txt"
                    onChange={(e) => setFile(e.target.files[0])}
                    className="block w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 cursor-pointer"
                  />
                  {file && <p className="text-xs font-semibold text-emerald-600 mt-2">Selected: {file.name}</p>}
                </div>
                <button
                  type="submit"
                  disabled={!file || uploading}
                  className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  {uploading ? 'Analyzing Document...' : 'Run ATS Audit'}
                </button>
              </form>
            </div>

            {/* Past Uploads */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
              <h3 className="font-bold text-sm text-slate-900 mb-3">Saved Resumes</h3>
              {resumes.length === 0 ? (
                <p className="text-xs text-slate-400">No resumes uploaded yet.</p>
              ) : (
                <div className="space-y-2">
                  {resumes.map((r) => (
                    <div
                      key={r.id}
                      onClick={() => setSelectedResume(r)}
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition flex items-center justify-between ${
                        selectedResume?.id === r.id ? 'bg-purple-50 border-purple-300 font-semibold text-purple-900' : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <span className="truncate max-w-[180px]">{r.title}</span>
                      <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full text-slate-600">
                        {r.analysis?.ats_score ? `${r.analysis.ats_score}% ATS` : 'Analyzed'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Analysis Results Column */}
          <div className="lg:col-span-2 space-y-6">
            {analysis ? (
              <>
                {/* Score Banner */}
                <div className="bg-gradient-to-r from-purple-700 to-indigo-900 rounded-3xl p-6 text-white shadow-xl flex items-center justify-between">
                  <div>
                    <span className="text-xs bg-white/20 px-3 py-1 rounded-full font-semibold uppercase tracking-wider">
                      Overall ATS Compatibility
                    </span>
                    <h3 className="text-3xl font-extrabold mt-2">{analysis.ats_score}%</h3>
                    <p className="text-xs text-purple-200 mt-1">
                      Placement screening filter estimate for tier-1 IT & Product companies.
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-center bg-white/10 p-3 rounded-2xl border border-white/10">
                    <div>
                      <p className="text-[10px] text-purple-200">Keywords</p>
                      <p className="text-sm font-bold">{analysis.skills_score || 85}%</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-purple-200">Format</p>
                      <p className="text-sm font-bold">{analysis.summary_score || 80}%</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-purple-200">Impact</p>
                      <p className="text-sm font-bold">{analysis.impact_score || 70}%</p>
                    </div>
                  </div>
                </div>

                {/* Detected vs Missing Skills */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-2xl p-5 border border-slate-200">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-emerald-700 mb-3 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> Detected Skills in Resume
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {analysis.detected_skills?.map((s, idx) => (
                        <span key={idx} className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-lg font-medium">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-5 border border-slate-200">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-rose-700 mb-3 flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4" /> Missing Keywords For Role
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {analysis.missing_skills?.map((s, idx) => (
                        <span key={idx} className="text-xs bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-1 rounded-lg font-medium">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* AI Improvement Recommendations */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
                  <h4 className="font-bold text-sm text-slate-900 mb-4 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    Section-by-Section ATS Action Items
                  </h4>

                  <div className="space-y-3">
                    {analysis.recommendations?.map((rec, idx) => (
                      <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">{rec.section}</span>
                          <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-semibold">Priority Fix</span>
                        </div>
                        <p className="text-xs font-semibold text-slate-800"><span className="text-slate-500">Issue:</span> {rec.issue}</p>
                        <p className="text-xs text-emerald-700 font-medium"><span className="text-slate-500">Action:</span> {rec.suggested_improvement}</p>
                        <p className="text-[11px] text-slate-400 italic"><span className="font-semibold">Why:</span> {rec.reason}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center space-y-3">
                <FileCheck className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="font-bold text-slate-700">No Resume Analyzed Yet</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Upload your existing resume in PDF or DOCX format or build one using our interactive builder to get an automated ATS screening report.
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Builder Mode */
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Interactive Resume Builder</h3>
              <p className="text-xs text-slate-500">Generate clean ATS-compliant resume schemas</p>
            </div>
            <button
              onClick={handleSaveBuilder}
              disabled={savingBuilder}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs flex items-center gap-2 transition disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              {savingBuilder ? 'Synthesizing...' : 'Save & Analyze Resume'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                value={builderForm.full_name}
                onChange={(e) => setBuilderForm({ ...builderForm, full_name: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={builderForm.email}
                onChange={(e) => setBuilderForm({ ...builderForm, email: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Professional Summary</label>
            <textarea
              rows={3}
              value={builderForm.summary}
              onChange={(e) => setBuilderForm({ ...builderForm, summary: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Skills (comma separated)</label>
            <input
              type="text"
              value={builderForm.skills.join(', ')}
              onChange={(e) => setBuilderForm({ ...builderForm, skills: e.target.value.split(',').map((s) => s.trim()) })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
            />
          </div>
        </div>
      )}
    </div>
  );
}
