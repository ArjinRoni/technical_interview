'use client';
import React from 'react';
import { useRouter } from 'next/navigation';

import Chat from '../chat/Chat';
import Button from '../button/Button';

import { useAuth } from '@/contexts/AuthContext';
import { useChats } from '@/contexts/ChatsContext';
import { useMadison } from '@/contexts/MadisonContext';
import { useUI } from '@/contexts/UIContext';

import './sidebar.css';
import Spinner from '../spinner/Spinner';

const Sidebar = () => {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { chats, createChat } = useChats();
  const { createThread, createRun } = useMadison();
  const { isSidebarOpen, setIsSidebarOpen, setIsLoading, setLoadingMessage, setShowFeedbackForm } =
    useUI();

  // Function to create a new chat and navigate to the correct chat path
  const createNewChatAndNavigate = async () => {
    setIsLoading(true);
    setLoadingMessage(`Hang on tight... We're creating a new chat for you 🚀 `);

    const threadId = await createThread();
    await createRun(threadId);
    const chatNo = await createChat(threadId);
    router.push(`/chat/${chatNo}`);

    setIsLoading(false);
  };

  const SidebarButton = ({ src, text, onClick }) => {
    return (
      <div className="sidebar-button" onClick={onClick}>
        <img className="sidebar-button-img" src={src} />
        <p className="sidebar-button-text">{text}</p>
      </div>
    );
  };

  return (
    <div className="sidebar" style={{ width: isSidebarOpen ? 216 : 24 }}>
      {isSidebarOpen && (
        <>
          <Button
            borderRadius={8}
            fontSize={16}
            width="80%"
            alignSelf="center"
            type="button"
            text="New ad"
            emoji="rocket"
            onClick={createNewChatAndNavigate}
          />
          <div className="sidebar-chats">
            {chats && chats.length > 0 ? (
              chats.map((chat) => <Chat key={chat.chatNo} chat={chat} />)
            ) : (
              <div className="sidebar-chats-empty-state">
                {user && user.userId && chats ? (
                  <>
                    <img style={{ width: 48, height: 48 }} src="/double-chat-bubble.png" />
                    <p>You don't have any ads yet. Why not create a new one now?</p>{' '}
                  </>
                ) : (
                  <Spinner marginTop={64} isBlack={true} />
                )}
              </div>
            )}
          </div>
          <div className="sidebar-buttons">
            <SidebarButton
              src="/home.png"
              text="Dashboard"
              onClick={() => router.push('/dashboard')}
            />
            <SidebarButton
              src="/settings.png"
              text="Settings"
              onClick={() => router.push('/settings')}
            />
            <SidebarButton
              src="/user.png"
              text="My account"
              onClick={() => router.push('/account')}
            />
            <SidebarButton
              src="/email-plus.png"
              text="Send feedback"
              onClick={() => setShowFeedbackForm(true)}
            />
            <SidebarButton src="/log-out.png" text="Log out" onClick={async () => await logout()} />
          </div>
        </>
      )}
      <div
        className="sidebar-open-button"
        style={{
          borderTopLeftRadius: isSidebarOpen ? 12 : 0,
          borderBottomLeftRadius: isSidebarOpen ? 12 : 0,
        }}
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        <img
          style={{ width: 18, height: 18 }}
          src={isSidebarOpen ? '/arrow-left-white.png' : '/arrow-right-white.png'}
        />
      </div>
    </div>
  );
};

export default Sidebar;
