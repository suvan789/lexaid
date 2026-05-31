import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    try {
      const res = await API.post('/api/auth/login', { email, password });
      login(res.data.access_token, res.data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.detail || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left: Branding */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-navy via-navy-light to-accent items-center justify-center p-12">
        <div className="max-w-md text-white animate-fade-in">
          <div className="text-6xl mb-6">⚖️</div>
          <h1 className="text-4xl font-bold mb-4">LexAid</h1>
          <p className="text-xl text-white/80 mb-8">AI-Powered Legal Super App for Indian Citizens</p>
          <div className="space-y-4">
            {['Document Analysis & Generation', 'AI Legal Chatbot', 'Find & Compare Lawyers', 'Community Legal Forum', 'AI-Summarized Legal News'].map((f, i) => (
              <div key={i} className="flex items-center gap-3 text-white/70">
                <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs">✓</span>
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-gray-50">
        <div className="w-full max-w-md animate-fade-in">
          <div className="lg:hidden text-center mb-8">
            <div className="text-5xl mb-3">⚖️</div>
            <h1 className="text-3xl font-bold text-navy">LexAid</h1>
          </div>

          <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-8">
            <h2 className="text-2xl font-bold text-navy mb-1">Welcome back</h2>
            <p className="text-gray-500 mb-6">Sign in to your LexAid account</p>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all text-sm"
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <Link to="/forgot-password" className="text-xs font-semibold text-accent hover:underline">
                    Forgot Password?
                  </Link>
                </div>
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all text-sm"
                  placeholder="••••••••"
                  required
                />
              </div>
              <button
                id="login-submit"
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-navy text-white rounded-xl font-semibold hover:bg-navy-light transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Signing in...</>
                ) : 'Sign In'}
              </button>
            </form>
          </div>

          <p className="text-center mt-6 text-gray-500 text-sm">
            Don't have an account?{' '}
            <Link to="/register" className="text-accent font-semibold hover:underline">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
