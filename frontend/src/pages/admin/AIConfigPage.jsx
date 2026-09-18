import React, { useState } from 'react';
import api from '../../services/api';
import { Settings2, Cpu, Sparkles, CheckCircle2, ShieldAlert, History } from 'lucide-react';

export default function AIConfigPage() {
  const [provider, setProvider] = useState('claude');
  const [modelName, setModelName] = useState('claude-3-5-sonnet-20241022');
  const [temperature, setTemperature] = useState(0.2);
  const [promptVersion, setPromptVersion] = useState('v2.4-production');
  const [statusMsg, setStatusMsg] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSaveConfig = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatusMsg('');
    try {
      await api.post('/admin/ai-config', {
        provider,
        model_name: modelName,
        temperature: parseFloat(temperature),
        active_prompt_version: promptVersion
      });
      setStatusMsg('AI Orchestrator runtime configuration updated successfully!');
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const prompts = [
    { name: 'Section 11 — Master AI Career Agent', version: 'v2.4', target: 'Context analysis & career twin synthesis' },
    { name: 'Section 12 — Resume Analyzer Prompt', version: 'v2.4', target: 'ATS keyword coverage & section critique' },
    { name: 'Section 13 — Job Description Analyzer', version: 'v2.4', target: 'Requirement matrix (MATCH / MISSING)' },
    { name: 'Section 14 — Next Learning Task Prompt', version: 'v2.4', target: 'Prioritized singular next learning action' },
    { name: 'Section 15 — Project Generator Prompt', version: 'v2.4', target: 'Gap-closing portfolio microservice' },
    { name: 'Section 16 — Skill Verification Engine', version: 'v2.4', target: 'Practical adaptive architecture challenge' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Settings2 className="w-6 h-6 text-emerald-600" />
          AI Orchestrator & Prompt Versioning
        </h2>
        <p className="text-xs text-slate-500">
          Configure model parameters, deterministic fallback policies, and inspect active prompt versions
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Settings Form */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-emerald-600" /> AI Provider & Parameters
          </h3>

          {statusMsg && (
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> {statusMsg}
            </div>
          )}

          <form onSubmit={handleSaveConfig} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Primary LLM Provider</label>
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-white"
              >
                <option value="claude">Anthropic Claude (High-Fidelity Cloud API)</option>
                <option value="ollama">Local Ollama (Offline / Campus On-Premises)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Active Model Identifier</label>
              <input
                type="text"
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Temperature ({temperature}) - Low for deterministic evaluation
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Prompt Configuration Tag</label>
              <input
                type="text"
                value={promptVersion}
                onChange={(e) => setPromptVersion(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition shadow-md shadow-emerald-200"
            >
              {saving ? 'Persisting Config...' : 'Apply AI Configuration'}
            </button>
          </form>
        </div>

        {/* Prompt Specifications Matrix */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-600" /> Active Prompt Registry (Sections 11–16)
          </h3>

          <div className="space-y-3">
            {prompts.map((p, i) => (
              <div key={i} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900">{p.name}</p>
                  <p className="text-[11px] text-slate-500">{p.target}</p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-100 text-purple-700 font-mono">
                  {p.version}
                </span>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-[11px] text-emerald-900 leading-relaxed">
            <span className="font-bold">Architectural Guarantee: </span>
            All AI outputs strictly undergo Pydantic schema validation. If the LLM is temporarily unreachable, the deterministic fallback engine preserves complete feature uptime.
          </div>
        </div>
      </div>
    </div>
  );
}
