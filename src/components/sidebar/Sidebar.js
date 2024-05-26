'use client';
import './sidebar.css';
import { useRouter } from 'next/navigation';

import Button from '../button/Button';

import { useAuth } from '@/contexts/AuthContext';
import { useChats } from '@/contexts/ChatsContext';
import { useMadison } from '@/contexts/MadisonContext';

const Sidebar = () => {
  const router = useRouter();
  const { logout } = useAuth();
  const { chats, createChat } = useChats();
  const { createThread, createRun } = useMadison();

  const createNewChatAndNavigate = async () => {
    const threadId = await createThread();
    await createRun(threadId);
    const chatId = await createChat(threadId);

    router.push(`/chat/${chatId}`);
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
    <div className="sidebar">
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
      <div className="sidebar-chats">{chats.map((x) => x.id)}</div>
      <div className="sidebar-buttons">
        <SidebarButton src="/settings.png" text="Settings" />
        <SidebarButton src="/user.png" text="My account" />
        <SidebarButton src="/email-plus.png" text="Send feedback" />
        <SidebarButton src="/log-out.png" text="Log out" onClick={async () => await logout()} />
      </div>
    </div>
  );
};

export default Sidebar;
