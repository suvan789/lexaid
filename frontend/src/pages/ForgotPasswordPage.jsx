import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Mail, ArrowLeft } from 'lucide-react';
import { dispatchBrevoOtpEmail } from '../utils/brevoMailer';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, error
  const [message, setMessage] = useState('');

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    setMessage('');
    
    // Generate 6-digit OTP code
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const cleanEmail = email.toLowerCase().trim();
    localStorage.setItem(`lexaid_otp_${cleanEmail}`, generatedOtp);

    // Dispatch via direct Brevo API instantly
    await dispatchBrevoOtpEmail(cleanEmail, generatedOtp);

    // Also call backend API
    try {
      await api.post('/api/auth/send-email-otp', { email: cleanEmail }, { timeout: 3000 });
    } catch (err) {
      console.warn("Backend API delay:", err);
    }

    navigate(`/verify-otp?email=${encodeURIComponent(cleanEmail)}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-2xl shadow-xl border border-gray-100 animate-fade-in">
        
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-100 flex items-center justify-center rounded-full mb-4 shadow-inner">
            <Mail className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Forgot Password?
          </h2>
          <p className="mt-2 text-xs text-gray-500 max-w-sm mx-auto">
            Enter your registered email address and we'll send a 6-digit OTP code to your inbox.
          </p>
        </div>

        {/* Status Error Alert */}
        {status === 'error' && (
          <div className="rounded-xl bg-red-50 p-4 border border-red-200 animate-fade-in text-center">
            <p className="text-xs font-semibold text-red-700">{message}</p>
          </div>
        )}

        {/* Form */}
        <form className="mt-6 space-y-5" onSubmit={handleSendOtp}>
          <div>
            <label htmlFor="email" className="block text-xs font-semibold text-gray-700 mb-1">
              Registered Email Address
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-xs placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
              placeholder="suvansenthils@gmail.com"
            />
          </div>

          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full flex justify-center py-3 px-4 border border-transparent text-xs font-bold rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none shadow-md transition-all disabled:opacity-50"
          >
            {status === 'loading' ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Sending OTP Email...</span>
              </div>
            ) : (
              '📩 Send 6-Digit Verification OTP'
            )}
          </button>
          
          <div className="text-center mt-3">
            <Link to="/login" className="text-xs font-semibold text-gray-500 hover:text-navy inline-flex items-center">
              <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Log In
            </Link>
          </div>
        </form>

      </div>
    </div>
  );
}
