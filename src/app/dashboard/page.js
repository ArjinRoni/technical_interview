'use client';
import React, { useState, useEffect } from 'react';
import '../../styles/dashboard.css';

import { Sidebar, Glow, Spinner, Steps } from '@/components';

import { useChats } from '@/contexts/ChatsContext';
import { useAuth } from '@/contexts/AuthContext';
import { useFont } from '@/contexts/FontContext';
import { useUI } from '@/contexts/UIContext';

const Dashboard = () => {
  const { chats, getAllUserMessages } = useChats();
  const { primaryFont } = useFont();
  const { user } = useAuth();
  const { isSidebarOpen } = useUI();

  const [messagesCount, setMessagesCount] = useState(null);

  const InfoBox = ({ title, value }) => {
    return (
      <div className="info-box">
        <p style={{ fontSize: 18, fontFamily: primaryFont.style.fontFamily }}>{title}</p>
        {value === null ? (
          <Spinner marginTop={8} isGray={true} />
        ) : (
          <p className="info-box-value">{value}</p>
        )}
      </div>
    );
  };

  // Hook to count user messages
  useEffect(() => {
    const getMessagesCount = async () => {
      const messages = await getAllUserMessages();
      setMessagesCount(messages?.length ?? 0);
    };

    user && user.userId && getMessagesCount();
  }, [user]);

  // Function to get greeting text based on date time
  function getGreeting() {
    const currentHour = new Date().getHours();
    if (currentHour < 12) {
      return 'Good morning';
    } else if (currentHour < 18) {
      return 'Good afternoon';
    } else {
      return 'Good evening';
    }
  }

  return (
    <div className="dashboard-page">
      <Sidebar />
      <Glow />
      <div className="dashboard-panel" style={{ marginLeft: isSidebarOpen ? 216 : 0 }}>
        <img className="dashboard-logo" src="/logo.png" />
        <p style={{ fontFamily: primaryFont.style.fontFamily }} className="greeting">
          {getGreeting()}, {user?.name?.split(' ')[0].trim()}
        </p>
        <div className="info-boxes">
          <InfoBox title="Ads created" value={chats?.length} />
          <InfoBox title="Messages sent" value={messagesCount} />
          <InfoBox title="Ads shared" value={0} />
        </div>
        <Steps />
      </div>
    </div>
  );
};

export default Dashboard;
