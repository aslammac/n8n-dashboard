'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { AlertTriangle, Send } from 'lucide-react';

export default function VerificationBanner() {
  const { user } = useAuth();
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Don't show if user is not logged in or is already verified
  if (!user || user.emailVerified) {
    return null;
  }

  const handleResend = async () => {
    setSending(true);
    setMessage('');
    setError('');
    try {
      await api.post('/auth/resend-verification');
      setMessage('Verification email sent!');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send email.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800 px-4 py-3">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0" />
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            Your email address is not verified. You won't be able to access workflows or downloads until you verify your email.
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          {message && <span className="text-sm text-green-600 dark:text-green-400 font-medium">{message}</span>}
          {error && <span className="text-sm text-red-600 dark:text-red-400 font-medium">{error}</span>}
          
          <button
            onClick={handleResend}
            disabled={sending}
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-yellow-700 bg-yellow-100 hover:bg-yellow-200 dark:text-yellow-100 dark:bg-yellow-800 dark:hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors disabled:opacity-50"
          >
            {sending ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
            ) : (
              <Send className="h-3 w-3 mr-1.5" />
            )}
            Resend Email
          </button>
        </div>
      </div>
    </div>
  );
}
