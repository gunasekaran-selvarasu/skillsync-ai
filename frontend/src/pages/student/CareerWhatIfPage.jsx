import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
  Compass, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  TrendingUp,
  RotateCcw
} from 'lucide-react';

export default function CareerWhatIfPage() {
  const [careers, setCareers] = useState([]);
  const [selectedCareerId, setSelectedCareerId] = useState('');
  const [simulation, setSimulation] = useState(null);
  const [simulating, setSimulating] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCareers();
  }, []);

  const fetchCareers = async () => {
    try {
      const res = await api.get('/careers/');
      setCareers(res.data);
      if (res.data.length > 1) {
        setSelectedCareerId(res.data[1].id);
        runSimulation(res.data[1].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const runSimulation = async (careerId) => {
    setSimulating(true);
    try {
      const res = await api.post('/careers/what-if', {
        alternative_career_id: careerId
      });
      setSimulation(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setSimulating(false);
    }
  };

  const handleSelectCareer = (e) => {
    const id = e.target.value;
    setSelectedCareerId(id);
    runSimulation(id);
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
          <Compass className="w-6 h-6 text-purple-600" />
          Career What-If Simulator
        </h2>
        <p className="text-xs text-slate-500">
          Simulate pivoting to an alternative career path and preview your transferable competencies and transition roadmap
        </p>
      </div>

      {/* Simulator Control Panel */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Select Alternate Target Career</span>
          <div className="mt-1">
            <select
              value={selectedCareerId}
              onChange={handleSelectCareer}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            >
              {careers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {simulation && (
          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Transition Readiness</span>
              <p className="text-xl font-extrabold text-emerald-600">{simulation.transition_readiness}%</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center font-bold text-sm">
              {simulation.transition_readiness}%
            </div>
          </div>
        )}
      </div>

      {simulating ? (
        <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center space-y-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="text-xs text-slate-500">Computing prerequisite knowledge graph and transferable evidence...</p>
        </div>
      ) : simulation ? (
        <div className="space-y-6">
          {/* Transition Advice Callout */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-50 via-white to-emerald-50/50 border border-purple-200 shadow-xs space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <h4 className="font-bold text-sm text-slate-900">Career Pivot Analysis</h4>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              {simulation.transition_advice}
            </p>
          </div>

          {/* Transferable vs Missing Skills */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Transferable Skills */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
              <h4 className="font-bold text-sm text-emerald-700 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Transferable Skills ({simulation.transferable_skills?.length || 0})
              </h4>
              <p className="text-xs text-slate-500">
                Skills already demonstrated in your profile that directly carry over to {simulation.alternative_career}.
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                {simulation.transferable_skills?.map((s, idx) => (
                  <span key={idx} className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-xl font-semibold">
                    ✓ {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Missing Skills */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
              <h4 className="font-bold text-sm text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> Skills Required to Bridge ({simulation.missing_skills?.length || 0})
              </h4>
              <p className="text-xs text-slate-500">
                Competencies you need to acquire and verify to become competitive for {simulation.alternative_career}.
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                {simulation.missing_skills?.map((s, idx) => (
                  <span key={idx} className="text-xs bg-rose-50 text-rose-800 border border-rose-200 px-3 py-1 rounded-xl font-semibold">
                    + {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
