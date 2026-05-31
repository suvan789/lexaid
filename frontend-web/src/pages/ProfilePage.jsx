import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import LawyerCard from '../components/LawyerCard';
import NewsCard from '../components/NewsCard';
import ForumPost from '../components/ForumPost';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    full_name: user?.full_name || '',
    phone: user?.phone || '',
    city: user?.city || '',
    state: user?.state || '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  const [activeTab, setActiveTab] = useState('profile');
  const [savedLawyers, setSavedLawyers] = useState([]);
  const [savedNews, setSavedNews] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    if (activeTab === 'saved') {
      fetchSavedItems();
    } else if (activeTab === 'appointments') {
      fetchAppointments();
    }
  }, [activeTab]);

  const fetchAppointments = async () => {
    try {
      const res = await API.get('/api/appointments');
      setAppointments(res.data);
    } catch (err) {
      console.error("Failed to load appointments", err);
    }
  };

  const fetchSavedItems = async () => {
    try {
      const [lRes, nRes, pRes] = await Promise.all([
        API.get('/api/user/saved/lawyers'),
        API.get('/api/user/saved/news'),
        API.get('/api/user/saved/forum'),
      ]);
      setSavedLawyers(lRes.data);
      setSavedNews(nRes.data);
      setSavedPosts(pRes.data);
    } catch (err) {
      console.error("Failed to load saved items", err);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const res = await API.put('/api/auth/profile', form);
      updateUser(res.data);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setIsEditing(false);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update profile.' });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="page-container max-w-4xl mx-auto">
      <div className="mb-8 animate-fade-in flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy mb-1">My Profile</h1>
          <p className="text-gray-500 text-sm">Manage your account and saved items</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setActiveTab('profile')} className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${activeTab === 'profile' ? 'bg-navy text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>Profile Info</button>
          <button onClick={() => setActiveTab('appointments')} className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${activeTab === 'appointments' ? 'bg-navy text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>Appointments</button>
          <button onClick={() => setActiveTab('saved')} className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${activeTab === 'saved' ? 'bg-navy text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>Saved Items</button>
        </div>
      </div>

      {activeTab === 'profile' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in delay-100 max-w-2xl mx-auto">
        <div className="bg-gradient-to-r from-navy to-accent h-32 relative">
          <div className="absolute -bottom-10 left-8">
            <div className="w-24 h-24 rounded-full border-4 border-white bg-white text-navy text-4xl font-bold flex items-center justify-center shadow-md">
              {user.full_name?.charAt(0)?.toUpperCase()}
            </div>
          </div>
        </div>
        
        <div className="px-8 pt-16 pb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-bold text-navy">{user.full_name}</h2>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                Edit Profile
              </button>
            )}
          </div>

          {message && (
            <div className={`px-4 py-3 rounded-xl text-sm mb-6 ${
              message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {message.text}
            </div>
          )}

          {isEditing ? (
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  name="full_name"
                  value={form.full_name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-accent outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-accent outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-accent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <input
                    name="state"
                    value={form.state}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-accent outline-none"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-navy text-white rounded-xl text-sm font-medium hover:bg-navy-light transition-colors"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8 mt-8">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Phone</p>
                <p className="text-sm text-gray-800 font-medium">{user.phone || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Location</p>
                <p className="text-sm text-gray-800 font-medium">
                  {user.city || user.state ? `${user.city || ''}${user.city && user.state ? ', ' : ''}${user.state || ''}` : 'Not provided'}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Account Created</p>
                <p className="text-sm text-gray-800 font-medium">{new Date(user.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          )}
        </div>
      </div>
      )}

      {activeTab === 'appointments' && (
        <div className="animate-fade-in space-y-4">
          <h2 className="text-xl font-bold text-navy mb-4 border-b border-gray-100 pb-2">My Appointments</h2>
          {appointments.length === 0 ? (
            <p className="text-gray-500 text-sm bg-white p-6 rounded-2xl border border-gray-100 text-center">No appointments booked yet.</p>
          ) : (
            appointments.map(appt => (
              <div key={appt.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-navy text-lg">{appt.lawyer?.name || 'Unknown Lawyer'}</h3>
                  <p className="text-sm text-gray-500 mb-1">📅 {new Date(appt.appointment_date).toLocaleString()}</p>
                  <p className="text-xs font-medium text-gray-400">Booked on {new Date(appt.created_at).toLocaleDateString()}</p>
                </div>
                <div className="shrink-0 text-right">
                  <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider border ${appt.status === 'confirmed' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'}`}>
                    {appt.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'saved' && (
        <div className="animate-fade-in space-y-10">
          {/* Saved Lawyers */}
          <section>
            <h2 className="text-xl font-bold text-navy mb-4 border-b border-gray-100 pb-2">Saved Lawyers</h2>
            {savedLawyers.length === 0 ? (
              <p className="text-gray-500 text-sm bg-white p-6 rounded-2xl border border-gray-100 text-center">No saved lawyers yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {savedLawyers.map(l => <LawyerCard key={l.id} lawyer={l} isSaved={true} onToggleSave={() => { fetchSavedItems(); }} onSelect={() => {}} />)}
              </div>
            )}
          </section>

          {/* Saved News */}
          <section>
            <h2 className="text-xl font-bold text-navy mb-4 border-b border-gray-100 pb-2">Saved News</h2>
            {savedNews.length === 0 ? (
              <p className="text-gray-500 text-sm bg-white p-6 rounded-2xl border border-gray-100 text-center">No saved news yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {savedNews.map(n => <NewsCard key={n.id} article={n} isSaved={true} onToggleSave={() => { fetchSavedItems(); }} />)}
              </div>
            )}
          </section>

          {/* Saved Posts */}
          <section>
            <h2 className="text-xl font-bold text-navy mb-4 border-b border-gray-100 pb-2">Saved Forum Posts</h2>
            {savedPosts.length === 0 ? (
              <p className="text-gray-500 text-sm bg-white p-6 rounded-2xl border border-gray-100 text-center">No saved forum posts yet.</p>
            ) : (
              <div className="space-y-4">
                {savedPosts.map(p => <ForumPost key={p.id} post={p} isSaved={true} onToggleSave={() => { fetchSavedItems(); }} />)}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
