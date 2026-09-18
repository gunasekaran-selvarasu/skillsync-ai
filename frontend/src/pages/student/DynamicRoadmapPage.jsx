import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
  Map, 
  RotateCw, 
  CheckCircle2, 
  Clock, 
  Circle, 
  ArrowRight, 
  Layers, 
  Sparkles,
  Award
} from 'lucide-react';

export default function DynamicRoadmapPage() {
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);

  useEffect(() => {
    fetchRoadmap();
  }, []);

  const fetchRoadmap = async () => {
    try {
      const res = await api.get('/roadmaps/');
      setRoadmap(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTask = async (taskId, currentStatus) => {
    const nextStatus = currentStatus === 'completed' ? 'todo' : (currentStatus === 'todo' ? 'in_progress' : 'completed');
    try {
      await api.put(`/roadmaps/task/${taskId}`, { status: nextStatus });
      await fetchRoadmap();
    } catch (err) {
      console.error('Failed to update task:', err);
    }
  };

  const handleRecalculate = async () => {
    setRecalculating(true);
    try {
      const res = await api.post('/roadmaps/recalculate');
      setRoadmap(res.data.roadmap);
    } catch (err) {
      console.error(err);
    } finally {
      setRecalculating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const phases = roadmap?.phases || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Map className="w-6 h-6 text-purple-600" />
            Dynamic Career Roadmap
          </h2>
          <p className="text-xs text-slate-500">
            Automated progression path for <span className="font-semibold text-slate-800">{roadmap?.career || 'Full Stack Developer'}</span> • Version {roadmap?.version || 1}
          </p>
        </div>

        <button
          onClick={handleRecalculate}
          disabled={recalculating}
          className="px-4 py-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold text-xs flex items-center gap-2 border border-purple-200 transition disabled:opacity-50"
        >
          <RotateCw className={`w-3.5 h-3.5 ${recalculating ? 'animate-spin' : ''}`} />
          {recalculating ? 'Recalculating...' : 'Recalculate with Latest Evidence'}
        </button>
      </div>

      {/* Phased Roadmap Timeline */}
      <div className="space-y-6">
        {phases.map((phase, pIdx) => (
          <div key={pIdx} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100">
              <span className="w-8 h-8 rounded-xl bg-purple-600 text-white font-bold text-sm flex items-center justify-center shadow-xs">
                {phase.phase}
              </span>
              <div>
                <h3 className="font-bold text-slate-900 text-base">{phase.title}</h3>
                <p className="text-xs text-slate-500">{phase.focus}</p>
              </div>
            </div>

            <div className="space-y-3">
              {phase.tasks?.map((task) => {
                const isCompleted = task.status === 'completed';
                const isInProgress = task.status === 'in_progress';

                return (
                  <div
                    key={task.id}
                    onClick={() => handleToggleTask(task.id, task.status)}
                    className={`p-4 rounded-2xl border transition cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                      isCompleted
                        ? 'bg-emerald-50/50 border-emerald-200 hover:border-emerald-300'
                        : (isInProgress 
                            ? 'bg-purple-50/40 border-purple-300 hover:border-purple-400 shadow-xs' 
                            : 'bg-slate-50/60 border-slate-200 hover:border-slate-300')
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      <button 
                        type="button" 
                        className="mt-0.5 flex-shrink-0"
                        title="Click to toggle status"
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        ) : isInProgress ? (
                          <Clock className="w-5 h-5 text-purple-600 animate-pulse" />
                        ) : (
                          <Circle className="w-5 h-5 text-slate-300 hover:text-slate-400" />
                        )}
                      </button>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className={`text-sm font-bold ${isCompleted ? 'text-emerald-950 line-through opacity-80' : 'text-slate-900'}`}>
                            {task.task}
                          </h4>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                            {task.difficulty}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          <span className="font-medium text-slate-700">Why:</span> {task.reason}
                        </p>
                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 mt-2">
                          <span>⏱️ {task.estimated_effort}</span>
                          <span>• Target Skill: <span className="font-semibold text-slate-600">{task.skill}</span></span>
                          <span>• Verification: {task.verification_method}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-center">
                      <span className={`text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                        isCompleted 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : (isInProgress ? 'bg-purple-100 text-purple-700' : 'bg-slate-200 text-slate-600')
                      }`}>
                        {task.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
