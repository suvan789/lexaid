import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import { loginWithGoogleFirebase } from '../firebase';

export default function LoginPage() {
  const [authMode, setAuthMode] = useState('email'); // 'email' | 'phone'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    try {
      const res = await API.post('/api/auth/login', { email, password });
      login(res.data.access_token, res.data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.detail || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    if (!phone) { setError('Please enter a phone number.'); return; }
    setLoading(true);
    try {
      await API.post('/api/auth/send-otp', { phone });
      setOtpSent(true);
      setOtp('123456');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    if (!otp) { setError('Please enter 6-digit OTP.'); return; }
    setLoading(true);
    try {
      const res = await API.post('/api/auth/verify-otp', { phone, otp, role: 'client' });
      login(res.data.access_token, res.data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid OTP code.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      const googleUser = await loginWithGoogleFirebase();
      const res = await API.post('/api/auth/google', {
        email: googleUser.email,
        full_name: googleUser.full_name,
        google_id: googleUser.google_id,
        role: 'lawyer'
      });
      login(res.data.access_token, res.data.user);
      navigate('/');
    } catch (err) {
      console.error("Firebase Sign-In Error:", err);
      if (err.code === "auth/popup-closed-by-user") {
        setError("Google Sign-In popup was closed before completing.");
      } else {
        setError(err.message || 'Google Sign-In failed. Please check Firebase setup.');
      }
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = (type) => {
    if (type === 'advocate') {
      setEmail('suvansenthils@gmail.com');
      setPassword('Password123!');
    } else {
      setEmail('citizen@lexaid.com');
      setPassword('Password123!');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left: Branding */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-navy via-navy-light to-accent items-center justify-center p-12">
        <div className="max-w-md text-white animate-fade-in">
          <div className="text-6xl mb-6">⚖️</div>
          <h1 className="text-4xl font-bold mb-4">LexAid</h1>
          <p className="text-xl text-white/80 mb-8">AI-Powered Legal Super App for Indian Citizens & Advocates</p>
          <div className="space-y-4">
            {['Real-time Document Generation', '1-on-1 Client ↔ Advocate Chat', 'AI Legal Consultation', 'Verified Advocate Portal', 'Supreme & High Court Legal News'].map((f, i) => (
              <div key={i} className="flex items-center gap-3 text-white/80 text-sm font-medium">
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
          <div className="lg:hidden text-center mb-6">
            <div className="text-5xl mb-2">⚖️</div>
            <h1 className="text-3xl font-bold text-navy">LexAid</h1>
          </div>

          <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-navy mb-1">Welcome back</h2>
            <p className="text-gray-500 text-sm mb-6">Sign in to your LexAid account</p>

            {/* Auth Mode Toggle */}
            <div className="flex bg-gray-100 p-1 rounded-xl mb-6 text-xs font-semibold">
              <button
                type="button"
                onClick={() => { setAuthMode('email'); setError(''); }}
                className={`flex-1 py-2 rounded-lg transition-all ${authMode === 'email' ? 'bg-white text-navy shadow-sm' : 'text-gray-500'}`}
              >
                📧 Email & Password
              </button>
              <button
                type="button"
                onClick={() => { setAuthMode('phone'); setError(''); }}
                className={`flex-1 py-2 rounded-lg transition-all ${authMode === 'phone' ? 'bg-white text-navy shadow-sm' : 'text-gray-500'}`}
              >
                📱 Phone OTP
              </button>
            </div>

            {/* Real Firebase Google OAuth Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-2.5 px-4 bg-white border border-gray-300 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-50 transition-all flex items-center justify-center gap-2 mb-4 shadow-2xs cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              {loading ? 'Opening Google Sign-In...' : 'Continue with Google Account'}
            </button>

            <div className="relative flex py-2 items-center mb-4">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="flex-shrink mx-3 text-gray-400 text-xs font-semibold">OR LOGIN WITH CREDENTIALS</span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-xs font-medium">
                {error}
              </div>
            )}

            {authMode === 'email' ? (
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Email Address</label>
                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all text-xs"
                    placeholder="you@example.com"
                    required
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-bold text-gray-700">Password</label>
                    <Link to="/forgot-password" className="text-xs font-semibold text-accent hover:underline">
                      Forgot Password?
                    </Link>
                  </div>
                  <input
                    id="login-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all text-xs"
                    placeholder="••••••••"
                    required
                  />
                </div>

                {/* Demo Quick Fill Buttons */}
                <div className="flex gap-2 pt-1">
                  <button type="button" onClick={() => quickLogin('advocate')} className="flex-1 py-1.5 px-2 bg-amber-50 border border-amber-200 text-amber-900 rounded-lg text-[10px] font-semibold hover:bg-amber-100">
                    ⚖️ Advocate Login
                  </button>
                  <button type="button" onClick={() => quickLogin('citizen')} className="flex-1 py-1.5 px-2 bg-blue-50 border border-blue-200 text-blue-900 rounded-lg text-[10px] font-semibold hover:bg-blue-100">
                    👤 Citizen Login
                  </button>
                </div>

                <button
                  id="login-submit"
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-navy text-white rounded-xl font-semibold hover:bg-navy-light transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 text-xs"
                >
                  {loading ? (
                    <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Authenticating...</>
                  ) : 'Sign In'}
                </button>
              </form>
            ) : (
              <form onSubmit={!otpSent ? handleSendOtp : handleVerifyOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Mobile Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={otpSent}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all text-xs disabled:bg-gray-100"
                    placeholder="+91 9894689781"
                    required
                  />
                </div>

                {otpSent && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Enter 6-Digit OTP</label>
                    <input
                      type="text"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all text-xs font-mono text-center tracking-widest text-lg"
                      placeholder="123456"
                      required
                    />
                    <p className="text-[10px] text-gray-400 mt-1">Default test OTP: <span className="font-bold text-gray-700">123456</span></p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-navy text-white rounded-xl font-semibold hover:bg-navy-light transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 text-xs"
                >
                  {loading ? (
                    <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Processing...</>
                  ) : !otpSent ? '📱 Send OTP SMS' : '✓ Verify OTP & Sign In'}
                </button>
              </form>
            )}
          </div>

          <p className="text-center mt-6 text-gray-500 text-xs">
            Don't have an account?{' '}
            <Link to="/register" className="text-accent font-bold hover:underline">Register now</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
