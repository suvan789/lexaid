import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

export default function RegisterPage() {
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    confirm: '',
    phone: '',
    city: '',
    state: '',
    role: 'client',
    specialization: 'General',
    experience_years: 5,
    fee_min: 2000,
    fee_max: 5000,
    bio: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.full_name || !form.email || !form.password) { setError('Name, email, and password are required.'); return; }
    if (form.password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return; }
    setLoading(true);
    try {
      const payload = {
        full_name: form.full_name,
        email: form.email,
        password: form.password,
        phone: form.phone || null,
        city: form.city || null,
        state: form.state || null,
        role: form.role,
      };

      if (form.role === 'lawyer') {
        payload.specialization = [form.specialization];
        payload.experience_years = parseInt(form.experience_years) || 5;
        payload.fee_min = parseInt(form.fee_min) || 2000;
        payload.fee_max = parseInt(form.fee_max) || 5000;
        payload.bio = form.bio || `Advocate ${form.full_name} practicing legal services.`;
      }

      const res = await API.post('/api/auth/register', payload);
      login(res.data.access_token, res.data.user);
      if (res.data.user?.role === 'lawyer') {
        navigate('/lawyer/portal');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.detail || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left branding */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-navy via-navy-light to-accent items-center justify-center p-12">
        <div className="max-w-md text-white animate-fade-in">
          <div className="text-6xl mb-6">⚖️</div>
          <h1 className="text-4xl font-bold mb-4">Join LexAid</h1>
          <p className="text-xl text-white/80 mb-6">Your AI-powered legal super app for citizens and legal professionals</p>
          <p className="text-white/60">Free to use • Citizen & Lawyer Portals • AI-powered insights</p>
        </div>
      </div>

      {/* Right: Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-gray-50 overflow-y-auto">
        <div className="w-full max-w-md animate-fade-in my-auto">
          <div className="lg:hidden text-center mb-6">
            <div className="text-5xl mb-3">⚖️</div>
            <h1 className="text-3xl font-bold text-navy">LexAid</h1>
          </div>

          <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-8">
            <h2 className="text-2xl font-bold text-navy mb-1">Create account</h2>
            <p className="text-gray-500 mb-6">Choose your account type and get started</p>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm">{error}</div>
            )}

            {/* Role Switcher */}
            <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
              <button
                type="button"
                onClick={() => setForm(f => ({ ...f, role: 'client' }))}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                  form.role === 'client' ? 'bg-navy text-white shadow-sm' : 'text-gray-600 hover:text-navy'
                }`}
              >
                👤 Citizen / Client
              </button>
              <button
                type="button"
                onClick={() => setForm(f => ({ ...f, role: 'lawyer' }))}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                  form.role === 'lawyer' ? 'bg-accent text-white shadow-sm' : 'text-gray-600 hover:text-accent'
                }`}
              >
                👨‍⚖️ Advocate / Lawyer
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input name="full_name" id="register-name" value={form.full_name} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent outline-none text-sm" placeholder="Your full name" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input name="email" id="register-email" type="email" value={form.email} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent outline-none text-sm" placeholder="you@example.com" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                  <input name="password" id="register-password" type="password" value={form.password} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent outline-none text-sm" placeholder="Min 8 chars" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm *</label>
                  <input name="confirm" id="register-confirm" type="password" value={form.confirm} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent outline-none text-sm" placeholder="Re-enter" required />
                </div>
              </div>

              {/* Lawyer Specific Extra Fields */}
              {form.role === 'lawyer' && (
                <div className="p-4 bg-accent/5 rounded-xl border border-accent/20 space-y-3 animate-fade-in">
                  <p className="text-xs font-semibold text-accent uppercase tracking-wider">Lawyer Profile Setup</p>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Specialization</label>
                    <select name="specialization" value={form.specialization} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white outline-none">
                      <option value="Criminal">Criminal Law</option>
                      <option value="Civil">Civil Litigation</option>
                      <option value="Family">Family / Matrimonial</option>
                      <option value="Property">Property & RERA</option>
                      <option value="Labour">Labour & Employment</option>
                      <option value="Consumer">Consumer Protection</option>
                      <option value="Corporate">Corporate & Tax</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Exp (Yrs)</label>
                      <input name="experience_years" type="number" value={form.experience_years} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Min Fee (₹)</label>
                      <input name="fee_min" type="number" value={form.fee_min} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Max Fee (₹)</label>
                      <input name="fee_max" type="number" value={form.fee_max} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none" />
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input name="phone" value={form.phone} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent outline-none text-sm" placeholder="+91-XXXXXXXXXX" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input name="city" value={form.city} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent outline-none text-sm" placeholder="Mumbai" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <input name="state" value={form.state} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent outline-none text-sm" placeholder="Maharashtra" />
                </div>
              </div>

              <button
                id="register-submit"
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-navy text-white rounded-xl font-medium hover:bg-navy-light disabled:opacity-50 transition-colors shadow-md mt-2"
              >
                {loading ? 'Creating Account...' : form.role === 'lawyer' ? 'Register as Lawyer' : 'Create Account'}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-500">
              Already have an account?{' '}
              <Link to="/login" className="text-accent font-semibold hover:underline">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
