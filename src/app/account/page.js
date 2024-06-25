'use client';
import React from 'react';
import { toast } from 'react-hot-toast';
import '../../styles/account.css';

import { Sidebar, Glow, User } from '@/components';

import { useAuth } from '@/contexts/AuthContext';
import { useFont } from '@/contexts/FontContext';
import { useUI } from '@/contexts/UIContext';
import { useChats } from '@/contexts/ChatsContext';

const Account = () => {
  const { user, deleteAccount } = useAuth();
  const { chats, deleteChat } = useChats();
  const { isSidebarOpen } = useUI();
  const { primaryFont } = useFont();

  // Function to delete all chats
  const deleteAllChats = async () => {
    try {
      for (const chat of chats) {
        await deleteChat(chat.id);
      }
      toast.success(`All chats successfully deleted.`);
    } catch (error) {
      toast.error(`We could not delete all your chats at this moment. Please try again later.`);
    }
  };

  return (
    <div className="account-page">
      <Sidebar />
      <Glow />
      <div className="account-panel" style={{ marginLeft: isSidebarOpen ? 216 : 0 }}>
        <h1 style={{ fontFamily: primaryFont.style.fontFamily }}>Account</h1>
        <User user={user} />
        <button className="delete-chats-button" onClick={deleteAllChats}>
          <p>Delete all your chats</p>
        </button>
        <button className="delete-account-button" onClick={deleteAccount}>
          <p>Delete your account</p>
        </button>
      </div>
    </div>
  );
};

export default Account;
