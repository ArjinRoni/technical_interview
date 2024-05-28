'use client';
import React, { useEffect } from 'react';
import Head from 'next/head';
import { Toaster } from 'react-hot-toast';
import { Analytics } from '@vercel/analytics/react';
import './globals.css';

import { FBProvider } from '@/contexts/FBContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { MadisonProvider } from '@/contexts/MadisonContext';
import { ChatsProvider } from '@/contexts/ChatsContext';
import { FontProvider } from '@/contexts/FontContext';
import { UIProvider } from '@/contexts/UIContext';

export default function RootLayout({ children }) {
  // Hook to set the title and meta description tags for the application
  useEffect(() => {
    document.title = 'NewFrame AI App';
    const meta = document.createElement('meta');
    meta.name = 'description';
    meta.content = 'Welcome to the Future of Advertising';
    document.head.appendChild(meta);

    return () => {
      document.head.removeChild(meta);
    };
  }, []);

  // NOTE: We suppress hydration warnings as described in https://stackoverflow.com/questions/75337953/what-causes-nextjs-warning-extra-attributes-from-the-server-data-new-gr-c-s-c
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <Head>
        <title>NewFrame AI App</title>
        <meta name="description" content="Welcome to the Future of Advertising" />
      </Head>
      <body suppressHydrationWarning={true}>
        <FBProvider>
          <FontProvider>
            <AuthProvider>
              <UIProvider>
                <MadisonProvider>
                  <ChatsProvider>
                    <Toaster />
                    {children}
                    <Analytics />
                  </ChatsProvider>
                </MadisonProvider>
              </UIProvider>
            </AuthProvider>
          </FontProvider>
        </FBProvider>
      </body>
    </html>
  );
}
