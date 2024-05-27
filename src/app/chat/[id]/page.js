'use client';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import '../../../styles/chat.css';

import { Sidebar, Glow, UserInput, Message } from '@/components';

import { useChats } from '@/contexts/ChatsContext';
import { useMadison } from '@/contexts/MadisonContext';
import { useUI } from '@/contexts/UIContext';
import { useFont } from '@/contexts/FontContext';

const ChatPage = ({ params }) => {
  // Get the route param -- NOTE: Here it's called `id` but it's actually `chatNo`. We do this to show /1 to the user instead of the long and ugly /<UUID>
  const { id } = params;

  const router = useRouter();
  const { isSidebarOpen, setIsLoading, setLoadingMessage } = useUI();
  const { openai, currentRun, addUserMessageToThread } = useMadison();
  const { chats, createMessage, getMessages, deleteChat } = useChats();
  const { primaryFont } = useFont();

  // Get the current chat based on the chat no
  const [currentChat, setCurrentChat] = useState(null);

  // Hook to set the current chat
  useEffect(() => {
    try {
      setCurrentChat(chats.find((chat) => chat.chatNo === parseInt(id)));
    } catch (error) {
      toast.error(`Ooops! We couldn't retrive your chat at this moment. Please try again later.`);
      console.log('Got error fetching the chat: ', error);
    }
  }, [chats, id]);

  const [userMessage, setUserMessage] = useState('');
  const [messages, setMessages] = useState([]);

  // Hook to retrieve messages for the current chat
  useEffect(() => {
    const loadMessages = async () => {
      const messages_ = await getMessages(currentChat.id);
      setMessages(messages_);
    };

    currentChat && loadMessages();
  }, [currentChat]);

  // Hook to check for messages from the assistant
  useEffect(() => {
    const checkForMessages = async (run) => {
      if (run.status === 'completed') {
        const openaiMessages = await openai.beta.threads.messages.list(run.thread_id);
        for (const openaiMessage of openaiMessages.data.reverse()) {
          // Construct the message DB object
          const message = {
            id: uuidv4(),
            role: openaiMessage.role,
            text: openaiMessage.content[0].text.value,
            images: null,
            rating: 0,
          };

          // If the message is unique, update messages and write to DB
          if (!messages.some((m) => m.text === message.text)) {
            setMessages((prevMessages) => [...prevMessages.filter((x) => !x.isLoading), message]); // NOTE: We remove the loading messages here
            createMessage({ message, chatId: currentChat.id });
          }
        }
      } else {
        console.log('Got run status: ', run.status);
      }
    };

    currentChat && currentRun && checkForMessages(currentRun);
  }, [currentChat, currentRun]);

  // Function to add a message to the chat from the user
  const addUserMessage = async () => {
    if (!userMessage || userMessage.length === 0) {
      toast.error('Please type your message.');
      return;
    }

    // Construct the message DB object
    const message = { id: uuidv4(), role: 'user', text: userMessage, images: null, rating: 0 };

    // If the message is unique, update messages and write to DB
    if (!messages.some((m) => m.text === message.text)) {
      setMessages((prevMessages) => [
        ...prevMessages,
        message,
        { role: 'assistant', isLoading: true }, // NOTE: We also pass an `isLoading` state here to indicate to the user loading
      ]);
      createMessage({ message, chatId: currentChat.id });
      addUserMessageToThread({ threadId: currentChat.threadId, message: message.text });
    }

    // Reset the user message
    setUserMessage('');
  };

  // Function to delete the chat and navigate back
  const deleteChatAndNavigateBack = async () => {
    setIsLoading(true);
    setLoadingMessage('Deleting your chat...');

    await deleteChat(currentChat.id);
    router.push('/dashboard');

    setIsLoading(false);
  };

  return (
    <div className="chat-page">
      <Sidebar />
      <Glow />
      <div className="chat-panel" style={{ marginLeft: isSidebarOpen ? 216 : 0 }}>
        {messages && messages.length > 0 && (
          <div className="chat-header">
            <img
              style={{ cursor: 'pointer', position: 'absolute', left: 32, width: 32, height: 32 }}
              src="/back-gradient.png"
              onClick={() => router.push('/dashboard')}
            />
            <p className="chat-title-large" style={{ fontFamily: primaryFont.style.fontFamily }}>
              {currentChat?.title}
            </p>
            <img
              style={{ cursor: 'pointer', position: 'absolute', right: 96, width: 32, height: 32 }}
              src="/delete.png"
              onClick={deleteChatAndNavigateBack}
            />
          </div>
        )}
        {messages && messages.length > 0 && (
          <div className="messages-scrollview">
            {currentChat &&
              messages.map((message, index) => (
                <Message key={index} message={message} chatId={currentChat.id} />
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
