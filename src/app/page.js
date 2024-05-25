'use client';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/contexts/AuthContext';

const Home = () => {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      // User is signed in, redirect to the dashboard
      router.push('/dashboard');
    } else {
      // User is not signed in, redirect to the login page
      router.push('/login');
    }
  }, [user, router]);

  return null;
};

export default Home;
