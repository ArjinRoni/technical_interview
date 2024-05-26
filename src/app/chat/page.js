'use client';
import React from 'react';

import { Sidebar, UserInput } from '@/components';

import { useChats } from '@/contexts/ChatsContext';

const Chat = () => {
  return (
    <div>
      <Sidebar />
      <UserInput />
    </div>
  );
};

export default Chat;
