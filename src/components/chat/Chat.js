'use client';
import { usePathname, useRouter } from 'next/navigation';

import './chat.css';

import { useMadison } from '@/contexts/MadisonContext';

const Chat = ({ chat }) => {
  const router = useRouter();
  const { setCurrentRun } = useMadison();

  // Check if the chat is currently active and on screen for the user
  const pathname = usePathname();
  const isActive = pathname === `/chat/${chat.chatNo}`;

  const navigateToChat = () => {
    setCurrentRun(null);
    router.push(`/chat/${chat.chatNo}`);
  };

  return (
    <div className={`chat ${isActive ? 'chat-selected' : ''}`} onClick={navigateToChat}>
      <img style={{ width: 24, height: 24 }} src="/double-chat-bubble.png" />
      <p className="chat-title-small">{chat.title}</p>
    </div>
  );
};

export default Chat;
