'use client';
import './chat.css';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

const Chat = ({ chat }) => {
  // Check if the chat is currently active and on screen for the user
  const pathname = usePathname();
  const isActive = pathname === `/chat/${chat.chatNo}`;

  return (
    <Link href={`/chat/${chat.chatNo}`}>
      <div className={`chat ${isActive ? 'chat-selected' : ''}`}>
        <img style={{ width: 24, height: 24 }} src="/double-chat-bubble.png" />
        <p className="chat-title-small">{chat.title}</p>
      </div>
    </Link>
  );
};

export default Chat;
