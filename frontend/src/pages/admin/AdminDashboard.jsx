import React, { useState, useEffect } from 'react';
import client from '../../api/client';
import {
  Users,
  Ticket,
  CheckCircle,
  MessageSquare,
  Clock,
  Star,
  Activity,
  ArrowUpRight,
  TrendingUp,
  Cpu,
  RefreshCw,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await client.get('/api/admin/dashboard');
      setData(res.data);
    } catch (err) {
      console.error('Failed to load admin dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-slate-400">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <span>Loading Admin Enterprise Metrics...</span>
      </div>
    );
  }

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  const statusData = data?.ticket_status_chart
    ? Object.entries(data.ticket_status_chart).map(([name, value]) => ({ name, value }))
    : [];

  const categoryData = data?.ticket_category_chart
    ? Object.entries(data.ticket_category_chart).map(([name, value]) => ({ name, value }))
    : [];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">Enterprise Overview</h2>
          <p className="text-slate-400 text-sm mt-1">Real-time telemetry, tickets, AI model performance, and operational status.</p>
        </div>
        <button
          onClick={fetchDashboard}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold text-xs transition-all shadow-lg shadow-indigo-600/30 self-start md:self-auto"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh Metrics
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total System Users</p>
              <h3 className="text-3xl font-black text-white mt-2">{data?.total_users || 0}</h3>
            </div>
            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
              <Users size={22} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-emerald-400 gap-1 font-medium">
            <TrendingUp size={14} /> Active User Directory
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Support Tickets</p>
              <h3 className="text-3xl font-black text-white mt-2">{data?.total_tickets || 0}</h3>
            </div>
            <div className="p-3 bg-violet-500/10 text-violet-400 rounded-xl border border-violet-500/20">
              <Ticket size={22} />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
            <span className="text-amber-400 font-semibold">{data?.open_tickets || 0} Open</span>
            <span className="text-emerald-400 font-semibold">{data?.closed_tickets || 0} Resolved</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Conversations</p>
              <h3 className="text-3xl font-black text-white mt-2">{data?.active_conversations || 0}</h3>
            </div>
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
              <MessageSquare size={22} />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
            <span>AI: <strong className="text-indigo-400">{data?.ai_messages_count || 0}</strong></span>
            <span>Customer: <strong className="text-slate-200">{data?.customer_messages_count || 0}</strong></span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Avg Feedback Rating</p>
              <h3 className="text-3xl font-black text-white mt-2">{data?.average_feedback_rating || '5.0'} / 5.0</h3>
            </div>
            <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
              <Star size={22} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-amber-400 gap-1 font-semibold">
            <Clock size={14} /> Avg Latency: {data?.average_response_time_ms || 0}ms
          </div>
        </div>
      </div>

      {/* Visual Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ticket Status Bar Chart */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg">
          <h4 className="text-base font-bold text-white mb-4">Ticket Status Distribution</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }} />
                <Bar dataKey="value" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution Pie Chart */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg">
          <h4 className="text-base font-bold text-white mb-4">Tickets by Category</h4>
          <div className="h-64 flex items-center justify-center">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-slate-500 text-xs">No category data available yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity Log Feed */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h4 className="text-base font-bold text-white">Recent System Audit Trail</h4>
            <p className="text-xs text-slate-400">Live operational events performed by system administrators.</p>
          </div>
        </div>
        <div className="space-y-3">
          {data?.recent_activity?.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center">No recent activity logged.</p>
          ) : (
            data?.recent_activity?.map((act) => (
              <div key={act.id} className="flex items-center justify-between p-3.5 bg-slate-950 border border-slate-800/60 rounded-xl text-xs">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    <Activity size={16} />
                  </div>
                  <div>
                    <span className="font-bold text-white">{act.user}</span>
                    <span className="text-slate-400 ml-2 font-mono text-[11px]">{act.action}</span>
                  </div>
                </div>
                <span className="text-slate-500 text-[11px] font-mono">{new Date(act.created_at).toLocaleString()}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
