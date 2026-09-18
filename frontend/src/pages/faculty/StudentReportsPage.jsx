import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { MessageSquare, Send, CheckCircle2, User } from 'lucide-react';

export default function StudentReportsPage() {
  const [searchParams] = useSearchParams();
  const [students, setStudents] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(searchParams.get('student') || '');
  const [feedbackText, setFeedbackText] = useState('');
  const [actionItems, setActionItems] = useState('1. Complete Docker Microservices module\n2. Submit practical verification challenge before placement drive');
  const [statusMsg, setStatusMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await api.get('/faculty/students');
      setStudents(res.data);
      if (res.data.length > 0 && !selectedUserId) {
        setSelectedUserId(res.data[0].user_id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendFeedback = async (e) => {
    e.preventDefault();
    if (!selectedUserId || !feedbackText.trim()) return;
    setSubmitting(true);
    setStatusMsg('');
    try {
      await api.post(`/faculty/students/${selectedUserId}/feedback`, {
        feedback_text: feedbackText,
        action_items: actionItems.split('\n').filter((x) => x.trim())
      });
      setStatusMsg('Feedback & intervention action items logged successfully!');
      setFeedbackText('');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-purple-600" />
          Faculty Mentoring & Placement Guidance
        </h2>
        <p className="text-xs text-slate-500">
          Provide targeted intervention feedback and action items directly to student career dashboards
        </p>
      </div>

      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xs space-y-5">
        {statusMsg && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> {statusMsg}
          </div>
        )}

        <form onSubmit={handleSendFeedback} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Select Student</label>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white"
            >
              {students.map((st) => (
                <option key={st.id} value={st.user_id}>
                  {st.name} ({st.roll_number}) - {st.target_career_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Mentor Evaluation Note</label>
            <textarea
              rows={4}
              required
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="e.g. Alex has demonstrated solid FastAPI fundamentals. Recommended to complete the Docker verification challenge prior to the Google Cloud placement drive on Oct 15."
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Recommended Action Items (one per line)</label>
            <textarea
              rows={3}
              value={actionItems}
              onChange={(e) => setActionItems(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            />
          </div>

          <button
            type="submit"
            disabled={submitting || !feedbackText.trim()}
            className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs shadow-md shadow-purple-200 flex items-center gap-2 transition disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            {submitting ? 'Dispatching...' : 'Dispatch Mentoring Feedback'}
          </button>
        </form>
      </div>
    </div>
  );
}
