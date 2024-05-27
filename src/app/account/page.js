'use client';
import React from 'react';
import '../../styles/account.css';

import { Sidebar, Glow, User } from '@/components';

import { useAuth } from '@/contexts/AuthContext';
import { useFont } from '@/contexts/FontContext';
import { useUI } from '@/contexts/UIContext';

const Account = () => {
  const { user, deleteAccount } = useAuth();
  const { isSidebarOpen } = useUI();
  const { primaryFont } = useFont();

  return (
    <div className="account-page">
      <Sidebar />
      <Glow />
      <div className="account-panel" style={{ marginLeft: isSidebarOpen ? 216 : 0 }}>
        <h1 style={{ fontFamily: primaryFont.style.fontFamily }}>Account</h1>
        <User user={user} />
        <button className="delete-account-button" onClick={deleteAccount}>
          <p>Delete your account</p>
        </button>
      </div>
    </div>
  );
};

export default Account;
