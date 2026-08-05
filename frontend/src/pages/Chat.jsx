import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import client from '../api/client';
import {
  MessageSquare,
  Send,
  User as UserIcon,
  Bot,
  Calendar,
  Star,
  ThumbsUp,
  Cpu,
  Clock,
  Sparkles,
  ArrowLeft,
  AlertCircle
} from 'lucide-react';

const Chat = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialConvId = searchParams.get('conversationId');

  const [tickets, setTickets] = useState([]);
  const [conversationsByTicket, setConversationsByTicket] = useState({});
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  
  // UI states
  const [loadingSidebar, setLoadingSidebar] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [mobileView, setMobileView] = useState('list'); // 'list' or 'chat'
  const [error, setError] = useState('');

  // Feedback states
  const [activeFeedbackMsgId, setActiveFeedbackMsgId] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  const messagesEndRef = useRef(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loadingMessages]);

  // Initial load: fetch tickets and their conversations
  useEffect(() => {
    const initChat = async () => {
      try {
        setLoadingSidebar(true);
        const ticketsRes = await client.get('/api/tickets');
        const ticketsData = ticketsRes.data;
        setTickets(ticketsData);

        const convsMap = {};
        for (const t of ticketsData) {
          try {
            const convsRes = await client.get(`/api/conversations/ticket/${t.id}`);
            convsMap[t.id] = convsRes.data || [];
          } catch (err) {
            console.error(`Error loading conv for ticket ${t.id}`, err);
          }
        }
        setConversationsByTicket(convsMap);

        // If conversationId is passed in URL query param, load it
        if (initialConvId) {
          const convId = parseInt(initialConvId, 10);
          await loadConversationById(convId, ticketsData);
        }
      } catch (err) {
        console.error("Init chat error", err);
        setError("Failed to load conversation dashboard");
      } finally {
        setLoadingSidebar(false);
      }
    };

    initChat();
  }, [initialConvId]);

  const loadConversationById = async (convId, availableTickets) => {
    try {
      setLoadingMessages(true);
      // Fetch conversation details
      const convRes = await client.get(`/api/conversations/${convId}`);
      const conv = convRes.data;
      setSelectedConversation(conv);

      // Find matching ticket
      const ticket = availableTickets.find(t => t.id === conv.ticket_id);
      if (ticket) {
        setSelectedTicket(ticket);
      } else {
        // Fallback fetch ticket
        const ticketRes = await client.get(`/api/tickets/${conv.ticket_id}`);
        setSelectedTicket(ticketRes.data);
      }

      // Fetch messages
      const msgsRes = await client.get(`/api/conversations/${convId}/messages`);
      setMessages(msgsRes.data);
      setMobileView('chat');
    } catch (err) {
      console.error(err);
      setError("Failed to load chat conversation details");
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSelectTicket = async (ticket) => {
    setSelectedTicket(ticket);
    const convs = conversationsByTicket[ticket.id] || [];

    if (convs.length > 0) {
      // Load first conversation
      const conv = convs[0];
      setSelectedConversation(conv);
      setSearchParams({ conversationId: conv.id });
    } else {
      // No conversation exists yet
      setSelectedConversation(null);
      setMessages([]);
      setMobileView('chat');
    }
  };

  const handleCreateConversation = async (ticketId) => {
    try {
      setLoadingMessages(true);
      const res = await client.post('/api/conversations', { ticket_id: ticketId });
      const newConv = res.data;

      // Update map
      const currentConvs = conversationsByTicket[ticketId] || [];
      setConversationsByTicket({
        ...conversationsByTicket,
        [ticketId]: [...currentConvs, newConv]
      });

      setSelectedConversation(newConv);
      setSearchParams({ conversationId: newConv.id });
    } catch (err) {
      setError("Could not initialize conversation thread");
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !selectedConversation) return;

    const messageText = inputMessage.trim();
    setInputMessage('');
    setSending(true);

    // Optimistically append user message to local state
    const optimisticMessage = {
      id: Date.now(), // temporary ID
      sender: 'USER',
      message: messageText,
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, optimisticMessage]);

    try {
      // Post to /chat to get AI response
      const chatRes = await client.post('/api/chat', {
        conversation_id: selectedConversation.id,
        message: messageText
      });

      // Fetch fresh message history to get the saved IDs and precise metadata
      const msgsRes = await client.get(`/api/conversations/${selectedConversation.id}/messages`);
      setMessages(msgsRes.data);
    } catch (err) {
      console.error(err);
      setError("Message sent, but failed to retrieve agent reply.");
    } finally {
      setSending(false);
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!activeFeedbackMsgId) return;

    setSubmittingFeedback(true);
    try {
      await client.post('/api/feedback', {
        message_id: activeFeedbackMsgId,
        rating: rating,
        comment: comment.trim() || null
      });

      // Clear states
      setActiveFeedbackMsgId(null);
      setComment('');
      setRating(5);
      alert('Thank you for your rating and feedback!');
    } catch (err) {
      alert('Failed to submit feedback. Please try again.');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  return (
    <div className="h-[calc(100vh-8.5rem)] bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden flex relative">
      {/* LEFT SIDEBAR: Tickets & Conversation Thread Selector */}
      <div
        className={`w-full md:w-80 border-r border-slate-100 dark:border-slate-700 flex flex-col h-full bg-slate-50/50 dark:bg-slate-800/50 absolute md:relative z-10 transition-transform duration-300 ${
          mobileView === 'chat' ? '-translate-x-full md:translate-x-0' : 'translate-x-0'
        }`}
      >
        <div className="p-4 border-b border-slate-150 dark:border-slate-700 bg-white dark:bg-slate-800">
          <h3 className="font-bold text-base text-slate-800 dark:text-slate-100">Ticket Chats</h3>
          <p className="text-xs text-slate-400 mt-0.5">Select a ticket to chat with support agents</p>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {loadingSidebar ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2.5">
              <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-slate-400">Loading tickets...</span>
            </div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-10 text-xs text-slate-400">No tickets open. Create a ticket first.</div>
          ) : (
            tickets.map((t) => {
              const isActive = selectedTicket?.id === t.id;
              const hasConv = (conversationsByTicket[t.id] || []).length > 0;
              return (
                <button
                  key={t.id}
                  onClick={() => handleSelectTicket(t)}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all duration-200 ${
                    isActive
                      ? 'bg-white dark:bg-slate-700 border-indigo-200 dark:border-slate-650 shadow-sm'
                      : 'border-transparent hover:bg-white/60 dark:hover:bg-slate-700/40'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500">
                      #{t.id} • {t.category}
                    </span>
                    <span
                      className={`inline-flex px-1.5 py-0.5 rounded text-[9px] font-extrabold ${
                        t.priority === 'URGENT'
                          ? 'bg-rose-100 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400'
                          : t.priority === 'HIGH'
                          ? 'bg-orange-100 dark:bg-orange-950/30 text-orange-600'
                          : 'bg-slate-100 dark:bg-slate-900 text-slate-500'
                      }`}
                    >
                      {t.priority}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 truncate">{t.title}</h4>
                  <p className="text-xs text-slate-400 truncate mt-1">
                    {hasConv ? 'Conversation Active' : 'No support thread started'}
                  </p>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT PANEL: Active Messaging View */}
      <div
        className={`flex-1 flex flex-col h-full bg-white dark:bg-slate-800 absolute inset-0 md:relative transition-transform duration-300 ${
          mobileView === 'list' ? 'translate-x-full md:translate-x-0' : 'translate-x-0'
        }`}
      >
        {selectedTicket ? (
          <>
            {/* Chat header */}
            <div className="h-16 px-6 border-b border-slate-150 dark:border-slate-700 flex items-center justify-between bg-white dark:bg-slate-800 shrink-0">
              <div className="flex items-center gap-3.5 overflow-hidden">
                <button
                  onClick={() => setMobileView('list')}
                  className="md:hidden p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500"
                >
                  <ArrowLeft size={20} />
                </button>
                <div className="overflow-hidden">
                  <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 truncate">
                    {selectedTicket.title}
                  </h3>
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold uppercase tracking-wider">
                    {selectedTicket.category} • STATUS: {selectedTicket.status}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-800 rounded-full text-xs text-indigo-700 dark:text-indigo-400 font-semibold shadow-sm">
                  <Sparkles size={12} className="animate-spin" />
                  Support Agent Online
                </div>
              </div>
            </div>

            {/* Error notifications */}
            {error && (
              <div className="p-3 bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2 shrink-0 border-b border-rose-500/10">
                <AlertCircle size={14} />
                <span>{error}</span>
              </div>
            )}

            {/* Message Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-0 bg-slate-50/30 dark:bg-slate-850/30">
              {!selectedConversation ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
                  <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center">
                    <MessageSquare size={28} />
                  </div>
                  <div className="max-w-xs space-y-1.5">
                    <h3 className="font-bold text-slate-800 dark:text-slate-200">Start Live Support Chat</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Spawn an autonomous AI support conversation to begin analyzing this ticket.
                    </p>
                  </div>
                  <button
                    onClick={() => handleCreateConversation(selectedTicket.id)}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition-colors duration-150"
                  >
                    Start Chat Session
                  </button>
                </div>
              ) : loadingMessages ? (
                <div className="h-full flex flex-col items-center justify-center gap-2">
                  <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs text-slate-400">Loading messages...</span>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-16 text-xs text-slate-400">
                  Support session initialized. Ask a question to begin.
                </div>
              ) : (
                messages.map((msg) => {
                  const isUser = msg.sender === 'USER';
                  return (
                    <div key={msg.id} className={`flex gap-3.5 max-w-[85%] ${isUser ? 'ml-auto flex-row-reverse' : ''}`}>
                      {/* Avatar */}
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm ${
                          isUser
                            ? 'bg-gradient-to-tr from-indigo-500 to-purple-600'
                            : 'bg-gradient-to-tr from-slate-650 to-slate-800'
                        }`}
                      >
                        {isUser ? <UserIcon size={16} /> : <Bot size={16} />}
                      </div>

                      {/* Bubble */}
                      <div className="space-y-1.5">
                        <div
                          className={`p-4 rounded-3xl text-sm leading-relaxed ${
                            isUser
                              ? 'bg-indigo-600 text-white rounded-tr-none'
                              : 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-100 dark:border-slate-600 rounded-tl-none shadow-sm'
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{msg.message}</p>

                          {/* AI Metadata Display */}
                          {!isUser && (msg.model || msg.latency_ms || msg.tokens_used) && (
                            <div className="mt-3.5 pt-2 border-t border-slate-100 dark:border-slate-600 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-slate-400 dark:text-slate-500 font-semibold">
                              {msg.model && (
                                <span className="flex items-center gap-1">
                                  <Cpu size={10} />
                                  {msg.model}
                                </span>
                              )}
                              {msg.latency_ms && (
                                <span className="flex items-center gap-1">
                                  <Clock size={10} />
                                  {msg.latency_ms}ms
                                </span>
                              )}
                              {msg.tokens_used && (
                                <span>Tokens: {msg.tokens_used}</span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Message Timestamp & Rating Action */}
                        <div
                          className={`flex items-center gap-2 text-[10px] text-slate-400 font-medium ${
                            isUser ? 'justify-end' : ''
                          }`}
                        >
                          <span>{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          
                          {!isUser && msg.id && (
                            <>
                              <span>•</span>
                              <button
                                onClick={() => setActiveFeedbackMsgId(msg.id)}
                                className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5"
                              >
                                <Star size={10} className="fill-current" />
                                Rate Answer
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Feedback Modal Overlay */}
            {activeFeedbackMsgId && (
              <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs z-20 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-xl max-w-sm w-full space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-700">
                    <h3 className="font-bold text-sm">Submit Answer Feedback</h3>
                    <button
                      onClick={() => setActiveFeedbackMsgId(null)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      Close
                    </button>
                  </div>

                  <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                    {/* Star Rating (1-5) */}
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                        Answer Rating
                      </label>
                      <div className="flex gap-1.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            className="p-1 text-amber-400 hover:scale-110 transition-transform"
                          >
                            <Star
                              size={24}
                              className={star <= rating ? 'fill-current' : 'text-slate-300 dark:text-slate-600'}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Optional Comment */}
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                        Optional Comment
                      </label>
                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="What was good/bad about this response?"
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-750 focus:border-indigo-500 rounded-xl text-xs h-20 focus:outline-none resize-none transition-colors"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submittingFeedback}
                      className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition-colors"
                    >
                      {submittingFeedback ? 'Submitting...' : 'Submit Evaluation'}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* Input Bar */}
            {selectedConversation && (
              <form
                onSubmit={handleSendMessage}
                className="p-4 border-t border-slate-150 dark:border-slate-700 flex gap-3.5 bg-white dark:bg-slate-800 shrink-0"
              >
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  disabled={sending}
                  placeholder={sending ? "Agent is typing..." : "Type your message here..."}
                  className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 rounded-2xl text-sm focus:outline-none transition-colors duration-200"
                  required
                />
                <button
                  type="submit"
                  disabled={sending || !inputMessage.trim()}
                  className="p-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-100 dark:disabled:bg-slate-700 disabled:text-slate-400 text-white rounded-2xl transition-all duration-200 shadow-md shadow-indigo-600/10 active:scale-[0.97]"
                >
                  <Send size={18} />
                </button>
              </form>
            )}
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
            <div className="w-14 h-14 bg-slate-50 dark:bg-slate-900/50 text-slate-400 rounded-full flex items-center justify-center">
              <MessageSquare size={28} />
            </div>
            <div className="max-w-xs space-y-1.5">
              <h3 className="font-bold text-slate-800 dark:text-slate-250">No Ticket Selected</h3>
              <p className="text-xs text-slate-400">
                Choose a ticket from the left sidebar to start or load support chats.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
