import React, { useState } from 'react';
import api from '../../services/api';
import { 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  Send, 
  Award, 
  Code2, 
  AlertCircle 
} from 'lucide-react';

export default function SkillVerificationPage() {
  const [skillInput, setSkillInput] = useState('Docker Containerization');
  const [challenge, setChallenge] = useState(null);
  const [submissionText, setSubmissionText] = useState('');
  const [evaluation, setEvaluation] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [grading, setGrading] = useState(false);

  const handleRequestChallenge = async (e) => {
    e.preventDefault();
    if (!skillInput.trim()) return;
    setGenerating(true);
    setChallenge(null);
    setEvaluation(null);
    try {
      const res = await api.post(`/skills/verify?skill_name=${encodeURIComponent(skillInput)}&level=Intermediate`);
      setChallenge(res.data);
      setSubmissionText(res.data?.challenge?.sample_starter_code || '');
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmitChallenge = async (e) => {
    e.preventDefault();
    if (!challenge || !submissionText.trim()) return;
    setGrading(true);
    try {
      const res = await api.post('/skills/verify/submit', {
        verification_id: challenge.id,
        answer_text: submissionText
      });
      setEvaluation(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setGrading(false);
    }
  };

  const chData = challenge?.challenge;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-emerald-600" />
          Practical Skill Verification Engine
        </h2>
        <p className="text-xs text-slate-500">
          Section 16 adaptive challenges generating cryptographic-grade verified evidence for your profile
        </p>
      </div>

      {/* Challenge Generator Form */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
        <h3 className="font-bold text-sm text-slate-900 mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-600" /> Select Skill to Verify
        </h3>
        <form onSubmit={handleRequestChallenge} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            required
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            placeholder="Skill Name (e.g. Docker, MongoDB, FastApi, System Design)..."
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/20"
          />
          <button
            type="submit"
            disabled={generating}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-md shadow-emerald-200"
          >
            <ShieldCheck className="w-4 h-4" />
            {generating ? 'Formulating Practical Challenge...' : 'Generate Adaptive Challenge'}
          </button>
        </form>
      </div>

      {/* Active Challenge Environment */}
      {challenge && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Challenge Description */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 uppercase">
                {chData?.challenge_type || 'Practical Architecture Challenge'}
              </span>
              <span className="text-xs text-slate-400 font-semibold">{challenge.skill_name}</span>
            </div>

            <h3 className="text-base font-bold text-slate-900">{chData?.title}</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium bg-slate-50 p-4 rounded-2xl border border-slate-200/70">
              {chData?.scenario}
            </p>

            <div className="space-y-1.5 text-xs text-slate-600 pt-1">
              <p className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">Evaluation Criteria:</p>
              <ul className="list-disc list-inside space-y-1 text-slate-500">
                {chData?.evaluation_criteria?.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Code / Submission Area */}
          <div className="space-y-4">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Code2 className="w-4 h-4 text-purple-600" /> Implementation & Reasoning Submission
                </span>
              </div>

              <textarea
                rows={9}
                required
                value={submissionText}
                onChange={(e) => setSubmissionText(e.target.value)}
                placeholder="Provide your code solution, architectural explanation, and error mitigation steps..."
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-xs font-mono bg-slate-900 text-emerald-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 leading-relaxed"
              />

              <button
                onClick={handleSubmitChallenge}
                disabled={grading || !submissionText.trim()}
                className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md transition disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                {grading ? 'Evaluating Practical Correctness...' : 'Submit Practical Solution for Verification'}
              </button>
            </div>

            {/* Results */}
            {evaluation && (
              <div className={`p-6 rounded-3xl border shadow-sm space-y-3 ${
                evaluation.passed ? 'bg-emerald-50/70 border-emerald-300' : 'bg-rose-50/70 border-rose-300'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Verification Result</span>
                    <h4 className="text-2xl font-extrabold text-slate-900">
                      {evaluation.passed ? 'Skill Verified & Badge Issued!' : 'Verification Incomplete'}
                    </h4>
                  </div>
                  <div className={`px-4 py-2 rounded-2xl font-bold text-lg ${
                    evaluation.passed ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                  }`}>
                    {evaluation.score}%
                  </div>
                </div>

                <div className="text-xs text-slate-600 space-y-2 pt-1">
                  <p className="font-semibold text-slate-800">
                    Estimated Competency Level: <span className="text-purple-700">{evaluation.evaluation?.estimated_level}</span>
                  </p>
                  <div className="bg-white/80 p-3 rounded-xl border border-slate-200">
                    <p className="font-bold text-slate-700 mb-1">Strengths:</p>
                    <ul className="list-disc list-inside space-y-0.5 text-slate-600">
                      {evaluation.evaluation?.strengths?.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
