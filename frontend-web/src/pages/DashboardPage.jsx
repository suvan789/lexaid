import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

const QUICK_ACTIONS = [
  { title: 'Analyze Document', desc: 'Upload & understand legal documents with AI', icon: '🔍', path: '/analyze', color: 'from-blue-500 to-indigo-600' },
  { title: 'Generate Document', desc: 'Create legal documents from templates', icon: '📝', path: '/generate', color: 'from-emerald-500 to-teal-600' },
  { title: 'AI Legal Chat', desc: 'Ask questions about Indian law', icon: '💬', path: '/chat', color: 'from-violet-500 to-purple-600' },
  { title: 'Find a Lawyer', desc: 'Search & compare lawyers near you', icon: '👨‍⚖️', path: '/lawyers', color: 'from-amber-500 to-orange-600' },
  { title: 'Community Forum', desc: 'Ask & answer legal questions', icon: '👥', path: '/forum', color: 'from-pink-500 to-rose-600' },
  { title: 'Legal News', desc: 'AI-summarized legal news feed', icon: '📰', path: '/news', color: 'from-cyan-500 to-blue-600' },
];

export default function DashboardPage() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ docs: 0, generated: 0, posts: 0 });
  const [recentDocs, setRecentDocs] = useState([]);
  const [recentPosts, setRecentPosts] = useState([]);
  const [verifyStatus, setVerifyStatus] = useState('idle'); // idle, loading, sent, error
  const [mockLink, setMockLink] = useState(null);

  const handleVerifyNow = async () => {
    setVerifyStatus('loading');
    try {
      const res = await API.post('/api/auth/verify-now');
      updateUser(res.data);
      setVerifyStatus('verified');
    } catch (err) {
      setVerifyStatus('error');
    }
  };

  const handleResendVerification = async () => {
    setVerifyStatus('loading');
    try {
      const res = await API.post('/api/auth/send-verification');
      setVerifyStatus('sent');
      if (res.data.mock_link) {
        setMockLink(res.data.mock_link);
      }
    } catch (err) {
      setVerifyStatus('error');
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [docsRes, genRes, postsRes] = await Promise.allSettled([
        API.get('/api/documents/history'),
        API.get('/api/generator/history'),
        API.get('/api/forum/posts?limit=5'),
      ]);
      if (docsRes.status === 'fulfilled') {
        setRecentDocs(docsRes.value.data.slice(0, 5));
        setStats(s => ({ ...s, docs: docsRes.value.data.length }));
      }
      if (genRes.status === 'fulfilled') {
        setStats(s => ({ ...s, generated: genRes.value.data.length }));
      }
      if (postsRes.status === 'fulfilled') {
        setRecentPosts(postsRes.value.data.slice(0, 5));
        setStats(s => ({ ...s, posts: postsRes.value.data.length }));
      }
    } catch {}
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="page-container max-w-6xl mx-auto">
      {/* Verification Banner */}
      {user && !user.is_verified && (
        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-6 rounded-r-2xl shadow-sm animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-amber-500 text-2xl">⚠️</span>
              <div>
                <p className="text-sm font-semibold text-amber-900">Please verify your email address ({user.email})</p>
                <p className="text-xs text-amber-700">Verify your account to access all document generation features.</p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button 
                onClick={handleVerifyNow}
                disabled={verifyStatus === 'loading'}
                className="px-4 py-2 bg-amber-600 text-white rounded-xl text-xs font-bold hover:bg-amber-700 disabled:opacity-50 transition-colors shadow-sm"
              >
                {verifyStatus === 'loading' ? 'Verifying...' : '⚡ Verify Email Now'}
              </button>
              <button 
                onClick={handleResendVerification}
                disabled={verifyStatus === 'loading' || verifyStatus === 'sent'}
                className="px-3 py-2 bg-white border border-amber-300 text-amber-800 rounded-xl text-xs font-semibold hover:bg-amber-100 disabled:opacity-50 transition-colors"
              >
                {verifyStatus === 'sent' ? '✓ Link Generated' : '📧 Generate Verification Link'}
              </button>
            </div>
          </div>

          {mockLink && (
            <div className="mt-3 p-3 bg-amber-100/80 rounded-xl border border-amber-300 flex items-center justify-between gap-3">
              <p className="text-xs text-amber-900 font-medium truncate">
                ✉️ Link: <span className="font-mono">{window.location.origin}{mockLink}</span>
              </p>
              <button
                onClick={() => navigate(mockLink)}
                className="px-3 py-1 bg-navy text-white rounded-lg text-xs font-semibold hover:bg-navy-light whitespace-nowrap shadow-xs"
              >
                Open Link →
              </button>
            </div>
          )}
        </div>
      )}

      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-navy via-navy-light to-accent rounded-2xl p-6 lg:p-8 text-white mb-6 animate-fade-in">
        <h1 className="text-2xl lg:text-3xl font-bold mb-2">
          {getGreeting()}, {user?.full_name?.split(' ')[0] || 'User'} 👋
        </h1>
        <p className="text-white/70 text-sm lg:text-base">Welcome to LexAid — your AI-powered legal companion for Indian law</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Documents Analyzed', value: stats.docs, icon: '📄', color: 'bg-blue-50 text-blue-600' },
          { label: 'Documents Generated', value: stats.generated, icon: '📝', color: 'bg-green-50 text-green-600' },
          { label: 'Forum Posts', value: stats.posts, icon: '💬', color: 'bg-purple-50 text-purple-600' },
          { label: 'AI Chats', value: '∞', icon: '🤖', color: 'bg-amber-50 text-amber-600' },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
            <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center text-lg mb-3`}>
              {stat.icon}
            </div>
            <p className="text-2xl font-bold text-navy">{stat.value}</p>
            <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions Grid */}
      <h2 className="text-lg font-bold text-navy mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {(user?.role === 'lawyer' 
          ? [
              { title: 'Advocate Portal', desc: 'Manage client bookings & consultation requests', icon: '⚖️', path: '/lawyer/portal', color: 'from-amber-500 to-orange-600' },
              ...QUICK_ACTIONS.filter(a => a.path !== '/lawyers')
            ]
          : QUICK_ACTIONS
        ).map((action, i) => (
          <button
            key={i}
            id={`action-${action.path.replace('/', '')}`}
            onClick={() => navigate(action.path)}
            className="group bg-white rounded-xl p-5 text-left shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-fade-in border border-gray-100"
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center text-2xl mb-3 group-hover:scale-110 transition-transform`}>
              {action.icon}
            </div>
            <h3 className="font-semibold text-navy mb-1">{action.title}</h3>
            <p className="text-sm text-gray-500">{action.desc}</p>
            <div className="mt-3 text-accent text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
              Get Started →
            </div>
          </button>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Documents */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h3 className="font-bold text-navy mb-4 flex items-center gap-2">📄 Recent Documents</h3>
          {recentDocs.length === 0 ? (
            <p className="text-gray-400 text-sm py-4 text-center">No documents analyzed yet</p>
          ) : (
            <div className="space-y-3">
              {recentDocs.map((doc) => (
                <div key={doc.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => navigate('/results', { state: { documentId: doc.id } })}>
                  <div className={`w-2 h-2 rounded-full ${doc.overall_risk === 'HIGH' ? 'bg-red-500' : doc.overall_risk === 'MEDIUM' ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{doc.filename}</p>
                    <p className="text-xs text-gray-400">{new Date(doc.created_at).toLocaleDateString()}</p>
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${doc.overall_risk === 'HIGH' ? 'bg-red-100 text-red-700' : doc.overall_risk === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                    {doc.overall_risk}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Forum Posts */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h3 className="font-bold text-navy mb-4 flex items-center gap-2">💬 Community Discussions</h3>
          {recentPosts.length === 0 ? (
            <p className="text-gray-400 text-sm py-4 text-center">No forum posts yet</p>
          ) : (
            <div className="space-y-3">
              {recentPosts.map((post) => (
                <div key={post.id} className="p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => navigate(`/forum/${post.id}`)}>
                  <p className="text-sm font-medium text-gray-800 line-clamp-1">{post.title}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-gray-400">{post.category}</span>
                    <span className="text-xs text-gray-400">👁 {post.views}</span>
                    <span className="text-xs text-gray-400">👍 {post.upvotes}</span>
                    {post.is_answered && <span className="text-xs text-green-600 font-medium">✓ Answered</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
