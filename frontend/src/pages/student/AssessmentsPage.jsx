import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
  Award, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  HelpCircle,
  Sparkles
} from 'lucide-react';

export default function AssessmentsPage() {
  const [assessments, setAssessments] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    try {
      const res = await api.get('/assessments/');
      setAssessments(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartTest = async (assessmentId) => {
    try {
      const res = await api.post(`/assessments/${assessmentId}/start`);
      setActiveSession(res.data);
      setAnswers({});
      setCurrentQIndex(0);
      setResult(null);
    } catch (err) {
      console.error('Failed to start assessment:', err);
    }
  };

  const handleSelectOption = (questionId, optionIndex) => {
    setAnswers({ ...answers, [questionId]: optionIndex });
  };

  const handleSubmitTest = async () => {
    if (!activeSession) return;
    setSubmitting(true);
    try {
      const res = await api.post(`/assessments/${activeSession.assessment_title}/submit`, {
        attempt_id: activeSession.attempt_id,
        answers: answers
      });
      setResult(res.data);
      setActiveSession(null);
    } catch (err) {
      console.error('Submission failed:', err);
    } finally {
      setSubmitting(false);
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
      <div>
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Award className="w-6 h-6 text-purple-600" />
          Placement Readiness Skill Assessments
        </h2>
        <p className="text-xs text-slate-500">
          Standardized skill tests validating core competencies for campus recruiting
        </p>
      </div>

      {/* Result Display Banner */}
      {result && (
        <div className={`p-6 rounded-3xl border shadow-md space-y-4 ${
          result.passed ? 'bg-emerald-50/70 border-emerald-300' : 'bg-rose-50/70 border-rose-300'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg ${
                result.passed ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
              }`}>
                {result.score_percentage}%
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  {result.passed ? 'Assessment Passed! Verified Skill Evidence Logged' : 'Needs Further Preparation'}
                </h3>
                <p className="text-xs text-slate-600">
                  {result.correct_answers} of {result.total_questions} questions answered correctly.
                </p>
              </div>
            </div>
            <button
              onClick={() => setResult(null)}
              className="px-4 py-2 rounded-xl bg-white border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Close Results
            </button>
          </div>

          <div className="space-y-2.5 pt-2">
            {result.details?.map((d, i) => (
              <div key={i} className="p-3.5 rounded-2xl bg-white border border-slate-200/80 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-slate-800">Q{i+1}: {d.question}</p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    d.is_correct ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {d.is_correct ? 'CORRECT' : 'INCORRECT'}
                  </span>
                </div>
                <p className="text-slate-500 italic font-medium"><span className="text-purple-600">Rationale:</span> {d.explanation}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Assessment Room */}
      {activeSession ? (
        <div className="bg-white rounded-3xl p-8 border border-purple-200 shadow-lg shadow-purple-100/50 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <span className="text-[11px] font-bold text-purple-600 bg-purple-50 px-3 py-1 rounded-full uppercase">
                Active Assessment Session
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-1">{activeSession.assessment_title}</h3>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl">
              <Clock className="w-4 h-4" />
              <span>{activeSession.duration_minutes} Minutes Allotted</span>
            </div>
          </div>

          {/* Current Question */}
          {activeSession.questions && activeSession.questions.length > 0 && (
            <div className="space-y-5">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Question {currentQIndex + 1} of {activeSession.questions.length}</span>
                <span>ID: {activeSession.questions[currentQIndex]?.id}</span>
              </div>

              <h4 className="text-base font-bold text-slate-900 leading-snug">
                {activeSession.questions[currentQIndex]?.question}
              </h4>

              <div className="space-y-2.5">
                {activeSession.questions[currentQIndex]?.options?.map((opt, optIdx) => {
                  const currentQId = activeSession.questions[currentQIndex]?.id;
                  const isSelected = answers[currentQId] === optIdx;

                  return (
                    <div
                      key={optIdx}
                      onClick={() => handleSelectOption(currentQId, optIdx)}
                      className={`p-4 rounded-2xl border cursor-pointer transition flex items-center justify-between text-xs font-medium ${
                        isSelected 
                          ? 'bg-purple-50 border-purple-400 text-purple-900 shadow-xs' 
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span>{opt}</span>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        isSelected ? 'border-purple-600 bg-purple-600' : 'border-slate-300'
                      }`}>
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  disabled={currentQIndex === 0}
                  onClick={() => setCurrentQIndex(currentQIndex - 1)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition disabled:opacity-40"
                >
                  Previous
                </button>

                {currentQIndex < activeSession.questions.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentQIndex(currentQIndex + 1)}
                    className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    Next Question <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={handleSubmitTest}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md transition disabled:opacity-50"
                  >
                    {submitting ? 'Evaluating...' : 'Submit Assessment'}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Assessment Listing */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {assessments.map((a) => (
            <div key={a.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700 uppercase">
                    {a.difficulty}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {a.duration_minutes} mins
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-sm">{a.title}</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Tests application layer performance, microservices, and database query optimization.
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">{a.total_questions || 5} Questions</span>
                <button
                  onClick={() => handleStartTest(a.id)}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs transition flex items-center gap-1"
                >
                  Start Test <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
