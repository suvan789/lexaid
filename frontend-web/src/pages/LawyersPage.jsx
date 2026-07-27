import React, { useState, useEffect } from 'react';
import LawyerCard from '../components/LawyerCard';
import API from '../api/axios';

const SPECIALIZATIONS = [
  'All', 'Criminal', 'Civil', 'Family', 'Property', 'Labour',
  'Consumer', 'Corporate', 'Tax', 'Immigration', 'Intellectual Property'
];

export default function LawyersPage() {
  const [lawyers, setLawyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ city: '', specialization: 'All', maxFee: 50000, sortBy: 'rating' });
  const [selectedLawyer, setSelectedLawyer] = useState(null);
  
  // Fee Estimator State
  const [showEstimator, setShowEstimator] = useState(false);
  const [estForm, setEstForm] = useState({ case_type: '', city: '', complexity: 'medium' });
  const [estResult, setEstResult] = useState(null);
  const [estLoading, setEstLoading] = useState(false);
  const [contactData, setContactData] = useState(null);
  const [savedLawyerIds, setSavedLawyerIds] = useState([]);
  
  const [showBooking, setShowBooking] = useState(false);
  const [bookingDate, setBookingDate] = useState('');
  const [issueDescription, setIssueDescription] = useState('');

  useEffect(() => {
    fetchLawyers();
    fetchSavedIds();
  }, [filters.specialization, filters.sortBy]);

  const fetchSavedIds = async () => {
    try {
      const res = await API.get('/api/user/saved/lawyers/ids');
      setSavedLawyerIds(res.data);
    } catch { }
  };

  const toggleSaveLawyer = async (id) => {
    try {
      await API.post(`/api/user/saved/lawyer/${id}`);
      if (savedLawyerIds.includes(id)) {
        setSavedLawyerIds(prev => prev.filter(lawyerId => lawyerId !== id));
      } else {
        setSavedLawyerIds(prev => [...prev, id]);
      }
    } catch (err) {
      alert('Please login to save lawyers.');
    }
  };

  const handleBook = async (e) => {
    e.preventDefault();
    if (!bookingDate) return;
    try {
      await API.post('/api/appointments', {
        lawyer_id: selectedLawyer.id,
        appointment_date: new Date(bookingDate).toISOString(),
        issue_description: issueDescription
      });
      alert("Appointment booked successfully! View it in your Profile or Direct Messages.");
      setShowBooking(false);
      setBookingDate('');
      setIssueDescription('');
    } catch (err) {
      alert("Failed to book appointment. Please login first.");
    }
  };

  const fetchLawyers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.city) params.append('city', filters.city);
      if (filters.specialization !== 'All') params.append('specialization', filters.specialization);
      if (filters.maxFee < 50000) params.append('max_fee', filters.maxFee);
      params.append('sort_by', filters.sortBy);

      const res = await API.get(`/api/lawyers?${params.toString()}`);
      setLawyers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchLawyers();
  };

  const estimateFee = async (e) => {
    e.preventDefault();
    if (!estForm.case_type || !estForm.city) return;
    setEstLoading(true);
    try {
      const res = await API.post('/api/lawyers/estimate-fee', estForm);
      setEstResult(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setEstLoading(false);
    }
  };

  const loadContact = async (id) => {
    try {
      const res = await API.post(`/api/lawyers/${id}/contact`);
      setContactData(res.data);
    } catch (err) {
      alert('Please login to view contact details.');
    }
  };

  return (
    <div className="page-container max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-navy mb-1">Find a Lawyer</h1>
          <p className="text-gray-500 text-sm">Search and compare verified legal professionals</p>
        </div>
        <button
          onClick={() => { setShowEstimator(true); setEstResult(null); }}
          className="px-5 py-2.5 bg-accent text-white rounded-xl font-medium hover:bg-accent-dark transition-colors shadow-sm"
        >
          💡 Estimate My Fee
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-8 animate-fade-in delay-100">
        <form onSubmit={handleSearch} className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-medium text-gray-500 mb-1">City</label>
            <input
              type="text"
              placeholder="e.g. Mumbai, Delhi"
              value={filters.city}
              onChange={(e) => setFilters(f => ({ ...f, city: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-accent outline-none"
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-medium text-gray-500 mb-1">Specialization</label>
            <select
              value={filters.specialization}
              onChange={(e) => setFilters(f => ({ ...f, specialization: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-accent outline-none bg-white"
            >
              {SPECIALIZATIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Max Fee: ₹{filters.maxFee}
            </label>
            <input
              type="range"
              min="2000"
              max="50000"
              step="1000"
              value={filters.maxFee}
              onChange={(e) => setFilters(f => ({ ...f, maxFee: Number(e.target.value) }))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-accent"
            />
          </div>
          <div className="w-full md:w-auto">
            <button type="submit" className="w-full md:w-auto px-6 py-2 bg-navy text-white rounded-xl text-sm font-medium hover:bg-navy-light transition-colors">
              Search
            </button>
          </div>
        </form>

        <div className="mt-4 pt-4 border-t border-gray-50 flex items-center gap-3">
          <span className="text-xs text-gray-500 font-medium">Sort by:</span>
          {['rating', 'fee_low', 'fee_high', 'experience'].map(sort => (
            <button
              key={sort}
              onClick={() => setFilters(f => ({ ...f, sortBy: sort }))}
              className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
                filters.sortBy === sort ? 'bg-navy text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {sort === 'fee_low' ? 'Fee: Low to High' : sort === 'fee_high' ? 'Fee: High to Low' : sort.charAt(0).toUpperCase() + sort.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Lawyers Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : lawyers.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <p className="text-4xl mb-4">🕵️‍♂️</p>
          <h3 className="text-lg font-bold text-navy mb-1">No lawyers found</h3>
          <p className="text-sm text-gray-500">Try adjusting your search filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lawyers.map(lawyer => (
            <LawyerCard 
              key={lawyer.id} 
              lawyer={lawyer} 
              isSaved={savedLawyerIds.includes(lawyer.id)}
              onToggleSave={() => toggleSaveLawyer(lawyer.id)}
              onSelect={(l) => { setSelectedLawyer(l); setContactData(null); setShowBooking(false); }} 
            />
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedLawyer && (
        <div className="fixed inset-0 bg-navy/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in" onClick={() => setSelectedLawyer(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-navy text-white text-xl font-bold flex items-center justify-center">
                    {selectedLawyer.name.replace('Adv. ', '').charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-navy flex items-center gap-2">
                      {selectedLawyer.name}
                      {selectedLawyer.verified && <span className="text-blue-500" title="Verified">✓</span>}
                    </h2>
                    <p className="text-sm text-gray-500">📍 {selectedLawyer.city}, {selectedLawyer.state}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedLawyer(null)} className="text-gray-400 hover:text-navy">✕</button>
              </div>

              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">About</h3>
                <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-xl">
                  {selectedLawyer.bio}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-blue-50 p-3 rounded-xl border border-blue-100 text-center">
                  <p className="text-xs text-gray-500 mb-1">Experience</p>
                  <p className="font-semibold text-navy">{selectedLawyer.experience_years} Years</p>
                </div>
                <div className="bg-green-50 p-3 rounded-xl border border-green-100 text-center">
                  <p className="text-xs text-gray-500 mb-1">Consultation Fee</p>
                  <p className="font-semibold text-green-700">₹{selectedLawyer.fee_min} - ₹{selectedLawyer.fee_max}</p>
                </div>
              </div>

              {showBooking ? (
                <form onSubmit={handleBook} className="mt-4 p-5 bg-gray-50 rounded-xl border border-gray-200 animate-fade-in">
                  <h4 className="font-semibold text-navy mb-3">Book Consultation Appointment</h4>
                  <div className="mb-3">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Select Date & Time *</label>
                    <input type="datetime-local" value={bookingDate} onChange={e => setBookingDate(e.target.value)} required className="w-full px-4 py-2 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-accent text-sm" />
                  </div>
                  <div className="mb-4">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Describe Your Legal Issue / Problem *</label>
                    <textarea
                      rows={3}
                      value={issueDescription}
                      onChange={e => setIssueDescription(e.target.value)}
                      placeholder="e.g. Landlord refusing to return security deposit of 50,000 INR. Need legal advice and notice."
                      required
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-accent text-sm bg-white"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button type="submit" className="flex-1 bg-accent text-white py-2.5 rounded-xl font-semibold hover:bg-accent-dark transition-colors text-sm">Confirm Booking</button>
                    <button type="button" onClick={() => setShowBooking(false)} className="flex-1 bg-white border border-gray-300 py-2.5 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors text-sm">Cancel</button>
                  </div>
                </form>
              ) : contactData ? (
                <div className="bg-gray-900 text-white p-4 rounded-xl mb-2 text-center animate-fade-in">
                  <p className="text-sm mb-2 text-gray-300">Contact Details</p>
                  <p className="font-bold text-lg mb-1">{contactData.phone}</p>
                  <p className="text-sm text-accent-light">{contactData.email}</p>
                </div>
              ) : (
                <div className="flex gap-3">
                  <button
                    onClick={() => loadContact(selectedLawyer.id)}
                    className="flex-1 py-3 bg-white border border-navy text-navy rounded-xl font-semibold hover:bg-navy hover:text-white transition-all"
                  >
                    View Contact
                  </button>
                  <button
                    onClick={() => setShowBooking(true)}
                    className="flex-1 py-3 bg-accent text-white rounded-xl font-semibold hover:bg-accent-dark transition-colors"
                  >
                    Book Consultation
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Fee Estimator Modal */}
      {showEstimator && (
        <div className="fixed inset-0 bg-navy/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in" onClick={() => setShowEstimator(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-accent to-purple-600 p-6 text-white text-center">
              <h2 className="text-2xl font-bold mb-1">AI Fee Estimator</h2>
              <p className="text-white/80 text-sm">Get estimated legal costs for your case</p>
            </div>
            
            <div className="p-6">
              {!estResult ? (
                <form onSubmit={estimateFee} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Case Type</label>
                    <input type="text" placeholder="e.g. Mutual Divorce, Property Dispute" value={estForm.case_type} onChange={e => setEstForm(f => ({ ...f, case_type: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input type="text" placeholder="e.g. Bangalore" value={estForm.city} onChange={e => setEstForm(f => ({ ...f, city: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Complexity</label>
                    <select value={estForm.complexity} onChange={e => setEstForm(f => ({ ...f, complexity: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white">
                      <option value="simple">Simple / Straightforward</option>
                      <option value="medium">Medium / Standard</option>
                      <option value="complex">Complex / Multi-party</option>
                    </select>
                  </div>
                  <button type="submit" disabled={estLoading} className="w-full py-3 bg-navy text-white rounded-xl font-semibold mt-2">
                    {estLoading ? 'Calculating...' : 'Calculate Estimate'}
                  </button>
                </form>
              ) : (
                <div className="animate-fade-in text-center">
                  <p className="text-sm text-gray-500 mb-2">Estimated Market Rate</p>
                  <p className="text-4xl font-bold text-green-600 mb-1">₹{estResult.average_fee.toLocaleString()}</p>
                  <p className="text-sm text-gray-500 mb-6">Range: ₹{estResult.min_fee.toLocaleString()} - ₹{estResult.max_fee.toLocaleString()}</p>
                  
                  <div className="bg-gray-50 rounded-xl p-4 text-left mb-6">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Key Factors</p>
                    <ul className="space-y-1">
                      {estResult.factors.map((f, i) => (
                        <li key={i} className="text-sm text-gray-700 flex gap-2">
                          <span className="text-accent">•</span> {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <button onClick={() => { setEstResult(null); setShowEstimator(false); }} className="w-full py-2 border border-gray-300 text-gray-600 rounded-xl font-medium">
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
