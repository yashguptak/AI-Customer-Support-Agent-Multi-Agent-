import React, { useState, useEffect } from 'react';
import client from '../../api/client';
import {
  ShieldAlert,
  Search,
  User,
  Clock,
  Globe,
  FileCode,
} from 'lucide-react';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const res = await client.get('/api/admin/audit-logs?page=1&limit=30');
      setLogs(res.data.audit_logs);
      setTotal(res.data.total);
    } catch (err) {
      console.error('Failed to load audit logs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <ShieldAlert className="text-rose-400" /> Administrative Audit Trail Logs
          </h2>
          <p className="text-xs text-slate-400 mt-1">Immutable security log of every administrative action, user role modification, and system override.</p>
        </div>
        <span className="px-3 py-1 bg-slate-900 border border-slate-800 rounded-full text-xs font-mono text-rose-400">
          Total Logs: {total}
        </span>
      </div>

      {/* Audit Log Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="p-4">Admin User</th>
                <th className="p-4">Action</th>
                <th className="p-4">Details</th>
                <th className="p-4">IP Address</th>
                <th className="p-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-slate-500">Loading audit records...</td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-slate-500">No audit logs recorded yet.</td>
                </tr>
              ) : (
                logs.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="p-4 font-bold text-white">
                      {l.user_name}
                      <span className="block text-[10px] text-slate-500 font-mono">{l.user_email}</span>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-mono font-bold text-[11px]">
                        {l.action}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-slate-400 max-w-xs truncate">
                      {JSON.stringify(l.details)}
                    </td>
                    <td className="p-4 font-mono text-slate-400">
                      {l.ip_address || '127.0.0.1'}
                    </td>
                    <td className="p-4 font-mono text-slate-500">
                      {new Date(l.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;
