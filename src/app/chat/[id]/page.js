'use client';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import '../../../styles/chat.css';

import { Sidebar, Glow, UserInput, Message, ImageUpload } from '@/components';

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

  const [currentChat, setCurrentChat] = useState(null);
  const [classificationToken, setClassificationToken] = useState(null);
  const [userMessage, setUserMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [trainingCompleteCallback, setTrainingCompleteCallback] = useState(null);

  // Hook to get and set the current chat based on the chat no
  useEffect(() => {
    try {
      chats &&
        chats.length > 0 &&
        setCurrentChat(chats.find((chat) => chat.chatNo === parseInt(id)));
    } catch (error) {
      toast.error(`Ooops! We couldn't retrive your chat at this moment. Please try again later.`);
      console.log('Got error fetching the chat: ', error);
    }
  }, [chats, id]);

  const handleImageUpload = async (urls) => {
    // Construct the message DB object
    const message = {
      id: uuidv4(),
      role: 'user',
      text: null,
      images: urls,
      rating: 0,
    };

    // Add new is loading assistant message to simulate loading
    setMessages((prevMessages) => [
      ...prevMessages.filter((x) => !x.isLoading),
      { role: 'assistant', isLoading: true },
    ]);

    // Create the message on the DB
    createMessage({ message, chatId: currentChat.id });

    const trainingSuccess = await new Promise((resolve) => {
      handleTraining(classificationToken, urls)
        .then((success) => {
          resolve(success);
        })
        .catch((error) => {
          console.error('Error during training:', error);
          resolve(false);
        });
    });

    // Call the trainingCompleteCallback with the training success status
    trainingCompleteCallback(trainingSuccess);
  };

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
      // Get messages in thread and update UI and DB accordingly
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

      // If the run requires an action, execut the action accordingly
      if (run.status === 'requires_action') {
        const requiredAction = run.required_action;
        if (requiredAction.type === 'submit_tool_outputs') {
          const toolCalls = requiredAction.submit_tool_outputs.tool_calls;
          for (const toolCall of toolCalls) {
            if (toolCall.function && toolCall.function.name === 'trigger_training') {
              const classificationToken = JSON.parse(
                toolCall.function.arguments,
              ).classification_token;
              setClassificationToken(classificationToken);
              setMessages((prevMessages) => [...prevMessages, { isImageUpload: true }]);
              break; // Exit the loop after finding the trigger_training function
            } else if (toolCall.function && toolCall.function.name === 'trigger_inference') {
              const imagePrompts = JSON.parse(toolCall.function.arguments).image_prompts;
              console.log(`Image prompts: ${imagePrompts}`);
              await handleInference(imagePrompts);
            }
          }
        }
      }
    };

    currentChat && currentRun && checkForMessages(currentRun);
  }, [currentChat, currentRun]);

  const handleTrainingComplete = () => {
    return new Promise((resolve) => {
      setTrainingCompleteCallback(() => resolve);
    });
  };

  // Function to add a message to the chat from the user
  const addUserMessage = async () => {
    if (!userMessage || userMessage.length === 0) {
      toast.error('Please type your message.');
      return;
    }

    // Construct the message DB object
    const message = {
      id: uuidv4(),
      role: 'user',
      text: userMessage,
      images: null,
      rating: 0,
    };

    // If the message is unique, update messages and write to DB
    if (!messages.some((m) => m.text === message.text)) {
      setMessages((prevMessages) => [
        ...prevMessages,
        message,
        { role: 'assistant', isLoading: true }, // NOTE: We also pass an `isLoading` state here to indicate to the user loading
      ]);
      createMessage({ message, chatId: currentChat.id });
      addUserMessageToThread({
        threadId: currentChat.threadId,
        message: message.text,
        onTrainingComplete: handleTrainingComplete,
      });
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

  const handleTraining = async (classificationToken, imageUrls) => {
    try {
      // TODO: Implement the API call to trigger training with the classification token and image URLs
      /*       const response = await fetch('/api/training', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ classificationToken, imageUrls }),
      }); */
      const response = { status: 200, ok: true };
      if (response.ok) {
        // Training initiated successfully
        console.log('Training initiated');
        setClassificationToken(null);
        return true;
      } else {
        // Handle error case
        console.error('Failed to initiate training');
        return false;
      }
    } catch (error) {
      console.error('Error triggering training:', error);
    }
  };

  const handleInference = async (imagePrompts) => {
    try {
      // TODO: Implement the API call to trigger inference with the image prompts
      /*       const response = await fetch('/api/inference', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imagePrompts }),
      }); */
      const response = { status: 200, ok: true };
      if (response.ok) {
        // Inference completed successfully
        console.log('Inference completed');
        // TODO: Handle the generated images or output from the inference API
      } else {
        // Handle error case
        console.error('Failed to complete inference');
      }
    } catch (error) {
      console.error('Error triggering inference:', error);
    }
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
              style={{ cursor: 'pointer', position: 'absolute', right: 32, width: 32, height: 32 }}
              src="/delete.png"
              onClick={deleteChatAndNavigateBack}
            />
          </div>
        )}
        {messages && messages.length > 0 && (
          <div className="messages-scrollview">
            {currentChat &&
              messages.map((message, index) => (
                <Message
                  key={index}
                  message={message}
                  chatId={currentChat.id}
                  isActive={index === messages.length - 1}
                  handleImageUpload={(urls) => handleImageUpload(urls)}
                />
              ))}
          </div>
        )}
        <UserInput
          hide={messages && messages.length > 0 && messages.slice(-1)[0].isImageUpload === true}
          userMessage={userMessage}
          setUserMessage={setUserMessage}
          onSubmit={addUserMessage}
        />
      </div>
    </div>
  );
};

export default ChatPage;
