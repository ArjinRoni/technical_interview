'use client';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import '../../../styles/chat.css';

import { Sidebar, UserInput, Message } from '@/components';

import { useMadison } from '@/contexts/MadisonContext';
import { useUI } from '@/contexts/UIContext';

const ChatPage = ({ params }) => {
  const { isSidebarOpen } = useUI();
  const { openai, currentRun } = useMadison();

  const { id } = params; // TODO: Need to use this somewhere

  const [userMessage, setUserMessage] = useState('');
  const [messages, setMessages] = useState([]);

  console.log('Got messages: ', messages);

  useEffect(() => {
    const checkForMessages = async (run) => {
      if (run.status === 'completed') {
        let messages_ = [];

        const messages = await openai.beta.threads.messages.list(run.thread_id);
        for (const message of messages.data.reverse()) {
          messages_.push({ role: message.role, text: message.content[0].text.value });
        }

        setMessages(messages_);
      } else {
        console.log(run.status);
      }
    };

    currentRun && checkForMessages(currentRun);
  }, [currentRun]);

  const addUserMessage = async () => {
    if (!userMessage || userMessage.length === 0) {
      toast.error('Please type your message.');
      return;
    }
    setMessages((prevMessages) => [...prevMessages, { role: 'user', text: userMessage }]);
    setUserMessage(''); // Reset the user message
  };

  return (
    <div className="chat-page">
      <Sidebar />
      <div className="chat-panel" style={{ marginLeft: isSidebarOpen ? 216 : 0 }}>
        {messages && messages.length > 0 && (
          <div className="messages-scrollview">
            {messages.map((message, index) => (
              <Message key={index} isAI={message.role === 'assistant'} text={message.text} />
            ))}
          </div>
        )}
        <UserInput
          userMessage={userMessage}
          setUserMessage={setUserMessage}
          onSubmit={addUserMessage}
        />
      </div>
    </div>
  );
};

export default ChatPage;
