import React, { useState, useEffect } from 'react';
import client from '../../api/client';
import {
  Ticket,
  Search,
  Filter,
  UserPlus,
  CheckCircle,
  RotateCcw,
  Trash2,
  History,
  X,
  AlertCircle,
  Tag,
} from 'lucide-react';

const TicketManagement = () => {
  const [tickets, setTickets] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [selectedHistory, setSelectedHistory] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      let url = `/api/admin/tickets?page=1&limit=30`;
      if (search) url += `&query=${encodeURIComponent(search)}`;
      if (statusFilter) url += `&status=${statusFilter}`;
      if (priorityFilter) url += `&priority=${priorityFilter}`;
      if (categoryFilter) url += `&category=${categoryFilter}`;
      const res = await client.get(url);
      setTickets(res.data.tickets);
      setTotal(res.data.total);
    } catch (err) {
      console.error('Failed to fetch tickets', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [statusFilter, priorityFilter, categoryFilter]);

  const handleUpdateTicket = async (ticketId, payload) => {
    try {
      await client.patch(`/api/admin/tickets/${ticketId}`, payload);
      fetchTickets();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to update ticket');
    }
  };

  const handleDeleteTicket = async (ticketId) => {
    if (!window.confirm(`Delete ticket #${ticketId}?`)) return;
    try {
      await client.delete(`/api/admin/tickets/${ticketId}`);
      fetchTickets();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to delete ticket');
    }
  };

  const fetchHistory = async (ticketId) => {
    setHistoryLoading(true);
    try {
      const res = await client.get(`/api/admin/tickets/${ticketId}/history`);
      setSelectedHistory({ ticketId, list: res.data });
    } catch (err) {
      alert('Failed to fetch ticket history');
    } finally {
      setHistoryLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Ticket className="text-violet-400" /> Enterprise Ticket Operations
          </h2>
          <p className="text-xs text-slate-400 mt-1">Assign support staff, update statuses, manage priority SLAs, and view assignment logs.</p>
        </div>
        <span className="px-3 py-1 bg-slate-900 border border-slate-800 rounded-full text-xs font-mono text-violet-400">
          Total Tickets: {total}
        </span>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between shadow-lg">
        <div className="relative flex-1 w-full">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search tickets by title or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchTickets()}
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
          >
            <option value="">All Statuses</option>
            <option value="OPEN">OPEN</option>
            <option value="IN_PROGRESS">IN_PROGRESS</option>
            <option value="RESOLVED">RESOLVED</option>
            <option value="CLOSED">CLOSED</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
          >
            <option value="">All Priorities</option>
            <option value="LOW">LOW</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HIGH">HIGH</option>
            <option value="URGENT">URGENT</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
          >
            <option value="">All Categories</option>
            <option value="TECHNICAL">TECHNICAL</option>
            <option value="BILLING">BILLING</option>
            <option value="ACCOUNT">ACCOUNT</option>
            <option value="GENERAL">GENERAL</option>
          </select>
        </div>
      </div>

      {/* Ticket Grid Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="p-4">Ticket</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Status</th>
                <th className="p-4">Priority</th>
                <th className="p-4">Category</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-500">Loading tickets...</td>
                </tr>
              ) : tickets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-500">No tickets found.</td>
                </tr>
              ) : (
                tickets.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="p-4">
                      <div>
                        <span className="font-bold text-white block">#{t.id} - {t.title}</span>
                        <p className="text-slate-400 text-[11px] line-clamp-1 max-w-xs mt-0.5">{t.description}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-medium text-slate-200">{t.user?.name || 'Customer'}</span>
                      <span className="block text-[10px] text-slate-500">{t.user?.email}</span>
                    </td>
                    <td className="p-4">
                      <select
                        value={t.status}
                        onChange={(e) => handleUpdateTicket(t.id, { status: e.target.value })}
                        className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs text-indigo-300 font-semibold"
                      >
                        <option value="OPEN">OPEN</option>
                        <option value="IN_PROGRESS">IN_PROGRESS</option>
                        <option value="RESOLVED">RESOLVED</option>
                        <option value="CLOSED">CLOSED</option>
                      </select>
                    </td>
                    <td className="p-4">
                      <select
                        value={t.priority}
                        onChange={(e) => handleUpdateTicket(t.id, { priority: e.target.value })}
                        className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs text-amber-300 font-semibold"
                      >
                        <option value="LOW">LOW</option>
                        <option value="MEDIUM">MEDIUM</option>
                        <option value="HIGH">HIGH</option>
                        <option value="URGENT">URGENT</option>
                      </select>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono text-[11px]">
                        {t.category}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => fetchHistory(t.id)}
                        className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                        title="Assignment History"
                      >
                        <History size={14} />
                      </button>
                      {t.status !== 'CLOSED' ? (
                        <button
                          onClick={() => handleUpdateTicket(t.id, { status: 'CLOSED' })}
                          className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg hover:bg-emerald-500/20 font-semibold"
                        >
                          Close
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUpdateTicket(t.id, { status: 'OPEN' })}
                          className="px-2.5 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-lg hover:bg-amber-500/20 font-semibold"
                        >
                          Reopen
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteTicket(t.id)}
                        className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20"
                        title="Delete Ticket"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* History Drawer Modal */}
      {selectedHistory && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <History className="text-indigo-400" size={18} /> Ticket #{selectedHistory.ticketId} Audit Timeline
              </h3>
              <button onClick={() => setSelectedHistory(null)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {selectedHistory.list.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">No status changes or assignment logs yet.</p>
              ) : (
                selectedHistory.list.map((h) => (
                  <div key={h.id} className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs space-y-1">
                    <div className="flex justify-between items-center font-semibold text-indigo-300">
                      <span>Updated by: {h.assigned_by}</span>
                      <span className="text-[10px] text-slate-500">{new Date(h.created_at).toLocaleString()}</span>
                    </div>
                    <p className="text-slate-300">{h.notes}</p>
                    <div className="text-[10px] text-slate-400 font-mono">
                      Status: {h.previous_status} &rarr; {h.new_status}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketManagement;
