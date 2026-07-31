import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import { MailCheck, XCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const { fetchUser } = useAuth();
  
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('The verification link is invalid or missing the required security token.');
      return;
    }

    const verifyToken = async () => {
      try {
        const response = await api.post('/api/auth/verify-email', { token });
        setStatus('success');
        setMessage(response.data.message);
        // Refresh the user context so is_verified becomes true in the app
        await fetchUser();
      } catch (err) {
        setStatus('error');
        setMessage(err.response?.data?.detail || 'The verification link has expired or is invalid.');
      }
    };

    verifyToken();
  }, [token, fetchUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-2xl shadow-xl text-center">
        
        {status === 'loading' && (
          <div className="space-y-6">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <h2 className="text-2xl font-bold text-gray-900">Verifying Email</h2>
            <p className="text-gray-500">Please wait while we verify your email address...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-6 animate-fade-in-up">
            <MailCheck className="w-20 h-20 text-green-500 mx-auto" />
            <h2 className="text-2xl font-bold text-gray-900">Email Verified!</h2>
            <p className="text-gray-600">Thank you for verifying your email address. Your account is now fully active.</p>
            <div className="pt-4">
              <Link 
                to="/"
                className="inline-flex justify-center w-full rounded-xl border border-transparent shadow-sm px-4 py-3 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-6 animate-fade-in-up">
            <XCircle className="w-20 h-20 text-red-500 mx-auto" />
            <h2 className="text-2xl font-bold text-gray-900">Verification Failed</h2>
            <p className="text-gray-600">{message}</p>
            <div className="pt-4">
              <Link 
                to="/"
                className="inline-flex justify-center w-full rounded-xl border border-gray-300 shadow-sm px-4 py-3 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Return Home
              </Link>
            </div>
          </div>
        )}
        
      </div>
    </div>
  );
}
