import React, { useState, useEffect } from 'react';
import client from '../../api/client';
import {
  Settings,
  Building,
  Mail,
  Sliders,
  Database,
  Download,
  Save,
  CheckCircle,
  Shield,
  Key,
} from 'lucide-react';

const AdminSettings = () => {
  const [form, setForm] = useState({
    company_name: 'Enterprise AI Support Inc.',
    support_email: 'support@enterprise.com',
    branding_logo_url: '/logo.png',
    system_prompt: 'You are a helpful, professional enterprise AI customer support assistant.',
    llm_provider: 'Groq Cloud API',
    email_notifications_enabled: 'true',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [backupInfo, setBackupInfo] = useState(null);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await client.get('/api/admin/settings');
      setForm((prev) => ({ ...prev, ...res.data }));
    } catch (err) {
      console.error('Failed to load settings', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await client.post('/api/admin/settings', form);
      setStatusMessage({ type: 'success', text: 'System settings updated successfully!' });
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err) {
      setStatusMessage({ type: 'error', text: 'Failed to update settings' });
    } finally {
      setSaving(false);
    }
  };

  const handleTriggerBackup = async () => {
    try {
      const res = await client.post('/api/admin/settings/backup');
      setBackupInfo(res.data);
      alert(`Database backup created: ${res.data.backup_filename}`);
    } catch (err) {
      alert('Failed to trigger database backup');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-slate-400">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <span>Loading Enterprise System Settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <Settings className="text-indigo-400" /> Enterprise System Settings & Branding
        </h2>
        <p className="text-xs text-slate-400 mt-1">Global organization metadata, support emails, AI system prompts, and database snapshots.</p>
      </div>

      {statusMessage && (
        <div className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-2 border ${
          statusMessage.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
        }`}>
          <CheckCircle size={16} /> {statusMessage.text}
        </div>
      )}

      {/* Settings Form */}
      <form onSubmit={handleSaveSettings} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-6 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Building size={14} className="text-indigo-400" /> Company Name
            </label>
            <input
              type="text"
              value={form.company_name}
              onChange={(e) => setForm({ ...form, company_name: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Mail size={14} className="text-indigo-400" /> Official Support Email
            </label>
            <input
              type="email"
              value={form.support_email}
              onChange={(e) => setForm({ ...form, support_email: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Global System Prompt Directive</label>
          <textarea
            rows={4}
            value={form.system_prompt}
            onChange={(e) => setForm({ ...form, system_prompt: e.target.value })}
            className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Key size={14} className="text-violet-400" /> Primary LLM Provider
            </label>
            <input
              type="text"
              value={form.llm_provider}
              onChange={(e) => setForm({ ...form, llm_provider: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Email Notifications</label>
            <select
              value={form.email_notifications_enabled}
              onChange={(e) => setForm({ ...form, email_notifications_enabled: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="true">Enabled (Send ticket update emails)</option>
              <option value="false">Disabled</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
        >
          <Save size={16} /> {saving ? 'Saving System Settings...' : 'Save Enterprise Settings'}
        </button>
      </form>

      {/* Database Backup Card */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 shadow-xl">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <Database className="text-emerald-400" size={18} /> Database Backup & Snapshot Option
            </h3>
            <p className="text-xs text-slate-400 mt-1">Generate automated PostgreSQL / system database backups for off-site archiving.</p>
          </div>
          <button
            onClick={handleTriggerBackup}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 font-bold text-xs rounded-xl transition-all"
          >
            <Download size={14} /> Create Snapshot Now
          </button>
        </div>

        {backupInfo && (
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-emerald-300 flex justify-between items-center">
            <span>Snapshot: {backupInfo.backup_filename} ({backupInfo.size_kb} KB)</span>
            <span className="text-slate-500">{new Date(backupInfo.created_at).toLocaleTimeString()}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSettings;
