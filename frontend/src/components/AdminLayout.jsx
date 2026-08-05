import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';
import {
  LayoutDashboard,
  Users,
  Ticket,
  MessageSquare,
  BookOpen,
  BarChart3,
  Cpu,
  Settings,
  ShieldAlert,
  Activity,
  LogOut,
  Menu,
  X,
  Search,
  Moon,
  Sun,
  Bell,
  CheckCircle,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || true;
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // WebSocket Live Notifications
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/api/ws/admin?token=${token}`;

    let socket;
    try {
      socket = new WebSocket(wsUrl);
      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type !== 'pong') {
            setNotifications((prev) => [data, ...prev.slice(0, 19)]);
            setUnreadCount((prev) => prev + 1);
          }
        } catch (e) {
          console.error('WS parse error', e);
        }
      };
    } catch (err) {
      console.warn('WebSocket connection not established', err);
    }

    return () => {
      if (socket) socket.close();
    };
  }, []);

  const handleGlobalSearch = async (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (!val.trim()) {
      setSearchResults(null);
      return;
    }
    setSearchLoading(true);
    try {
      const res = await client.get(`/api/admin/search?q=${encodeURIComponent(val)}`);
      setSearchResults(res.data);
    } catch (err) {
      console.error('Search failed', err);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Users', path: '/admin/users', icon: Users },
    { name: 'Tickets', path: '/admin/tickets', icon: Ticket },
    { name: 'Conversations', path: '/admin/conversations', icon: MessageSquare },
    { name: 'Knowledge Base', path: '/admin/knowledge', icon: BookOpen },
    { name: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
    { name: 'AI Control', path: '/admin/ai-control', icon: Cpu },
    { name: 'System Settings', path: '/admin/settings', icon: Settings },
    { name: 'Audit Logs', path: '/admin/audit-logs', icon: ShieldAlert },
    { name: 'System Health', path: '/admin/health', icon: Activity },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans antialiased">
      {/* Sidebar for Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-slate-900 border-r border-slate-800 fixed h-full z-20">
        {/* Enterprise Brand */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800 gap-3 bg-slate-900/50">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/20">
            <ShieldCheck size={22} />
          </div>
          <div>
            <h1 className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
              SupportOS <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 font-mono border border-indigo-500/30">PRO</span>
            </h1>
            <p className="text-[11px] text-slate-400 font-medium">Enterprise Admin Console</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
          <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            Main Management
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                    isActive
                      ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 shadow-md shadow-indigo-950'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                  }`
                }
              >
                <Icon size={18} />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Admin Profile Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-0.5">
              <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center font-bold text-indigo-300">
                {user?.name ? user.name[0].toUpperCase() : 'A'}
              </div>
            </div>
            <div className="overflow-hidden flex-1">
              <h4 className="font-semibold text-xs text-white truncate">{user?.name || 'Administrator'}</h4>
              <span className="inline-block text-[10px] font-semibold text-purple-400 uppercase tracking-wider">
                {user?.role === 'super_admin' ? 'Super Admin' : 'Admin'}
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full px-3 py-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 font-medium text-xs border border-rose-500/20 transition-all"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-30"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main Layout Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        {/* Topbar Header */}
        <header className="h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-10 flex items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3 flex-1 max-w-lg">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
            >
              <Menu size={20} />
            </button>

            {/* Global Search Bar */}
            <div className="relative flex-1">
              <div className="relative">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Global Search (Users, Tickets, Audit Logs)..."
                  value={searchQuery}
                  onChange={handleGlobalSearch}
                  className="w-full pl-10 pr-4 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>

              {/* Search Results Dropdown */}
              {searchResults && (
                <div className="absolute left-0 right-0 mt-2 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-3 z-50 max-h-96 overflow-y-auto">
                  <div className="flex justify-between items-center pb-2 mb-2 border-b border-slate-800">
                    <span className="text-xs font-semibold text-slate-400">Search Results</span>
                    <button onClick={() => setSearchResults(null)} className="text-slate-500 hover:text-white">
                      <X size={14} />
                    </button>
                  </div>
                  {searchResults.users?.length > 0 && (
                    <div className="mb-3">
                      <h5 className="text-[10px] uppercase font-bold text-indigo-400 mb-1">Users</h5>
                      {searchResults.users.map((u) => (
                        <div
                          key={u.id}
                          onClick={() => {
                            navigate(`/admin/users`);
                            setSearchResults(null);
                          }}
                          className="p-2 hover:bg-slate-800 rounded-lg cursor-pointer text-xs flex justify-between items-center"
                        >
                          <div>
                            <span className="font-semibold text-white">{u.name}</span>
                            <span className="text-slate-400 ml-2">({u.email})</span>
                          </div>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">{u.role}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {searchResults.tickets?.length > 0 && (
                    <div>
                      <h5 className="text-[10px] uppercase font-bold text-indigo-400 mb-1">Tickets</h5>
                      {searchResults.tickets.map((t) => (
                        <div
                          key={t.id}
                          onClick={() => {
                            navigate(`/admin/tickets`);
                            setSearchResults(null);
                          }}
                          className="p-2 hover:bg-slate-800 rounded-lg cursor-pointer text-xs flex justify-between items-center"
                        >
                          <span className="text-white truncate">#{t.id} - {t.title}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300">{t.status}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {(!searchResults.users?.length && !searchResults.tickets?.length) && (
                    <p className="text-xs text-slate-500 text-center py-2">No matching results found.</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-3">
            {/* Live WebSockets Notification Indicator */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setUnreadCount(0);
                }}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all relative"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-indigo-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Drawer */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-4 z-50">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" /> Live Feed
                    </span>
                    <button onClick={() => setShowNotifications(false)} className="text-slate-400 hover:text-white">
                      <X size={14} />
                    </button>
                  </div>
                  <div className="space-y-2 mt-3 max-h-64 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-slate-500 py-4 text-center">No recent live events</p>
                    ) : (
                      notifications.map((n, idx) => (
                        <div key={idx} className="p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs">
                          <p className="text-slate-300 font-medium">{n.message || 'System Notification'}</p>
                          <span className="text-[10px] text-slate-500 mt-1 block">{n.type || 'EVENT'}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
              title="Toggle Theme"
            >
              {darkMode ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} />}
            </button>

            {/* System Status Pill */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-xs text-emerald-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              RBAC Guard Active
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
