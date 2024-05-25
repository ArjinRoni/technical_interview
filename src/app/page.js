'use client';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/contexts/AuthContext';

const Base = () => {
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

export default Base;
