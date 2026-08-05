import React, { useState, useEffect } from 'react';
import client from '../api/client';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import {
  BarChart3,
  Users,
  Ticket,
  MessageSquare,
  BookOpen,
  Mail,
  AlertCircle
} from 'lucide-react';

const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await client.get('/api/analytics');
        setData(res.data);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch platform metrics. Verify that backend database is active.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-medium text-slate-500">Retrieving intelligence reports...</span>
      </div>
    );
  }

  // Formatting data for Charts
  const ticketStatusData = [
    { name: 'Open Tickets', value: data?.open_tickets ?? 0 },
    { name: 'Closed Tickets', value: data?.closed_tickets ?? 0 }
  ];

  const systemScopeData = [
    { name: 'Users', count: data?.total_users ?? 0, fill: '#6366f1' },
    { name: 'Tickets', count: data?.total_tickets ?? 0, fill: '#f59e0b' },
    { name: 'Chats', count: data?.total_conversations ?? 0, fill: '#0ea5e9' },
    { name: 'Docs', count: data?.knowledge_documents ?? 0, fill: '#a855f7' }
  ];

  const communicationData = [
    { name: 'Conversations', count: data?.total_conversations ?? 0 },
    { name: 'Total Messages', count: data?.total_messages ?? 0 }
  ];

  const COLORS = ['#f59e0b', '#10b981']; // Amber for Open, Emerald for Closed

  const kpis = [
    { title: 'Registered Users', value: data?.total_users ?? 0, icon: Users, color: 'text-indigo-600 dark:text-indigo-400' },
    { title: 'Total Tickets Logged', value: data?.total_tickets ?? 0, icon: Ticket, color: 'text-amber-500' },
    { title: 'Message Volume', value: data?.total_messages ?? 0, icon: Mail, color: 'text-sky-500' },
    { title: 'Vectorized Documents', value: data?.knowledge_documents ?? 0, icon: BookOpen, color: 'text-purple-500' }
  ];

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Platform Analytics</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Assess organizational velocity, support queues, and automated conversational logs.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-600 dark:text-rose-400 text-sm">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.title}
              className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700/80 shadow-sm flex items-center justify-between"
            >
              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-450">{kpi.title}</span>
                <p className="text-2xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100">{kpi.value}</p>
              </div>
              <div className={`p-3 bg-slate-50 dark:bg-slate-900 rounded-xl ${kpi.color}`}>
                <Icon size={20} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Ticket Status Distribution */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Ticket Status Allocation</h3>
            <p className="text-xs text-slate-400 mt-0.5">Active backlog vs solved incidents</p>
          </div>

          <div className="h-64 flex items-center justify-center">
            {data?.total_tickets === 0 ? (
              <span className="text-xs text-slate-400">No support data to analyze</span>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={ticketStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {ticketStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(30, 41, 59, 0.9)',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Platform Content Totals */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">System Records</h3>
            <p className="text-xs text-slate-400 mt-0.5">Resource tallies across key backend tables</p>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={systemScopeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }}
                  contentStyle={{
                    backgroundColor: 'rgba(30, 41, 59, 0.9)',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {systemScopeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Message Volume Metrics */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm space-y-6 lg:col-span-2">
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Chat Density</h3>
            <p className="text-xs text-slate-400 mt-0.5">Ratio of messaging density relative to session counts</p>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={communicationData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }}
                  contentStyle={{
                    backgroundColor: 'rgba(30, 41, 59, 0.9)',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[12, 12, 0, 0]} maxBarSize={120} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
