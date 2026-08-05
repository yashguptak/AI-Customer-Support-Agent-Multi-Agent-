import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import AdminLayout from './components/AdminLayout';
import AdminRoute from './components/AdminRoute';

import Login from './pages/Login';
import Register from './pages/Register';

// Customer Pages
import Dashboard from './pages/Dashboard';
import Tickets from './pages/Tickets';
import Chat from './pages/Chat';
import KnowledgeBase from './pages/KnowledgeBase';
import Analytics from './pages/Analytics';

// Enterprise Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import TicketManagement from './pages/admin/TicketManagement';
import ChatManagement from './pages/admin/ChatManagement';
import AIControlPanel from './pages/admin/AIControlPanel';
import AdminKnowledgeBase from './pages/admin/AdminKnowledgeBase';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminSettings from './pages/admin/AdminSettings';
import AuditLogs from './pages/admin/AuditLogs';
import SystemHealth from './pages/admin/SystemHealth';

// ProtectedRoute component for Customers
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center gap-4 text-slate-300">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-medium">Verifying user context...</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// RootRedirect component to send user to correct initial route
const RootRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'admin' || user.role === 'super_admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }
  return <Navigate to="/dashboard" replace />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Root Redirect */}
          <Route path="/" element={<RootRedirect />} />

          {/* Protected Customer Portal */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="tickets" element={<Tickets />} />
            <Route path="chat" element={<Chat />} />
            <Route path="knowledge" element={<KnowledgeBase />} />
            <Route path="analytics" element={<Analytics />} />
          </Route>

          {/* Protected Enterprise Admin Portal */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="tickets" element={<TicketManagement />} />
            <Route path="conversations" element={<ChatManagement />} />
            <Route path="knowledge" element={<AdminKnowledgeBase />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="ai-control" element={<AIControlPanel />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="audit-logs" element={<AuditLogs />} />
            <Route path="health" element={<SystemHealth />} />
          </Route>

          {/* Fallback Catch-all Route */}
          <Route path="*" element={<RootRedirect />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
