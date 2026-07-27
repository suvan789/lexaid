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
      const msg = err.response?.data?.detail || err.response?.data?.error || 'Registration failed. Please try again.';
      setError(msg);
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

          <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-navy mb-1">
              {form.role === 'lawyer' ? '⚖️ Register as Advocate' : '👤 Create Account'}
            </h2>
            <p className="text-gray-500 text-xs mb-6">
              {form.role === 'lawyer' ? 'Create your Advocate profile to manage clients' : 'Join LexAid for AI legal document tools'}
            </p>

            {/* Google OAuth Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-2.5 px-4 bg-white border border-gray-300 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-50 transition-all flex items-center justify-center gap-2 mb-4 shadow-2xs"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              Quick Register with Google
            </button>

            <div className="relative flex py-2 items-center mb-4">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="flex-shrink mx-3 text-gray-400 text-xs font-semibold">OR REGISTRATION FORM</span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>

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

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm animate-fade-in my-2">
                  <p className="font-semibold">❌ {error}</p>
                  {error.includes('already exists') && (
                    <p className="text-xs mt-1 text-red-600">
                      Already have an account? <Link to="/login" className="underline font-bold text-navy">Click here to Sign In</Link>
                    </p>
                  )}
                </div>
              )}

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
