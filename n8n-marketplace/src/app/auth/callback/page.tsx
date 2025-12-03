"use client";

import { useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

function CallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { login } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    const refreshToken = searchParams.get('refreshToken');

    if (token && refreshToken) {
      login(token, refreshToken);
    } else {
      // Only redirect if we've actually checked params and they're missing
      // This prevents premature redirect during hydration
      if (typeof window !== 'undefined') {
         // console.error('Missing tokens in callback URL');
         // router.push('/auth/login');
      }
    }
  }, [searchParams, login, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Authenticating...</h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">Please wait while we log you in.</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CallbackContent />
    </Suspense>
  );
}
