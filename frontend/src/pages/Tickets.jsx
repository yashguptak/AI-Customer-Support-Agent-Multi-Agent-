import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';
import {
  Ticket as TicketIcon,
  Plus,
  Trash2,
  MessageSquare,
  AlertCircle,
  X,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';

const Tickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Form state
  const [createOpen, setCreateOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [category, setCategory] = useState('GENERAL');
  const [submitting, setSubmitting] = useState(false);

  // Filter state
  const [filterPriority, setFilterPriority] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterCategory, setFilterCategory] = useState('ALL');

  const navigate = useNavigate();

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await client.get('/api/tickets');
      setTickets(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch tickets. Please verify your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (title.length < 5 || description.length < 10) {
      setError('Title must be at least 5 chars and Description at least 10 chars.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await client.post('/api/tickets', {
        title,
        description,
        priority,
        category,
      });
      // Reset form
      setTitle('');
      setDescription('');
      setPriority('MEDIUM');
      setCategory('GENERAL');
      setCreateOpen(false);
      
      // Refresh
      fetchTickets();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create ticket');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this ticket?')) return;
    try {
      await client.delete(`/api/tickets/${id}`);
      setTickets(tickets.filter(t => t.id !== id));
    } catch (err) {
      setError('Failed to delete ticket');
    }
  };

  const handleStartChat = async (ticketId) => {
    try {
      // 1. Check if a conversation already exists for this ticket
      const convsRes = await client.get(`/api/conversations/ticket/${ticketId}`);
      let conversationId;

      if (convsRes.data && convsRes.data.length > 0) {
        conversationId = convsRes.data[0].id;
      } else {
        // 2. Create new conversation
        const createRes = await client.post('/conversations', { ticket_id: ticketId });
        conversationId = createRes.data.id;
      }

      // 3. Navigate to chat page with query param
      navigate(`/chat?conversationId=${conversationId}`);
    } catch (err) {
      setError('Failed to start chat support session');
    }
  };

  // Filter logic
  const filteredTickets = tickets.filter(ticket => {
    const matchPriority = filterPriority === 'ALL' || ticket.priority === filterPriority;
    const matchStatus = filterStatus === 'ALL' || ticket.status === filterStatus;
    const matchCategory = filterCategory === 'ALL' || ticket.category === filterCategory;
    return matchPriority && matchStatus && matchCategory;
  });

  return (
    <div className="space-y-6 relative">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Support Tickets</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Create, view and manage your technical help tickets</p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-sm transition-all duration-200 shadow-md shadow-indigo-600/10 self-start sm:self-auto"
        >
          <Plus size={18} />
          Create Ticket
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-600 dark:text-rose-400 text-sm">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/80 shadow-sm flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mr-2 text-sm font-semibold">
          <SlidersHorizontal size={16} />
          <span>Filter by:</span>
        </div>

        {/* Priority Filter */}
        <div className="flex flex-col">
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-3.5 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="ALL">All Priorities</option>
            <option value="LOW">Low Priority</option>
            <option value="MEDIUM">Medium Priority</option>
            <option value="HIGH">High Priority</option>
            <option value="URGENT">Urgent Priority</option>
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex flex-col">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3.5 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>

        {/* Category Filter */}
        <div className="flex flex-col">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3.5 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="ALL">All Categories</option>
            <option value="GENERAL">General</option>
            <option value="TECHNICAL">Technical</option>
            <option value="BILLING">Billing</option>
            <option value="ACCOUNT">Account</option>
          </select>
        </div>
      </div>

      {/* Ticket List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-slate-500">Loading support requests...</span>
        </div>
      ) : filteredTickets.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm space-y-4">
          <div className="w-12 h-12 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center text-slate-400 mx-auto">
            <TicketIcon size={24} />
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">No Tickets Found</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            No support requests match your filters. Try adjusting them or create a new ticket.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredTickets.map((ticket) => (
            <div
              key={ticket.id}
              className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-150 dark:border-slate-700 shadow-sm flex flex-col justify-between hover:shadow-md hover:border-slate-200 dark:hover:border-slate-650 transition-all duration-300"
            >
              <div className="space-y-4">
                {/* Meta details */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-xs font-bold px-2.5 py-1 bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 rounded-lg">
                    #{ticket.id} • {ticket.category}
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-extrabold tracking-wide uppercase ${
                        ticket.priority === 'URGENT'
                          ? 'bg-rose-100 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400'
                          : ticket.priority === 'HIGH'
                          ? 'bg-orange-100 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400'
                          : ticket.priority === 'MEDIUM'
                          ? 'bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {ticket.priority}
                    </span>
                    <span
                      className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        ticket.status === 'OPEN'
                          ? 'bg-amber-100 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400'
                          : ticket.status === 'IN_PROGRESS'
                          ? 'bg-indigo-100 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-400'
                          : 'bg-green-100 dark:bg-green-950/20 text-green-700 dark:text-green-400'
                      }`}
                    >
                      {ticket.status}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 line-clamp-1">{ticket.title}</h3>
                  <p className="text-slate-500 dark:text-slate-450 text-sm line-clamp-3 leading-relaxed">
                    {ticket.description}
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-700/60 mt-6 pt-4">
                <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                  Opened: {new Date(ticket.created_at).toLocaleDateString()}
                </span>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleStartChat(ticket.id)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-indigo-50 dark:bg-indigo-950/30 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-400 font-bold rounded-xl text-xs transition-colors duration-150"
                  >
                    <MessageSquare size={14} />
                    <span>Chat</span>
                  </button>
                  <button
                    onClick={() => handleDelete(ticket.id)}
                    className="p-2 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl text-rose-500 transition-colors duration-150"
                    title="Delete ticket"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Ticket Creation Drawer/Modal Overlay */}
      {createOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex justify-end">
          <div
            className="w-full max-w-lg bg-white dark:bg-slate-800 h-full p-6 shadow-2xl overflow-y-auto flex flex-col justify-between animate-slideLeft"
          >
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-750 pb-4 mb-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 font-sans">Open Support Request</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Please provide specific details about the issue</p>
                </div>
                <button
                  onClick={() => setCreateOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                    Ticket Subject / Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Short summary of the issue (min. 5 chars)"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 rounded-xl text-sm focus:outline-none transition-colors duration-200"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                    Detailed Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide specific logs, steps to reproduce, or instructions (min. 10 chars)"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 rounded-xl text-sm h-32 focus:outline-none resize-none transition-colors duration-200"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                      Priority Level
                    </label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      className="w-full px-3.5 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500 cursor-pointer"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="URGENT">Urgent</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3.5 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500 cursor-pointer"
                    >
                      <option value="GENERAL">General</option>
                      <option value="TECHNICAL">Technical</option>
                      <option value="BILLING">Billing</option>
                      <option value="ACCOUNT">Account</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white font-bold rounded-xl text-sm transition-all duration-200 shadow-md shadow-indigo-600/10 flex items-center justify-center gap-2 mt-4"
                >
                  {submitting ? (
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    'Submit Ticket'
                  )}
                </button>
              </form>
            </div>

            <div className="text-center text-xs text-slate-400 pt-4 border-t border-slate-100 dark:border-slate-750">
              Open tickets will immediately trigger AI agent triage algorithms.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tickets;
