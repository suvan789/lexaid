import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [message, setMessage] = useState('');
  const [mockLink, setMockLink] = useState(''); // For demo purposes

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    try {
      const response = await api.post('/api/auth/forgot-password', { email });
      setStatus('success');
      setMessage(response.data.message);
      if (response.data.mock_link) {
        setMockLink(response.data.mock_link);
      }
    } catch (err) {
      setStatus('error');
      setMessage(err.response?.data?.detail || 'An error occurred. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-2xl shadow-xl">
        
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-100 flex items-center justify-center rounded-full mb-6">
            <Mail className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Forgot password?
          </h2>
          <p className="mt-4 text-sm text-gray-500 max-w-sm mx-auto">
            No worries, we'll send you reset instructions.
          </p>
        </div>

        {status === 'success' ? (
          <div className="rounded-xl bg-green-50 p-6 border border-green-100 animate-fade-in-up">
            <div className="flex flex-col items-center text-center">
              <CheckCircle className="h-10 w-10 text-green-500 mb-4" />
              <h3 className="text-lg font-medium text-green-800">Check your email</h3>
              <div className="mt-2 text-sm text-green-700">
                <p>{message}</p>
              </div>
              
              {/* MOCK EMAIL DISPLAY FOR DEMO PURPOSES */}
              {mockLink && (
                <div className="mt-6 w-full p-4 bg-white rounded-lg border border-green-200 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                  <p className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Demo Mailer</p>
                  <p className="text-sm font-medium text-gray-900 mb-2">Subject: Reset your password</p>
                  <p className="text-sm text-gray-600 mb-4">Click the button below to reset your password:</p>
                  <Link 
                    to={mockLink}
                    className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm transition-colors"
                  >
                    Reset Password
                  </Link>
                </div>
              )}

            </div>
            <div className="mt-8 text-center">
              <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500 inline-flex items-center transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to log in
              </Link>
            </div>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {status === 'error' && (
              <div className="rounded-md bg-red-50 p-4 border border-red-100">
                <div className="text-sm text-red-700 text-center">{message}</div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow sm:text-sm"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={status === 'loading'}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-md transition-all hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {status === 'loading' ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  'Reset password'
                )}
              </button>
            </div>
            
            <div className="text-center mt-4">
              <Link to="/login" className="font-medium text-gray-600 hover:text-gray-900 inline-flex items-center transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to log in
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
