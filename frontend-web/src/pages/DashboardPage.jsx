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
  const [stats, setStats] = useState({ docs: 0, generated: 0, posts: 0, appointments: 0 });
  const [recentDocs, setRecentDocs] = useState([]);
  const [recentPosts, setRecentPosts] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [consultationFilter, setConsultationFilter] = useState('all');
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
      const [docsRes, genRes, postsRes, apptRes] = await Promise.allSettled([
        API.get('/api/documents/history'),
        API.get('/api/generator/history'),
        API.get('/api/forum/posts?limit=5'),
        API.get('/api/appointments'),
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
      if (apptRes.status === 'fulfilled') {
        setAppointments(apptRes.value.data);
        setStats(s => ({ ...s, appointments: apptRes.value.data.length }));
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

      {/* Smart Case Assessor Widget (Powered by Machine Learning) */}
      <div className="bg-gradient-to-r from-navy via-navy-light to-accent rounded-2xl p-6 text-white shadow-md mb-8">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚖️</span>
            <h2 className="text-lg font-bold">Smart Case Win & Bail Predictor</h2>
          </div>
          <span className="text-xs bg-white/20 text-white px-2.5 py-1 rounded-full font-medium">
            ⚡ Powered by Machine Learning Engine
          </span>
        </div>
        <p className="text-xs text-white/80 mb-4">
          Enter facts of any legal case, IPC charges, or court dispute to estimate case win probability and bail chances:
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            id="case-facts-input"
            placeholder="e.g. Petitioner accused under IPC Section 420 for cheating. First time offender, fully cooperating with investigation..."
            className="flex-1 px-4 py-2.5 rounded-xl text-xs text-gray-900 bg-white outline-none focus:ring-2 focus:ring-accent"
            onKeyDown={async (e) => {
              if (e.key === 'Enter') {
                const btn = document.getElementById('predict-btn');
                if (btn) btn.click();
              }
            }}
          />
          <button
            id="predict-btn"
            onClick={async () => {
              const val = document.getElementById('case-facts-input')?.value;
              if (!val || val.length < 10) return alert('Please enter at least 10 characters of case facts.');
              const resBox = document.getElementById('predict-result-box');
              if (resBox) resBox.innerHTML = '<div class="text-xs text-white/80 py-2">Analyzing case with Machine Learning model...</div>';
              try {
                const res = await API.post('/api/ml/predict-outcome', { text: val });
                if (resBox) {
                  resBox.innerHTML = `
                    <div class="mt-3 p-4 bg-white/10 rounded-xl backdrop-blur-xs border border-white/20 animate-fade-in text-white text-xs space-y-1">
                      <div class="flex justify-between items-center">
                        <span class="font-bold text-accent-light">Predicted Case Outcome:</span>
                        <span class="bg-emerald-500/20 text-emerald-300 font-mono px-2 py-0.5 rounded text-[10px]">Confidence: ${res.data.confidence_percentage}%</span>
                      </div>
                      <p class="text-base font-extrabold text-white">${res.data.predicted_outcome}</p>
                    </div>
                  `;
                }
              } catch (err) {
                if (resBox) resBox.innerHTML = '<div class="text-xs text-red-300 py-2">Prediction failed. Please try again.</div>';
              }
            }}
            className="px-6 py-2.5 bg-accent hover:bg-accent-dark text-white rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            Predict Win Probability
          </button>
        </div>
        <div id="predict-result-box"></div>
      </div>

      {/* 📅 Client Portal: Consultations Booking History & Real-Time Tracker */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">📅</span>
              <h2 className="text-lg font-bold text-navy">Consultation History & Status Tracker</h2>
              <span className="text-xs bg-navy/10 text-navy font-bold px-2.5 py-0.5 rounded-full">
                {appointments.length} Total Bookings
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Track advocate confirmation, scheduled dates, and legal consultation progress</p>
          </div>

          <div className="flex items-center gap-1.5 bg-gray-50 p-1.5 rounded-xl border border-gray-200 text-xs">
            {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((tab) => (
              <button
                key={tab}
                onClick={() => setConsultationFilter(tab)}
                className={`px-3 py-1.5 rounded-lg font-semibold capitalize transition-all cursor-pointer ${
                  consultationFilter === tab
                    ? 'bg-navy text-white shadow-xs'
                    : 'text-gray-600 hover:text-navy hover:bg-gray-100'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {appointments.filter(a => consultationFilter === 'all' || a.status === consultationFilter).length === 0 ? (
          <div className="text-center py-10 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
            <p className="text-3xl mb-2">📋</p>
            <h4 className="text-sm font-bold text-navy mb-1">No Consultations Found</h4>
            <p className="text-xs text-gray-500 mb-4">Book an appointment with an advocate to track legal consultations here.</p>
            <button
              onClick={() => navigate('/lawyers')}
              className="px-4 py-2 bg-navy text-white text-xs font-bold rounded-xl hover:bg-navy-light transition-all shadow-sm cursor-pointer"
            >
              👨‍⚖️ Book Consultation Now
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments
              .filter(a => consultationFilter === 'all' || a.status === consultationFilter)
              .map((apt) => {
                const isCancelled = apt.status === 'cancelled';
                const currentStep = isCancelled ? -1 : apt.status === 'completed' ? 3 : apt.status === 'confirmed' ? 2 : 1;

                return (
                  <div key={apt.id} className="p-5 bg-gradient-to-br from-gray-50 via-white to-blue-50/20 border border-gray-200/80 rounded-2xl shadow-xs space-y-4 hover:border-accent/40 transition-all">
                    {/* Top Row: Booking ID, Advocate Name, Status Badge */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-navy text-white font-bold flex items-center justify-center text-base shrink-0 shadow-sm">
                          {apt.lawyer?.name ? apt.lawyer.name.replace('Adv. ', '').charAt(0) : '⚖️'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-navy text-sm">{apt.lawyer?.name || 'Advocate Legal Counsel'}</h4>
                            <span className="text-[10px] font-mono font-semibold bg-gray-200/70 text-gray-700 px-2 py-0.5 rounded">
                              #BK-{apt.id.slice(0, 8).toUpperCase()}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">
                            {apt.lawyer?.specialization?.join(', ')} • {apt.lawyer?.city || 'India'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-start md:self-auto">
                        <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 ${
                          apt.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                          apt.status === 'completed' ? 'bg-blue-100 text-blue-800 border border-blue-300' :
                          apt.status === 'cancelled' ? 'bg-red-100 text-red-700 border border-red-200' :
                          'bg-amber-100 text-amber-800 border border-amber-300 animate-pulse'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            apt.status === 'confirmed' ? 'bg-emerald-600' :
                            apt.status === 'completed' ? 'bg-blue-600' :
                            apt.status === 'cancelled' ? 'bg-red-600' :
                            'bg-amber-600'
                          }`}></span>
                          {apt.status === 'pending' ? 'Pending Confirmation' : apt.status}
                        </span>
                      </div>
                    </div>

                    {/* Step Timeline Consultation Status Tracker */}
                    {!isCancelled && (
                      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-3">Live Consultation Status Tracker</p>
                        
                        <div className="grid grid-cols-4 gap-2 text-center relative">
                          <div className="absolute top-3 left-[12%] right-[12%] h-0.5 bg-gray-200 -z-0"></div>

                          {/* Step 1: Request Submitted */}
                          <div className="relative z-10 flex flex-col items-center">
                            <div className="w-6 h-6 rounded-full bg-emerald-500 text-white text-xs font-bold flex items-center justify-center shadow-xs">✓</div>
                            <p className="text-[11px] font-bold text-navy mt-1.5">Submitted</p>
                            <p className="text-[9px] text-gray-400 hidden sm:block">Booking Sent</p>
                          </div>

                          {/* Step 2: Advocate Acceptance */}
                          <div className="relative z-10 flex flex-col items-center">
                            <div className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center shadow-xs ${
                              currentStep >= 2 ? 'bg-emerald-500 text-white' : currentStep === 1 ? 'bg-amber-500 text-white animate-pulse' : 'bg-gray-200 text-gray-500'
                            }`}>
                              {currentStep >= 2 ? '✓' : '2'}
                            </div>
                            <p className={`text-[11px] font-bold mt-1.5 ${currentStep >= 1 ? 'text-navy' : 'text-gray-400'}`}>Confirmation</p>
                            <p className="text-[9px] text-gray-400 hidden sm:block">{currentStep >= 2 ? 'Accepted' : 'Awaiting Advocate'}</p>
                          </div>

                          {/* Step 3: Session Active */}
                          <div className="relative z-10 flex flex-col items-center">
                            <div className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center shadow-xs ${
                              currentStep >= 3 ? 'bg-emerald-500 text-white' : currentStep === 2 ? 'bg-blue-600 text-white animate-pulse' : 'bg-gray-200 text-gray-500'
                            }`}>
                              {currentStep >= 3 ? '✓' : '3'}
                            </div>
                            <p className={`text-[11px] font-bold mt-1.5 ${currentStep >= 2 ? 'text-navy' : 'text-gray-400'}`}>Session Ready</p>
                            <p className="text-[9px] text-gray-400 hidden sm:block">{currentStep >= 2 ? 'Chat Active' : 'Pending'}</p>
                          </div>

                          {/* Step 4: Completed */}
                          <div className="relative z-10 flex flex-col items-center">
                            <div className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center shadow-xs ${
                              currentStep >= 3 ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-500'
                            }`}>
                              {currentStep >= 3 ? '✓' : '4'}
                            </div>
                            <p className={`text-[11px] font-bold mt-1.5 ${currentStep >= 3 ? 'text-navy' : 'text-gray-400'}`}>Completed</p>
                            <p className="text-[9px] text-gray-400 hidden sm:block">{currentStep >= 3 ? 'Concluded' : 'Final Step'}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Date, Issue, Actions */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="space-y-1">
                        <p className="font-semibold text-gray-700">
                          📅 Scheduled Date: <span className="font-bold text-navy">{new Date(apt.appointment_date).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                        </p>
                        {apt.issue_description && (
                          <p className="text-gray-500 italic line-clamp-1">
                            📝 Problem: "{apt.issue_description}"
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => navigate('/direct-chat')}
                          className="px-4 py-2 bg-navy hover:bg-navy-light text-white font-semibold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                        >
                          <span>💬</span> Direct Message
                        </button>

                        {apt.status === 'pending' && (
                          <button
                            onClick={async () => {
                              if (!window.confirm("Are you sure you want to cancel this consultation booking?")) return;
                              try {
                                await API.patch(`/api/appointments/${apt.id}/status`, { status: 'cancelled' });
                                loadDashboardData();
                              } catch {
                                alert('Failed to cancel appointment.');
                              }
                            }}
                            className="px-3 py-2 bg-white border border-red-200 text-red-600 hover:bg-red-50 font-semibold rounded-xl transition-colors cursor-pointer"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>
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
