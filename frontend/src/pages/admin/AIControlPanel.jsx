import React, { useState, useEffect } from 'react';
import client from '../../api/client';
import {
  Cpu,
  Sliders,
  Database,
  RefreshCw,
  CheckCircle2,
  Zap,
  Layers,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

const AIControlPanel = () => {
  const [settings, setSettings] = useState({
    ai_enabled: true,
    active_model: 'llama-3.3-70b-versatile',
    temperature: 0.7,
    max_tokens: 1024,
    rag_enabled: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);

  const fetchAISettings = async () => {
    setLoading(true);
    try {
      const res = await client.get('/api/admin/ai-control');
      setSettings(res.data);
    } catch (err) {
      console.error('Failed to load AI settings', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAISettings();
  }, []);

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const res = await client.post('/api/admin/ai-control', settings);
      setActionMessage({ type: 'success', text: res.data.message });
      setTimeout(() => setActionMessage(null), 3000);
    } catch (err) {
      setActionMessage({ type: 'error', text: 'Failed to update AI settings' });
    } finally {
      setSaving(false);
    }
  };

  const handleClearCache = async () => {
    try {
      const res = await client.post('/api/admin/ai-control/clear-cache');
      setActionMessage({ type: 'success', text: res.data.message });
      setTimeout(() => setActionMessage(null), 3000);
    } catch (err) {
      alert('Failed to clear cache');
    }
  };

  const handleRebuildEmbeddings = async () => {
    try {
      const res = await client.post('/api/admin/ai-control/rebuild-embeddings');
      setActionMessage({ type: 'success', text: res.data.message });
      setTimeout(() => setActionMessage(null), 3000);
    } catch (err) {
      alert('Failed to rebuild embeddings');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-slate-400">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <span>Loading AI Engine Parameters...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <Cpu className="text-indigo-400" /> Multi-Agent AI Control Panel
        </h2>
        <p className="text-xs text-slate-400 mt-1">Configure LLM providers, hyper-parameters, vector search settings, and vector database indexing.</p>
      </div>

      {actionMessage && (
        <div className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-2 border ${
          actionMessage.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
        }`}>
          <CheckCircle2 size={16} /> {actionMessage.text}
        </div>
      )}

      {/* Main Settings Form Card */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-6 shadow-xl">
        <div className="flex justify-between items-center pb-4 border-b border-slate-800">
          <div>
            <h3 className="font-bold text-base text-white">AI Engine Status</h3>
            <p className="text-xs text-slate-400">Enable or suspend global automated AI agent responses.</p>
          </div>
          <button
            onClick={() => setSettings({ ...settings, ai_enabled: !settings.ai_enabled })}
            className={`px-4 py-2 rounded-xl font-bold text-xs transition-all ${
              settings.ai_enabled
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
            }`}
          >
            {settings.ai_enabled ? 'AI Engine ENABLED' : 'AI Engine DISABLED'}
          </button>
        </div>

        {/* Model Selector */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Active LLM Model</label>
          <select
            value={settings.active_model}
            onChange={(e) => setSettings({ ...settings, active_model: e.target.value })}
            className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="llama-3.3-70b-versatile">Groq: llama-3.3-70b-versatile (Default High Perf)</option>
            <option value="llama3-8b-8192">Groq: llama3-8b-8192 (Fast Latency)</option>
            <option value="mixtral-8x7b-32768">Groq: mixtral-8x7b-32768 (MoE Context)</option>
            <option value="gpt-4o">OpenAI: gpt-4o (Enterprise Pro)</option>
            <option value="claude-3-5-sonnet">Anthropic: claude-3-5-sonnet (High Reasoning)</option>
          </select>
        </div>

        {/* Temperature & Max Tokens Sliders */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-300 uppercase tracking-wider">Temperature ({settings.temperature})</span>
              <span className="text-slate-500">0.0 (Deterministic) - 1.0 (Creative)</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.temperature}
              onChange={(e) => setSettings({ ...settings, temperature: parseFloat(e.target.value) })}
              className="w-full accent-indigo-500 bg-slate-950"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Max Completion Tokens</label>
            <input
              type="number"
              value={settings.max_tokens}
              onChange={(e) => setSettings({ ...settings, max_tokens: parseInt(e.target.value) || 512 })}
              className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* RAG Toggle */}
        <div className="flex justify-between items-center pt-4 border-t border-slate-800">
          <div>
            <h4 className="font-bold text-sm text-white">ChromaDB Retrieval Augmented Generation (RAG)</h4>
            <p className="text-xs text-slate-400">Inject relevant vector knowledge base context into agent prompts.</p>
          </div>
          <button
            onClick={() => setSettings({ ...settings, rag_enabled: !settings.rag_enabled })}
            className={`px-4 py-1.5 rounded-xl font-bold text-xs transition-all ${
              settings.rag_enabled ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
            }`}
          >
            {settings.rag_enabled ? 'RAG Active' : 'RAG Disabled'}
          </button>
        </div>

        <button
          onClick={handleSaveSettings}
          disabled={saving}
          className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition-all"
        >
          {saving ? 'Saving Configuration...' : 'Apply & Save AI Parameters'}
        </button>
      </div>

      {/* Vector DB Maintenance Actions */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 shadow-xl">
        <h3 className="font-bold text-base text-white flex items-center gap-2">
          <Database size={18} className="text-violet-400" /> Vector Database Maintenance
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={handleClearCache}
            className="p-4 bg-slate-950 border border-slate-800 hover:border-indigo-500/50 rounded-xl text-left text-xs transition-all group"
          >
            <h4 className="font-bold text-white group-hover:text-indigo-400">Clear Vector Cache</h4>
            <p className="text-slate-400 mt-1">Evict cached prompt embeddings from memory.</p>
          </button>

          <button
            onClick={handleRebuildEmbeddings}
            className="p-4 bg-slate-950 border border-slate-800 hover:border-indigo-500/50 rounded-xl text-left text-xs transition-all group"
          >
            <h4 className="font-bold text-white group-hover:text-indigo-400">Rebuild ChromaDB Embeddings</h4>
            <p className="text-slate-400 mt-1">Re-parse and re-index all uploaded PDF & DOCX knowledge documents.</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIControlPanel;
