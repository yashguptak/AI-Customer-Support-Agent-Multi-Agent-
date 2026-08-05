import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import client from '../api/client';
import {
  Ticket,
  MessageSquare,
  BookOpen,
  CheckCircle,
  Clock,
  ArrowUpRight,
  PlusCircle,
  Sparkles,
  BarChart2
} from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentTickets, setRecentTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Call analytics endpoint
        const analyticsRes = await client.get('/api/analytics');
        setStats(analyticsRes.data);

        // Fetch tickets and grab recent ones
        const ticketsRes = await client.get('/api/tickets');
        const sortedTickets = ticketsRes.data
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 5);
        setRecentTickets(sortedTickets);
      } catch (err) {
        console.error("Dashboard load failed", err);
        setError("Could not load dashboard data. Ensure the backend is running.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Assembling your workspace...</span>
      </div>
    );
  }

  const kpis = [
    {
      title: 'Active Tickets',
      value: stats?.open_tickets ?? 0,
      icon: Clock,
      color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      description: 'Tickets waiting for resolution'
    },
    {
      title: 'Resolved Tickets',
      value: stats?.closed_tickets ?? 0,
      icon: CheckCircle,
      color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      description: 'Customer problems solved'
    },
    {
      title: 'Chat Sessions',
      value: stats?.total_conversations ?? 0,
      icon: MessageSquare,
      color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
      description: 'Active conversations'
    },
    {
      title: 'Knowledge Sources',
      value: stats?.knowledge_documents ?? 0,
      icon: BookOpen,
      color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
      description: 'Ingested support manuals'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-indigo-900 to-indigo-950 dark:from-slate-800 dark:to-slate-850 p-6 md:p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-500/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold">
            <Sparkles size={14} className="text-amber-300" />
            AI Enabled System
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Support Operations Centre</h1>
          <p className="text-indigo-200 text-sm max-w-xl">
            Monitor, manage, and scale customer operations with automated multi-agent response flows.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap gap-3">
          <Link
            to="/tickets"
            className="flex items-center gap-2 px-5 py-3 bg-white text-indigo-900 hover:bg-slate-50 font-semibold rounded-xl text-sm transition-all duration-200 shadow-lg shadow-black/10"
          >
            <PlusCircle size={18} />
            New Ticket
          </Link>
          <Link
            to="/chat"
            className="flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-sm border border-indigo-400/30 transition-all duration-200 shadow-lg shadow-indigo-600/20"
          >
            <MessageSquare size={18} />
            Support Chat
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-600 dark:text-rose-400 text-sm">
          {error}
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.title}
              className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700/80 shadow-sm flex flex-col justify-between group hover:border-slate-200 dark:hover:border-slate-600 hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400 text-sm font-semibold">{kpi.title}</span>
                <div className={`p-2.5 rounded-xl border ${kpi.color}`}>
                  <Icon size={20} />
                </div>
              </div>
              <div className="mt-4 space-y-1">
                <span className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100 group-hover:scale-105 inline-block transition-transform duration-200">
                  {kpi.value}
                </span>
                <p className="text-xs text-slate-400 dark:text-slate-500">{kpi.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Tickets Table */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Recent Support Requests</h3>
              <p className="text-xs text-slate-400 mt-0.5">The latest customer queries needing attention</p>
            </div>
            <Link
              to="/tickets"
              className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-500 font-semibold transition-colors duration-150"
            >
              View all
              <ArrowUpRight size={16} />
            </Link>
          </div>

          <div className="overflow-x-auto">
            {recentTickets.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-sm bg-slate-50 dark:bg-slate-900/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                No tickets created yet. Get started by opening a support ticket.
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-700 text-xs text-slate-400 font-bold uppercase">
                    <th className="pb-3 pl-4">Title</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Priority</th>
                    <th className="pb-3 pr-4 text-right">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150 dark:divide-slate-750 text-sm">
                  {recentTickets.map((ticket) => (
                    <tr
                      key={ticket.id}
                      onClick={() => navigate('/tickets')}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 cursor-pointer transition-colors duration-150 group"
                    >
                      <td className="py-4 pl-4 font-semibold text-slate-800 dark:text-slate-200 max-w-xs truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                        {ticket.title}
                      </td>
                      <td className="py-4">
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${
                            ticket.status === 'OPEN'
                              ? 'bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400'
                              : ticket.status === 'IN_PROGRESS'
                              ? 'bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400'
                              : 'bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400'
                          }`}
                        >
                          {ticket.status}
                        </span>
                      </td>
                      <td className="py-4">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-md text-xs font-semibold ${
                            ticket.priority === 'URGENT'
                              ? 'bg-rose-100 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400'
                              : ticket.priority === 'HIGH'
                              ? 'bg-orange-100 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {ticket.priority}
                        </span>
                      </td>
                      <td className="py-4 pr-4 text-right text-slate-500 dark:text-slate-400 text-xs">
                        {new Date(ticket.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Quick Operations Guide / Tips */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm p-6 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">AI Assistant Hub</h3>
            <p className="text-xs text-slate-400 mt-0.5">Automated workflows running active</p>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl flex gap-3.5 border border-slate-100 dark:border-slate-750">
              <div className="p-2 bg-indigo-600 text-white rounded-lg self-start">
                <MessageSquare size={16} />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Conversational AI Agent</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Once a ticket is created, you can launch a support session to trigger AI replies trained on your documents.
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl flex gap-3.5 border border-slate-100 dark:border-slate-750">
              <div className="p-2 bg-purple-600 text-white rounded-lg self-start">
                <BookOpen size={16} />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Document Retrieval</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Upload FAQs or operational manuals in the Knowledge Base. The AI automatically matches sections to solve customer issues.
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl flex gap-3.5 border border-slate-100 dark:border-slate-750">
              <div className="p-2 bg-emerald-600 text-white rounded-lg self-start">
                <BarChart2 size={16} />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Continuous Evaluation</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Customer feedback ratings update performance dashboards in real-time, helping tune operational accuracy.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
