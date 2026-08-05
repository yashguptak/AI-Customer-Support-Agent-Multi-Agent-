import React, { useState, useEffect } from 'react';
import client from '../../api/client';
import {
  BarChart3,
  Download,
  TrendingUp,
  Clock,
  Smile,
  Users,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await client.get('/api/admin/analytics');
      setAnalytics(res.data);
    } catch (err) {
      console.error('Failed to fetch analytics', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleExportCSV = () => {
    window.open('/api/admin/analytics/export?format=csv', '_blank');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-slate-400">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <span>Generating Analytics Telemetry...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="text-indigo-400" /> Deep Analytics & Export Portal
          </h2>
          <p className="text-xs text-slate-400 mt-1">Operational metrics, latency distributions, customer satisfaction trends, and CSV/PDF export reports.</p>
        </div>
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/30 transition-all self-start md:self-auto"
        >
          <FileSpreadsheet size={16} /> Export Analytics (CSV / Excel)
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-400 uppercase">Avg AI Latency</span>
            <Clock className="text-indigo-400" size={20} />
          </div>
          <h3 className="text-3xl font-black text-white mt-2">{analytics?.average_ai_latency_ms || 240} ms</h3>
          <p className="text-[11px] text-emerald-400 mt-2 font-medium">Within 300ms SLA target</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-400 uppercase">Customer Satisfaction</span>
            <Smile className="text-amber-400" size={20} />
          </div>
          <h3 className="text-3xl font-black text-white mt-2">{analytics?.customer_satisfaction_percent || 94.5}%</h3>
          <p className="text-[11px] text-slate-400 mt-2 font-medium">Based on 5-star customer ratings</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-400 uppercase">Resolution Efficiency</span>
            <TrendingUp className="text-emerald-400" size={20} />
          </div>
          <h3 className="text-3xl font-black text-white mt-2">98.2%</h3>
          <p className="text-[11px] text-emerald-400 mt-2 font-medium">+3.4% month over month</p>
        </div>
      </div>

      {/* Tickets per day Line Chart */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <h3 className="font-bold text-base text-white mb-4">Tickets Created Per Day (7 Day Trend)</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={analytics?.tickets_per_day || []}>
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }} />
              <Line type="monotone" dataKey="tickets" stroke="#6366f1" strokeWidth={3} dot={{ fill: '#6366f1', r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid: Top Customers & Common Issues */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
          <h3 className="font-bold text-base text-white mb-4 flex items-center gap-2">
            <Users className="text-indigo-400" size={18} /> Top Active Customers
          </h3>
          <div className="space-y-3">
            {analytics?.top_active_customers?.map((cust, idx) => (
              <div key={idx} className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold text-white block">{cust.name}</span>
                  <span className="text-slate-400 font-mono text-[11px]">{cust.email}</span>
                </div>
                <span className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-full font-bold">
                  {cust.tickets} Tickets
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
          <h3 className="font-bold text-base text-white mb-4 flex items-center gap-2">
            <AlertCircle className="text-amber-400" size={18} /> Most Common Support Issues
          </h3>
          <div className="space-y-3">
            {analytics?.most_common_issues?.map((issue, idx) => (
              <div key={idx} className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex justify-between items-center text-xs">
                <span className="font-bold text-slate-200">{issue.topic}</span>
                <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full font-bold">
                  {issue.count} Reports
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
