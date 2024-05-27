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

const Sidebar = () => {
  const router = useRouter();
  const { logout } = useAuth();
  const { chats, createChat } = useChats();
  const { createThread, createRun } = useMadison();
  const { isSidebarOpen, setIsSidebarOpen, setIsLoading, setLoadingMessage } = useUI();

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
            {chats.map((chat) => (
              <Chat key={chat.chatNo} chat={chat} />
            ))}
          </div>
          <div className="sidebar-buttons">
            <SidebarButton src="/settings.png" text="Settings" />
            <SidebarButton src="/user.png" text="My account" />
            <SidebarButton src="/email-plus.png" text="Send feedback" />
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
