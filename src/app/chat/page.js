'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/contexts/AuthContext';

// NOTE: We don't serve anything at /chat at this moment, hence we redirect the user to /dashboard
const ChatPage = () => {
  const { user, isAuthLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthLoading) return; // Don't take an action when when the auth is still loading

    if (user) {
      // User is signed in, redirect to the dashboard
      router.push('/dashboard');
    } else {
      // User is not signed in, redirect to the login page
      router.push('/login');
    }
  }, [user, isAuthLoading, router]);

  return null;
};

export default ChatPage;
