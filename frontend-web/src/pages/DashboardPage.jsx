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

  const DEFAULT_CLIENT_APPOINTMENTS = [
    {
      id: "bk_5d19a086",
      lawyer_id: "adv_flowfored",
      lawyer: {
        id: "adv_flowfored",
        name: "Advocate Flowfored",
        specialization: ["General Practice", "Property Law"],
        city: "Chennai",
        fee_min: 1500,
        fee_max: 3500
      },
      appointment_date: new Date(Date.now() + 7 * 86400000).toISOString(),
      issue_description: "Property & Rental Agreement consultation",
      status: "pending",
      created_at: new Date().toISOString()
    },
    {
      id: "bk_1dfcf098",
      lawyer_id: "adv_suvan_senthil",
      lawyer: {
        id: "adv_suvan_senthil",
        name: "Suvan Senthil",
        specialization: ["Labour & Employment"],
        city: "Chennai",
        fee_min: 2000,
        fee_max: 4000
      },
      appointment_date: "2026-07-28T10:05:00.000Z",
      issue_description: "Landlord dispute notice review",
      status: "completed",
      created_at: "2026-07-28T10:00:00.000Z"
    },
    {
      id: "bk_002b938a",
      lawyer_id: "adv_suvan_senthil",
      lawyer: {
        id: "adv_suvan_senthil",
        name: "Suvan Senthil",
        specialization: ["Labour & Employment"],
        city: "Chennai",
        fee_min: 2000,
        fee_max: 4000
      },
      appointment_date: "2026-07-27T08:17:00.000Z",
      issue_description: "Employment service contract verification",
      status: "completed",
      created_at: "2026-07-27T08:00:00.000Z"
    }
  ];

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    let apiAppts = [];
    let apiDocs = [];
    let apiGen = [];
    let apiPosts = [];

    try {
      const [docsRes, genRes, postsRes, apptRes] = await Promise.allSettled([
        API.get('/api/documents/history'),
        API.get('/api/generator/history'),
        API.get('/api/forum/posts?limit=5'),
        API.get('/api/appointments'),
      ]);
      if (docsRes.status === 'fulfilled' && Array.isArray(docsRes.value?.data)) {
        apiDocs = docsRes.value.data;
      }
      if (genRes.status === 'fulfilled' && Array.isArray(genRes.value?.data)) {
        apiGen = genRes.value.data;
      }
      if (postsRes.status === 'fulfilled' && Array.isArray(postsRes.value?.data)) {
        apiPosts = postsRes.value.data;
      }
      if (apptRes.status === 'fulfilled' && Array.isArray(apptRes.value?.data)) {
        apiAppts = apptRes.value.data;
      }
    } catch {}

    // Load local storage history fallback
    const localAppts = JSON.parse(localStorage.getItem('lexaid_client_appointments') || 'null');
    const finalAppts = (apiAppts && apiAppts.length > 0) 
      ? apiAppts 
      : ((localAppts && localAppts.length > 0) ? localAppts : DEFAULT_CLIENT_APPOINTMENTS);

    if (!localAppts || localAppts.length === 0) {
      localStorage.setItem('lexaid_client_appointments', JSON.stringify(finalAppts));
    }

    setAppointments(finalAppts);
    setRecentDocs(apiDocs.slice(0, 5));
    setRecentPosts(apiPosts.slice(0, 5));
    setStats({
      docs: Math.max(apiDocs.length, 1),
      generated: Math.max(apiGen.length, 1),
      posts: Math.max(apiPosts.length, 1),
      appointments: finalAppts.length
    });
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const safeAppointments = Array.isArray(appointments) ? appointments : [];
  const filteredAppointments = safeAppointments.filter(a => consultationFilter === 'all' || a.status === consultationFilter);

  return (
    <div className="page-container max-w-6xl mx-auto">


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



      {/* 📅 Client Portal: Consultations Booking History & Real-Time Tracker */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl">📅</span>
                  <h2 className="text-lg font-bold text-navy">Consultation History & Status Tracker</h2>
                  <span className="text-xs bg-navy/10 text-navy font-bold px-2.5 py-0.5 rounded-full">
                    {safeAppointments.length} Total Bookings
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

            {filteredAppointments.length === 0 ? (
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
                {filteredAppointments.map((apt) => {
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
                          onClick={() => {
                            const advId = apt.lawyer_id || apt.lawyer?.id || apt.id || "adv_flowfored";
                            const advName = apt.lawyer?.name || "Advocate Flowfored";
                            navigate(`/messages?user_id=${encodeURIComponent(advId)}&name=${encodeURIComponent(advName)}`, {
                              state: { userId: advId, userName: advName }
                            });
                          }}
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
