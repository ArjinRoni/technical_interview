'use client';
import React, { useEffect, useState } from 'react';

import '../../../styles/chat.css';

import { Sidebar, UserInput, Message } from '@/components';
import { useMadison } from '@/contexts/MadisonContext';

const ChatPage = ({ params }) => {
  const { openai, currentRun } = useMadison();

  const { id } = params;

  const [userMessage, setUserMessage] = useState('');
  const [messages, setMessages] = useState([]);

  console.log('Got messages: ', messages);

  useEffect(() => {
    const checkForMessages = async (run) => {
      if (run.status === 'completed') {
        let messages_ = [];

        const messages = await openai.beta.threads.messages.list(run.thread_id);
        for (const message of messages.data.reverse()) {
          messages_.push(message);
        }

        //setMessages(messages_);
      } else {
        console.log(run.status);
      }
    };

    currentRun && checkForMessages(currentRun);
  }, [currentRun]);

  const addUserMessage = async () => {
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setUserMessage(''); // Reset the user message
  };

  return (
    <div className="chat-page">
      <Sidebar />
      <div className="chat-panel">
        {messages && messages.length > 0 && (
          <div className="messages-scrollview">
            {messages.map((message, index) => (
              <Message key={index} message={message} />
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
