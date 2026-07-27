import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider } from './context/AppContext';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import DashboardPage from './pages/DashboardPage';
import AnalyzePage from './pages/AnalyzePage';
import ResultsPage from './pages/ResultsPage';
import GeneratorPage from './pages/GeneratorPage';
import GeneratedDocPage from './pages/GeneratedDocPage';
import AIChatPage from './pages/AIChatPage';
import LawyersPage from './pages/LawyersPage';
import ForumPage from './pages/ForumPage';
import ForumPostPage from './pages/ForumPostPage';
import NewsPage from './pages/NewsPage';
import ProfilePage from './pages/ProfilePage';
import LawyerPortalPage from './pages/LawyerPortalPage';
import DirectChatPage from './pages/DirectChatPage';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught UI error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center border border-gray-100">
            <div className="text-5xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-navy mb-2">Something went wrong</h2>
            <p className="text-sm text-gray-500 mb-6">An unexpected UI error occurred. Click reload to refresh your app.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 bg-navy text-white rounded-xl font-semibold text-sm hover:bg-navy-light transition-colors"
            >
              🔄 Reload Application
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="lg:ml-60">
        <Navbar />
        <main className="p-4 lg:p-6 mt-16">{children}</main>
      </div>
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/" element={<ProtectedRoute><AppLayout><DashboardPage /></AppLayout></ProtectedRoute>} />
      <Route path="/analyze" element={<ProtectedRoute><AppLayout><AnalyzePage /></AppLayout></ProtectedRoute>} />
      <Route path="/results" element={<ProtectedRoute><AppLayout><ResultsPage /></AppLayout></ProtectedRoute>} />
      <Route path="/generate" element={<ProtectedRoute><AppLayout><GeneratorPage /></AppLayout></ProtectedRoute>} />
      <Route path="/generate/result" element={<ProtectedRoute><AppLayout><GeneratedDocPage /></AppLayout></ProtectedRoute>} />
      <Route path="/chat" element={<ProtectedRoute><AppLayout><AIChatPage /></AppLayout></ProtectedRoute>} />
      <Route path="/lawyers" element={<ProtectedRoute><AppLayout><LawyersPage /></AppLayout></ProtectedRoute>} />
      <Route path="/forum" element={<ProtectedRoute><AppLayout><ForumPage /></AppLayout></ProtectedRoute>} />
      <Route path="/forum/:id" element={<ProtectedRoute><AppLayout><ForumPostPage /></AppLayout></ProtectedRoute>} />
      <Route path="/news" element={<ProtectedRoute><AppLayout><NewsPage /></AppLayout></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><AppLayout><ProfilePage /></AppLayout></ProtectedRoute>} />
      <Route path="/lawyer/portal" element={<ProtectedRoute><AppLayout><LawyerPortalPage /></AppLayout></ProtectedRoute>} />
      <Route path="/messages" element={<ProtectedRoute><AppLayout><DirectChatPage /></AppLayout></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppProvider>
          <Router>
            <AppRoutes />
          </Router>
        </AppProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
