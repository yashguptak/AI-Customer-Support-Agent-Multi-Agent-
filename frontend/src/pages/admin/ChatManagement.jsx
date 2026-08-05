import React, { useState, useEffect } from 'react';
import client from '../../api/client';
import {
  MessageSquare,
  Search,
  Bot,
  UserCheck,
  Send,
  Trash2,
  Cpu,
  Clock,
  Shield,
  Zap,
  CheckCircle,
  PauseCircle,
  PlayCircle,
} from 'lucide-react';

const ChatManagement = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConvId, setSelectedConvId] = useState(null);
  const [activeConvDetail, setActiveConvDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const res = await client.get('/api/admin/conversations?page=1&limit=30');
      setConversations(res.data.conversations);
      if (res.data.conversations.length > 0 && !selectedConvId) {
        setSelectedConvId(res.data.conversations[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch conversations', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDetail = async (convId) => {
    if (!convId) return;
    try {
      const res = await client.get(`/api/admin/conversations/${convId}`);
      setActiveConvDetail(res.data);
    } catch (err) {
      console.error('Failed to fetch conversation details', err);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedConvId) {
      fetchDetail(selectedConvId);
    }
  }, [selectedConvId]);

  const handleTakeover = async () => {
    if (!selectedConvId) return;
    try {
      await client.post(`/api/admin/conversations/${selectedConvId}/takeover`);
      fetchDetail(selectedConvId);
      fetchConversations();
    } catch (err) {
      alert('Failed to take over AI conversation');
    }
  };

  const handleResumeAI = async () => {
    if (!selectedConvId) return;
    try {
      await client.post(`/api/admin/conversations/${selectedConvId}/resume-ai`);
      fetchDetail(selectedConvId);
      fetchConversations();
    } catch (err) {
      alert('Failed to resume AI conversation');
    }
  };

  const handleSendAdminReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedConvId) return;
    setSubmittingReply(true);
    try {
      await client.post(`/api/admin/conversations/${selectedConvId}/reply`, { message: replyText });
      setReplyText('');
      fetchDetail(selectedConvId);
    } catch (err) {
      alert('Failed to send admin reply');
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleDeleteMessage = async (msgId) => {
    if (!window.confirm(`Delete message #${msgId}?`)) return;
    try {
      await client.delete(`/api/admin/conversations/${selectedConvId}/messages/${msgId}`);
      fetchDetail(selectedConvId);
    } catch (err) {
      alert('Failed to delete message');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <MessageSquare className="text-emerald-400" /> Live Chat & AI Takeover Control
        </h2>
        <p className="text-xs text-slate-400 mt-1">Intervene in live AI conversations, respond directly as Human Admin, inspect token telemetry, and adjust auto-reply overrides.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Conversation List */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 h-[700px] flex flex-col shadow-xl">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Conversations</h3>
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {conversations.length === 0 ? (
              <p className="text-xs text-slate-500 py-8 text-center">No active chat threads</p>
            ) : (
              conversations.map((c) => (
                <div
                  key={c.id}
                  onClick={() => setSelectedConvId(c.id)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    selectedConvId === c.id
                      ? 'bg-indigo-600/20 border-indigo-500/50 shadow-md'
                      : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-xs text-white">Conv #{c.id}</span>
                    {c.is_ai_takeover ? (
                      <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-semibold text-[10px]">
                        Admin Override
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold text-[10px]">
                        AI Active
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 line-clamp-1 font-medium">{c.ticket_title}</p>
                  <div className="flex justify-between items-center mt-2 text-[10px] text-slate-500 font-mono">
                    <span>Msgs: {c.message_count}</span>
                    <span>{new Date(c.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Side: Chat Thread & Telemetry */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-6 h-[700px] flex flex-col justify-between shadow-xl">
          {activeConvDetail ? (
            <>
              {/* Thread Header & Controls */}
              <div className="pb-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-base text-white">Ticket: {activeConvDetail.ticket?.title}</h3>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 font-mono">
                    <span>Tokens: <strong className="text-indigo-400">{activeConvDetail.total_tokens_used}</strong></span>
                    <span>Models: <strong className="text-violet-400">{activeConvDetail.models_used.join(', ') || 'N/A'}</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {activeConvDetail.is_ai_takeover ? (
                    <button
                      onClick={handleResumeAI}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 font-bold text-xs rounded-xl"
                    >
                      <PlayCircle size={16} /> Resume AI Auto-Reply
                    </button>
                  ) : (
                    <button
                      onClick={handleTakeover}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 font-bold text-xs rounded-xl"
                    >
                      <PauseCircle size={16} /> Take Over AI Conversation
                    </button>
                  )}
                </div>
              </div>

              {/* Messages Stream */}
              <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-2 custom-scrollbar">
                {activeConvDetail.messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex flex-col ${
                      m.sender === 'USER' ? 'items-start' : m.sender === 'ADMIN' ? 'items-end' : 'items-center'
                    }`}
                  >
                    <div
                      className={`max-w-xl p-4 rounded-2xl text-xs relative group border shadow-md ${
                        m.sender === 'USER'
                          ? 'bg-slate-950 border-slate-800 text-slate-200'
                          : m.sender === 'ADMIN'
                          ? 'bg-gradient-to-r from-indigo-600 to-violet-600 border-indigo-500 text-white'
                          : 'bg-slate-800 border-slate-700 text-slate-100'
                      }`}
                    >
                      <div className="flex justify-between items-center gap-4 mb-1 text-[10px] opacity-75 font-semibold">
                        <span>{m.sender}</span>
                        {m.confidence_score && (
                          <span className="font-mono text-emerald-300">Confidence: {(m.confidence_score * 100).toFixed(0)}%</span>
                        )}
                        {m.latency_ms > 0 && <span className="font-mono">{m.latency_ms}ms</span>}
                      </div>
                      <p className="whitespace-pre-wrap leading-relaxed">{m.message}</p>

                      <button
                        onClick={() => handleDeleteMessage(m.id)}
                        className="absolute -top-2 -right-2 p-1 bg-rose-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete Message"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 font-mono">
                      {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>

              {/* Reply Form */}
              <form onSubmit={handleSendAdminReply} className="pt-4 border-t border-slate-800 flex gap-2">
                <input
                  type="text"
                  placeholder="Type official admin response..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="submit"
                  disabled={submittingReply}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-lg shadow-indigo-600/30 disabled:opacity-50"
                >
                  <Send size={14} /> Send Reply
                </button>
              </form>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 text-xs">
              Select a conversation from the left drawer to inspect transcript & telemetry.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatManagement;
