import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

export default function LawyerPortalPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await API.get('/api/appointments/lawyer/portal');
      setAppointments(res.data);
    } catch (err) {
      console.error('Failed to fetch lawyer appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      await API.patch(`/api/appointments/${id}/status`, { status: newStatus });
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
    } catch (err) {
      alert('Failed to update status.');
    }
  };

  const filteredAppointments = appointments.filter(a => {
    if (filterStatus === 'all') return true;
    return a.status === filterStatus;
  });

  return (
    <div className="page-container max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-navy via-navy-light to-accent text-white p-6 sm:p-8 rounded-2xl shadow-lg mb-8 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-semibold uppercase tracking-wider mb-2">
              👨‍⚖️ Advocate Portal
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold">Welcome, {user?.full_name || 'Lawyer'}</h1>
            <p className="text-white/80 text-sm mt-1">Manage client consultations, legal issue briefs, and direct client chats</p>
          </div>
          <button
            onClick={() => navigate('/messages')}
            className="px-5 py-2.5 bg-white text-navy font-semibold rounded-xl text-sm hover:bg-gray-100 transition-colors shadow-sm self-start sm:self-auto flex items-center gap-2"
          >
            💬 Open Client Messages
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 animate-fade-in delay-100">
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm text-center">
          <p className="text-xs text-gray-500 font-medium">Total Bookings</p>
          <p className="text-2xl font-bold text-navy mt-1">{appointments.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm text-center">
          <p className="text-xs text-gray-500 font-medium">Pending Review</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">{appointments.filter(a => a.status === 'pending').length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm text-center">
          <p className="text-xs text-gray-500 font-medium">Confirmed</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{appointments.filter(a => a.status === 'confirmed').length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm text-center">
          <p className="text-xs text-gray-500 font-medium">Completed</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{appointments.filter(a => a.status === 'completed').length}</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex bg-gray-100 p-1 rounded-xl gap-1">
          {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(st => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all ${
                filterStatus === st ? 'bg-navy text-white shadow-sm' : 'text-gray-600 hover:text-navy'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
        <button
          onClick={fetchAppointments}
          className="text-xs text-navy font-semibold hover:underline flex items-center gap-1"
        >
          🔄 Refresh List
        </button>
      </div>

      {/* Appointments List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredAppointments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
          <p className="text-4xl mb-3">📅</p>
          <h3 className="text-lg font-bold text-navy mb-1">No appointments found</h3>
          <p className="text-sm text-gray-500">Clients booking consultations with you will appear right here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAppointments.map((apt) => (
            <div key={apt.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-all">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-gray-100 pb-4 mb-4">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-navy/10 text-navy font-bold flex items-center justify-center text-base">
                      {apt.user?.full_name?.charAt(0) || 'C'}
                    </div>
                    <div>
                      <h3 className="font-bold text-navy text-lg">{apt.user?.full_name || 'Client'}</h3>
                      <p className="text-xs text-gray-500">{apt.user?.email} • {apt.user?.phone || 'No phone provided'}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                    apt.status === 'pending' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                    apt.status === 'confirmed' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                    apt.status === 'completed' ? 'bg-green-50 text-green-700 border border-green-200' :
                    'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    ● {apt.status}
                  </span>
                  <p className="text-xs text-gray-500 font-medium">
                    📅 {new Date(apt.appointment_date).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                  </p>
                </div>
              </div>

              {/* Client Issue Description */}
              <div className="bg-gray-50 rounded-xl p-4 mb-4 border border-gray-100">
                <p className="text-xs font-bold text-navy uppercase tracking-wider mb-1">📋 Client Legal Issue Brief:</p>
                <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                  {apt.issue_description || 'No detailed issue description provided by client.'}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <div className="flex gap-2">
                  {apt.status === 'pending' && (
                    <button
                      onClick={() => updateStatus(apt.id, 'confirmed')}
                      className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition-colors shadow-sm"
                    >
                      ✓ Confirm Appointment
                    </button>
                  )}
                  {apt.status !== 'completed' && (
                    <button
                      onClick={() => updateStatus(apt.id, 'completed')}
                      className="px-4 py-2 bg-green-600 text-white rounded-xl text-xs font-semibold hover:bg-green-700 transition-colors shadow-sm"
                    >
                      ✓ Mark Completed
                    </button>
                  )}
                  {apt.status !== 'cancelled' && (
                    <button
                      onClick={() => updateStatus(apt.id, 'cancelled')}
                      className="px-4 py-2 bg-white border border-red-200 text-red-600 rounded-xl text-xs font-semibold hover:bg-red-50 transition-colors"
                    >
                      ✕ Cancel
                    </button>
                  )}
                </div>

                <button
                  onClick={() => navigate(`/messages?user_id=${apt.user_id}&apt_id=${apt.id}`)}
                  className="px-5 py-2 bg-navy text-white rounded-xl text-xs font-semibold hover:bg-navy-light transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  💬 Chat with Client
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
