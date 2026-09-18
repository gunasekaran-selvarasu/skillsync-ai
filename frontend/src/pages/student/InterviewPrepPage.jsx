import React, { useState } from 'react';
import api from '../../services/api';
import { 
  Mic2, 
  Sparkles, 
  Send, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Award,
  Layers,
  RotateCcw
} from 'lucide-react';

export default function InterviewPrepPage() {
  const [interviewType, setInterviewType] = useState('technical');
  const [session, setSession] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answerText, setAnswerText] = useState('');
  const [evaluation, setEvaluation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [evaluating, setEvaluating] = useState(false);

  const handleStartSession = async (type = interviewType) => {
    setLoading(true);
    setEvaluation(null);
    setAnswerText('');
    try {
      const res = await api.post('/interviews/generate', {
        type: type,
        question_count: 4
      });
      setSession(res.data);
      setCurrentIdx(0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    if (!answerText.trim() || !session) return;
    setEvaluating(true);
    const currentQ = session.questions[currentIdx];
    try {
      const res = await api.post('/interviews/evaluate', {
        interview_id: session.id,
        question_id: currentQ.id,
        user_answer: answerText
      });
      setEvaluation(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setEvaluating(false);
    }
  };

  const handleNextQuestion = () => {
    if (currentIdx < (session?.questions?.length || 0) - 1) {
      setCurrentIdx(currentIdx + 1);
      setAnswerText('');
      setEvaluation(null);
    }
  };

  const currentQ = session?.questions?.[currentIdx];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Mic2 className="w-6 h-6 text-purple-600" />
            AI Mock Interview Simulator
          </h2>
          <p className="text-xs text-slate-500">
            Campus placement interview practice with real-time scoring and constructive AI feedback
          </p>
        </div>

        {/* Track Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          {['technical', 'coding', 'system_design', 'hr'].map((t) => (
            <button
              key={t}
              onClick={() => { setInterviewType(t); handleStartSession(t); }}
              className={`px-3 py-1.5 rounded-lg capitalize transition ${
                interviewType === t ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {!session ? (
        <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center mx-auto shadow-sm">
            <Mic2 className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">Launch Your Practice Session</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Choose a track above (Technical Architecture, Data Structures, System Scalability, or Behavioral HR) to simulate a real college recruitment interview.
          </p>
          <button
            onClick={() => handleStartSession()}
            disabled={loading}
            className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs shadow-md shadow-purple-200 transition disabled:opacity-50"
          >
            {loading ? 'Initializing AI Interviewer...' : 'Start Mock Interview'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Question & Answer Box */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-purple-100 text-purple-700 uppercase tracking-wider">
                Question {currentIdx + 1} of {session.questions.length} • {currentQ?.category}
              </span>
              <button
                onClick={() => handleStartSession()}
                className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Restart Track
              </button>
            </div>

            <h3 className="text-base font-bold text-slate-900 leading-snug">
              {currentQ?.question}
            </h3>

            <form onSubmit={handleSubmitAnswer} className="space-y-3">
              <textarea
                rows={7}
                required
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                placeholder="Structure your answer clearly: mention core concept, space/time trade-offs, and a practical scenario..."
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/20 leading-relaxed font-sans"
              />

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-slate-400 font-medium">
                  {answerText.length} characters typed
                </span>
                <button
                  type="submit"
                  disabled={evaluating || !answerText.trim()}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs shadow-md shadow-purple-200 flex items-center gap-2 transition disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  {evaluating ? 'AI Evaluating Response...' : 'Submit Response'}
                </button>
              </div>
            </form>
          </div>

          {/* Feedback & Score Panel */}
          <div className="space-y-4">
            {evaluation ? (
              <div className="bg-white rounded-3xl p-6 border border-purple-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Response Score</span>
                    <h4 className="text-3xl font-extrabold text-slate-900">{evaluation.score}%</h4>
                  </div>
                  <div className={`p-3 rounded-2xl ${evaluation.score >= 80 ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                    <Award className="w-8 h-8" />
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100 text-xs">
                    <p className="font-bold text-emerald-900 mb-1">Identified Strengths:</p>
                    <ul className="list-disc list-inside space-y-1 text-emerald-800">
                      {evaluation.strengths?.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-100 text-xs">
                    <p className="font-bold text-amber-900 mb-1">Areas for Improvement:</p>
                    <ul className="list-disc list-inside space-y-1 text-amber-800">
                      {evaluation.areas_for_improvement?.map((a, i) => (
                        <li key={i}>{a}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
                    <p className="font-bold text-slate-800 mb-1">Recruiter Model Benchmark:</p>
                    <p className="italic leading-relaxed">{evaluation.ideal_response_summary}</p>
                  </div>
                </div>

                {currentIdx < session.questions.length - 1 && (
                  <button
                    onClick={handleNextQuestion}
                    className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs transition mt-2"
                  >
                    Proceed to Question {currentIdx + 2} →
                  </button>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-10 border border-slate-200 text-center space-y-2">
                <Sparkles className="w-8 h-8 text-purple-400 mx-auto" />
                <p className="text-xs font-bold text-slate-700">Awaiting Your Answer</p>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  Type your reasoning in the box and submit to receive instant AI scoring, strength breakdown, and ideal response pointers.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
