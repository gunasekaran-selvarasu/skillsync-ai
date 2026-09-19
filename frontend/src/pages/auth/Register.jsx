import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../stores/authContext';
import api from '../../services/api';
import { Sparkles, ArrowRight, ShieldAlert, GraduationCap } from 'lucide-react';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [graduationYear, setGraduationYear] = useState(2026);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/signup', {
        name,
        email,
        password,
        role: 'student',
        roll_number: rollNumber,
        graduation_year: Number(graduationYear)
      });
      // Auto-login as student
      const user = await login(email, password);
      navigate('/student/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create student account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-purple-600 text-white shadow-xl shadow-purple-200 mb-3">
          <GraduationCap className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Student Registration</h2>
        <p className="mt-1 text-xs text-slate-500">
          Create your student account for Apex Institute of Technology
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/50 rounded-2xl border border-slate-100 sm:px-10">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Morgan"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">College Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@apex.edu"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Roll Number</label>
                <input
                  type="text"
                  required
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  placeholder="CS2026-042"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Graduation Year</label>
                <input
                  type="number"
                  required
                  value={graduationYear}
                  onChange={(e) => setGraduationYear(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm shadow-md shadow-purple-200 flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              {loading ? 'Creating student account...' : 'Complete Student Registration'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Privileged access notice */}
          <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600 flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
            <span>
              <strong>Faculty or Admin?</strong> Institutional staff accounts are provisioned directly by the College Administration. Please sign in with your assigned credentials.
            </span>
          </div>

          <p className="mt-4 text-center text-xs text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-purple-600 hover:text-purple-700">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

