'use client';
import React, { useEffect, useState, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { ref, uploadString } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import '../../../styles/chat.css';

import { Sidebar, Glow, UserInput, Message, Progress } from '@/components';

import { useChats } from '@/contexts/ChatsContext';
import { useMadison } from '@/contexts/MadisonContext';
import { useUI } from '@/contexts/UIContext';
import { useAuth } from '@/contexts/AuthContext';
import { useFont } from '@/contexts/FontContext';
import { useFB } from '@/contexts/FBContext';

import { processStep, processSuggestions, formatNewLines } from '@/utils/StringUtils';
import { STEPS } from '@/utils/StepUtil';
import {
  MESSAGES,
  removeLoading,
  removeFormInput,
  isHideUserInput,
  isMessageLoading,
  finalStepsIdentifierText,
  transformToShots,
} from '@/utils/MessageUtils';

const ChatPage = ({ params }) => {
  // Get the route param -- NOTE: Here it's called `id` but it's actually `chatNo`. We do this to show /1 to the user instead of the long and ugly /<UUID>
  const { id } = params;

  // Hooks
  const router = useRouter();
  const { user } = useAuth();
  const { isSidebarOpen, setIsLoading, setLoadingMessage } = useUI();
  const { openai, currentRun, generateImage, addUserMessageToThread } = useMadison();
  const {
    chats,
    updateChat,
    getChatDetails,
    createMessage,
    getMessages,
    updateMessage,
    deleteChat,
  } = useChats();
  const { storage } = useFB();
  const { primaryFont } = useFont();
  const messagesContainerRef = useRef(null);

  // Chat interface states
  const [streamedMessage, setStreamedMessage] = useState('');
  const [currentChat, setCurrentChat] = useState(null);
  const [suggestionsLabel, setSuggestionsLabel] = useState(null);
  const [suggestions, setSuggestions] = useState(null);
  const [userMessage, setUserMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [currentStep, setCurrentStep] = useState(null);

  // Ad-generation related states (TODO: Currently not utilized fully)
  const [classificationToken, setClassificationToken] = useState(null);
  const [moodboardPrompts, setMoodboardPrompts] = useState(null);
  const [imagePrompts, setImagePrompts] = useState(null);

  // Variable to track if the current chat has messages
  const hasMessages = messages && messages.length > 0;

  // ----------------------------------------------------FOR SIMULATION----------------------------------------------------
  const isSimulateStoryboard = false; // Set to true to simulate storyboard
  useEffect(() => {
    const simulateStoryboard = async () => {
      console.log('Simulating storyboard...');

      // Generate the image URLs for the moodboard
      const prompts = ['deer', 'car', 'woman', 'bicycle'];
      let images = await generateImagesParallel(prompts);

      const uploadPromises = Array.from(images).map(async ({ prompt, base64 }, index) => {
        const chatId = currentChat.id;
        const storageFilepath = `users/${user.userId}/${chatId}/output/${index}.png`;
        const storageRef = ref(storage, storageFilepath);
        await uploadString(storageRef, base64, 'base64');
        return storageFilepath;
      });

      const imageStorageFilepaths = await Promise.all(uploadPromises);

      // Generate shots
      const shots = transformToShots(prompts, imageStorageFilepaths);

      // Construct the message DB object
      const message = {
        id: uuidv4(),
        role: 'assistant',
        text: null,
        shots: shots,
        step: STEPS.STORYBOARD,
        rating: 0,
      };

      // Remove the loading messages and add the message with images to update the interface
      setMessages((prev) => [...removeLoading(prev), message]);

      // Create the message DB object in the backend
      createMessage({ message, chatId: currentChat.id });
    };

    isSimulateStoryboard && setTimeout(() => simulateStoryboard(), 5000);
  }, [isSimulateStoryboard]);
  // ----------------------------------------------------FOR SIMULATION----------------------------------------------------

  // Hook to get and set the current chat based on the chat no (refresh)
  useEffect(() => {
    const loadMessages = async (chat) => {
      const messages_ = await getMessages(chat.id);

      // If the last message on the chat was from user OR if it's step 3 image upload, we re-run the assistant on the thread
      const lastMessage = messages_.slice(-1)[0];
      if (!lastMessage) return;

      // Get role, step, and suggestions from the last message
      const { role, step, suggestions: suggestions_ } = lastMessage;

      // Construct the new messages object
      const messages__ = [...messages_];

      // Push a new message based on the step
      if (step === STEPS.CLASSIFICATION_TOKEN) {
        messages__.push(MESSAGES.CLASSIFICATION_TOKEN);
      } else if (step === STEPS.IMAGE_UPLOAD) {
        messages__.push(MESSAGES.IMAGE_UPLOAD);
      } else if (step === STEPS.TRAINING) {
        messages__.push(MESSAGES.LOADING);
      } else if (step === STEPS.STYLE_AND_SETTING) {
        messages__.push(MESSAGES.STYLE_AND_SETTING);
      } else if (step === STEPS.INFERENCE || step === STEPS.STORYBOARD) {
        messages__.push(MESSAGES.SKELETON);
      } else if (role === 'user') {
        messages__.push(MESSAGES.LOADING);
      }

      // Update the suggestions if applicable
      if (suggestions_ && suggestions_.length > 0) {
        setSuggestions(suggestions_);
        if (step === STEPS.TARGET_AUDIENCE) {
          setSuggestionsLabel('Select or type your target audience');
        }
      }

      // Update the current step
      setCurrentStep(step);

      // Update the messages state
      setMessages(messages__);

      // Get and set chat details
      const {
        classificationToken: classificationToken_,
        imagePrompts: imagePrompts_,
        moodboardPrompts: moodboardPrompts_,
      } = await getChatDetails(chat.id);
      classificationToken_ && setClassificationToken(classificationToken_);
      moodboardPrompts_ && setMoodboardPrompts(moodboardPrompts_);
      imagePrompts_ && setImagePrompts(imagePrompts_);
    };

    try {
      if (chats && chats.length > 0) {
        const currentChat_ = chats.find((chat) => chat.chatNo === parseInt(id));
        if (currentChat_) {
          setCurrentChat(currentChat_);
          loadMessages(currentChat_);
        }
      }
    } catch (error) {
      toast.error(`Ooops! We couldn't retrive your chat at this moment. Please try again later.`);
      console.log('Got error fetching the chat: ', error);
    }
  }, [chats, id]);

  // Hook to add a skeleton loader at the end if one does not exist
  useEffect(() => {
    if (messages && messages.length > 0 && currentStep && currentStep >= STEPS.MOODBOARD) {
      const lastMessage = messages.slice(-1)[0];
      if (!lastMessage) return;

      if (
        !lastMessage.isSkeleton &&
        (currentStep >= STEPS.INFERENCE || lastMessage.text?.includes(finalStepsIdentifierText))
      ) {
        setMessages((prev) => [...prev, MESSAGES.SKELETON]);
      }
    }
  }, [messages, currentStep]);

  // Hook to poll the database for the last message (i.e., step 10)
  useEffect(() => {
    const loadMessages = async (chat) => {
      const messages_ = await getMessages(chat.id);
      setMessages(messages_);
    };

    if (currentChat && currentStep && (currentStep === 8 || currentStep === 9)) {
      loadMessages(currentChat);
    }
  }, [currentStep, currentChat]);

  const handleImageUpload = async (urls) => {
    try {
      // Construct the message DB object
      const message = {
        id: uuidv4(),
        role: 'user',
        text: null,
        images: urls,
        step: currentStep,
        rating: 0,
      };

      // Create the message on the DB
      createMessage({ message, chatId: currentChat.id });

      // Add user message to the thread to get assistant response
      addUserMessage({
        messageInit: `<USER HAS UPLOADED IMAGES: [${[urls]}]>`,
        updateMessages: false,
        addToDB: false,
      });
    } catch (error) {
      console.log('Got error @handleImageUpload: ', error);
    }
  };

  // Hook to set the current step in the chat
  useEffect(() => {
    if (hasMessages) {
      const { step } = messages.filter((x) => x.role === 'assistant').slice(-1)[0];
      step && setCurrentStep(step);
    }
  }, [currentChat, hasMessages]);

  const processAssistantMessage = (text, updateStep = true, updateSuggestions = true) => {
    let result = text;
    try {
      // Process steps
      const { step, text: result_ } = processStep(result);
      if (updateStep && step && step > 0 && currentStep !== step) {
        setCurrentStep(step);
      }
      result = result_;

      // Process suggestions
      const { suggestions: suggestions_, text: result__ } = processSuggestions(result);
      if (updateSuggestions && suggestions_ && suggestions_.length > 0) {
        if (step && step === STEPS.TARGET_AUDIENCE) {
          setSuggestionsLabel('Select or type your target audience');
        }

        setSuggestions(suggestions_);
      }
      result = result__;

      // Handle new lines s.t. they appear with a space in between
      result = formatNewLines(result);

      return {
        result: result?.trim(), // Remove whitespaces from both ends of the string
        step: updateStep && step && step > 0 && currentStep !== step ? step : currentStep,
        suggestions: suggestions_,
      };
    } catch (error) {
      console.log('Got error @processAssistantMessage: ', error);
      result = text;
      return { result, step: currentStep, suggestions: suggestions };
    }
  };

  // Function to handle assistant response done
  const handleTextDone = async (text) => {
    let { result, step, suggestions: suggestions_ } = processAssistantMessage(text?.value);

    // Construct the message DB object
    const message = {
      id: uuidv4(),
      role: 'assistant',
      text: result,
      images: null,
      step,
      rating: 0,
      suggestions: suggestions_,
    };

    // Construct new messages object
    let messages_ = [message];

    // Push the next message to the list depending on the step
    if (step === STEPS.CLASSIFICATION_TOKEN) {
      messages_.push(MESSAGES.CLASSIFICATION_TOKEN);
    } else if (step === STEPS.IMAGE_UPLOAD) {
      messages_.push(MESSAGES.IMAGE_UPLOAD);
    } else if (step === STEPS.TRAINING) {
      messages_.push(MESSAGES.LOADING);
    } else if (step === STEPS.STYLE_AND_SETTING) {
      messages_.push(MESSAGES.STYLE_AND_SETTING);
    } else if (
      step === STEPS.INFERENCE ||
      step === STEPS.STORYBOARD ||
      (step === STEPS.MOODBOARD && result?.includes(finalStepsIdentifierText))
    ) {
      messages_.push(MESSAGES.SKELETON);
    }

    // Remove the loading images and update the messages state
    setMessages((prev) => [...removeLoading(prev), ...messages_]);

    // Create the message DB object in the backend
    createMessage({ message: message, chatId: currentChat.id });
  };

  // Function to handle text delta
  const handleTextDelta = (textDelta) => {
    setStreamedMessage((prev) => {
      const { result } = processAssistantMessage(prev + textDelta);
      return result;
    });
  };

  // Main function to check for messages in the current chat (NOTE: This is currently only used for the first message...)
  const checkForMessages = async () => {
    try {
      // Get the thread ID from the current chat
      const threadId = currentChat.threadId;

      // Get messages in thread and update UI and DB accordingly
      const openaiMessages = await openai.beta.threads.messages.list(threadId);

      for (const openaiMessage of openaiMessages.data.reverse()) {
        // Get role, text, and step
        const role = openaiMessage.role;
        let text = openaiMessage.content[0].text.value;
        let step = null;

        // If the role is assistant, we parse it
        if (role === 'assistant') {
          try {
            step = parseInt(text.split(' ')[0].replace('[', '').replace(']', ''));
            text = text.split('] ').slice(-1)[0];
          } catch (error) {
            console.log('Got error parsing assistant response: ', error);
          }
        }

        // Construct the message DB object
        const message = {
          id: uuidv4(),
          role,
          text,
          images: null,
          step,
          rating: 0,
        };

        setMessages((prevMessages) => [...prevMessages.filter((x) => !x.isLoading), message]); // NOTE: We remove the loading messages here
        createMessage({ message, chatId: currentChat.id });
      }
    } catch (error) {
      console.log('Got error @checkForMessages: ', error);
    }
  };

  // Hook to check for messages from the assistant
  useEffect(() => {
    currentChat && currentRun && checkForMessages();
  }, [currentChat, currentRun]);

  // Function to add a message to the chat from the user
  const addUserMessage = ({ messageInit = null, updateMessages = true, addToDB = true } = {}) => {
    try {
      if (
        (!userMessage || userMessage?.length === 0) &&
        (!messageInit || messageInit?.length === 0)
      ) {
        toast.error(
          currentStep === STEPS.CLASSIFICATION_TOKEN
            ? 'Please enter your classification token to proceed.'
            : currentStep === STEPS.STYLE_AND_SETTING
              ? 'Please enter your style and setting preferences to proceed.'
              : 'Please type your message.',
        );
        return;
      }

      // Remove user input form messages
      setMessages((prev) => [...removeFormInput(prev)]);

      // Construct the message DB object
      const message = {
        id: uuidv4(),
        role: 'user',
        text: messageInit ?? userMessage,
        images: null,
        rating: 0,
        step: currentStep,
      };

      // Update the messages list with the above message if applicable (for UI update)
      if (updateMessages) {
        setMessages((prev) => [...prev, message, MESSAGES.STREAMING]);
      } else {
        setMessages((prev) => [...prev, MESSAGES.STREAMING]);
      }

      setStreamedMessage('');

      // Update the DB if applicable
      if (addToDB) {
        createMessage({ message, chatId: currentChat.id });
      }

      // Add user message to the thread to get response from the assistant
      addUserMessageToThread({
        threadId: currentChat.threadId,
        message: message.text,
        onTrainingCalled: handleTrainingCalled,
        onMoodboardCalled: handleMoodboardCalled,
        onInferenceCalled: handleInferenceCalled,
        onTextDelta: (textDelta) => handleTextDelta(textDelta),
        onTextDone: (text) => handleTextDone(text),
      });

      // Clean suggestions
      setSuggestions(null);

      // Reset the user message
      setUserMessage('');
    } catch (error) {
      console.log('Got error @addUserMessage: ', error);
    }
  };

  // Function to delete the chat and navigate back
  const deleteChatAndNavigateBack = async () => {
    setIsLoading(true);
    setLoadingMessage('Deleting your chat...');

    await deleteChat(currentChat.id);
    router.push('/dashboard');

    setIsLoading(false);
  };

  // Function to handle training
  const handleTrainingCalled = async (
    businessDescription,
    classificationToken,
    imageUrls,
    simulate = true,
  ) => {
    try {
      // Set classification token
      setClassificationToken(classificationToken);

      // Update the chat properties
      await updateChat(currentChat.id, { classificationToken });

      if (simulate) {
        console.log('Training simulated.');
        return true;
      }

      // Send the request to start the training process
      const response = await fetch(`${process.env.INSTANCE_BASE_URL}/training`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_description: businessDescription,
          image_urls: imageUrls,
          classification_token: classificationToken,
          file_name: `${user.userId}::${currentChat.id}`,
          user_id: user.userId,
          chat_id: currentChat.id,
        }),
      });

      if (response.ok) {
        // Training initiated successfully
        console.log('Training initiated with response:', response);
        // setClassificationToken(null);
        return true;
      } else {
        // Handle error case
        console.error('Failed to initiate training with response:', response);
        return false;
      }
    } catch (error) {
      console.error('Error triggering training:', error);
    }
  };

  // Function to handle moodboard image selection
  const handleMoodboardImageSelection = async (images) => {
    // Update the moodboard message
    updateMessage(currentChat.id, messages.slice(-1)[0].id, { images });

    // Add user message to the thread to get assistant response
    addUserMessage({
      messageInit: `<USER HAS SELECTED MOODBOARD IMAGES: [${[images]}]>. <PROCEED WITH THE FUNCTION "trigger_inference" NOW>.`,
      updateMessages: false,
      addToDB: false,
    });
  };

  // Generate the image URLs for the moodboard in parallel
  const generateImagesParallel = async (imagePrompts) => {
    const imagePromises = imagePrompts.map(async (imagePrompt) => {
      const imageBase64 = await generateImage(imagePrompt);
      return { prompt: imagePrompt, base64: imageBase64 };
    });

    return Promise.all(imagePromises);
  };

  // Function to handle moodboard
  const handleMoodboardCalled = async (imagePrompts) => {
    try {
      // Set moodboard propmts state
      setMoodboardPrompts(imagePrompts);

      // Update the chat properties
      await updateChat(currentChat.id, { moodboardPrompts: imagePrompts });

      // Add a loading message
      setMessages((prev) => [...removeLoading(prev), MESSAGES.LOADING]);

      // Generate the image URLs for the moodboard
      let images = await generateImagesParallel(imagePrompts);

      const uploadPromises = Array.from(images).map(async ({ prompt, base64 }, index) => {
        const prompt_ = prompt.replaceAll(' ', '_').replaceAll(',', '');
        const chatId = currentChat.id;
        const storageFilepath = `users/${user.userId}/${chatId}/moodboard/${index}.png`;
        const storageRef = ref(storage, storageFilepath);
        await uploadString(storageRef, base64, 'base64');
        return storageFilepath;
      });

      const imageStorageFilepaths = await Promise.all(uploadPromises);

      // Construct the message DB object
      const message = {
        id: uuidv4(),
        role: 'assistant',
        text: null,
        images: imageStorageFilepaths,
        step: STEPS.MOODBOARD,
        rating: 0,
      };

      // Remove the loading messages and add the message with images to update the interface
      setMessages((prev) => [...removeLoading(prev), message]);

      // Create the message DB object in the backend
      createMessage({ message, chatId: currentChat.id });
      return true;
    } catch (error) {
      setMessages((prev) => [...removeLoading(prev)]); // Remove the loading message
      console.log('Got error @handleMoodboardCalled: ', error);
      return false;
    }
  };

  // Function to handle inference
  const handleInferenceCalled = async (imagePrompts, classificationToken, simulate = true) => {
    try {
      // Set the image prompts and the classification token
      setImagePrompts(imagePrompts);
      setClassificationToken(classificationToken);

      // Update the chat properties
      await updateChat(currentChat.id, { imagePrompts, classificationToken });

      if (simulate) {
        console.log('Inference simulated.');
        return true;
      }

      const response = await fetch(`${process.env.INSTANCE_BASE_URL}/image_generation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lora_file_name: `${user.userId}::${currentChat.id}.safetensors`,
          classification_token: classificationToken,
          image_prompts: imagePrompts,
          user_id: user.userId,
          chat_id: currentChat.id,
        }),
      });

      if (response.ok) {
        console.log('Inference initiated with response:', response); // Inference initiated successfully
        return true;
      } else {
        console.error('Failed to complete inference'); // Handle error case
        return false;
      }
    } catch (error) {
      console.error('Error triggering inference:', error);
      return false;
    }
  };

  // Hook to keep the messages container scroll to the bottom
  useEffect(() => {
    if (currentChat && messages && messages.length > 0) {
      const element = messagesContainerRef.current;
      if (element) {
        element.scrollTop = element.scrollHeight;
      }
    }
  }, [currentChat, messages]); // assuming 'messages' is the state holding the chat content

  // Function to get labeling for the message
  const getLabel = (step, messages) => {
    let label = null;
    if (!step) return label;

    if (
      step === STEPS.BUSINESS_DESCRIPTION &&
      Math.max(...messages.map((x) => x.step ?? 0)) > STEPS.BUSINESS_DESCRIPTION
    ) {
      label = 'Business Description';
    } else if (
      step === STEPS.CLASSIFICATION_TOKEN &&
      Math.max(...messages.map((x) => x.step ?? 0)) > STEPS.CLASSIFICATION_TOKEN
    ) {
      label = 'Classification Token';
    } else if (
      step === STEPS.TARGET_AUDIENCE &&
      Math.max(...messages.map((x) => x.step ?? 0)) > STEPS.TARGET_AUDIENCE
    ) {
      label = 'Target Audience';
    } else if (
      step === STEPS.STYLE_AND_SETTING &&
      Math.max(...messages.map((x) => x.step ?? 0)) > STEPS.STYLE_AND_SETTING
    ) {
      label = 'Style & Setting';
    }

    return label;
  };

  // Hook to detect when the user has pressed enter
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (
        event.key === 'Enter' &&
        (currentStep === STEPS.CLASSIFICATION_TOKEN || currentStep === STEPS.STYLE_AND_SETTING)
      ) {
        addUserMessage();
      }
    };

    // Add event listener
    document.addEventListener('keydown', handleKeyDown);

    // Cleanup function to remove event listener
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentStep, userMessage]); // Empty dependency array means this effect runs once on mount and cleanup on unmount

  return (
    <div className="chat-page">
      <Sidebar />
      <Glow />
      <div className="chat-panel" style={{ marginLeft: isSidebarOpen ? 216 : 0 }}>
        {hasMessages && (
          <div className="chat-header">
            <img
              style={{
                cursor: 'pointer',
                position: 'absolute',
                left: isSidebarOpen ? 64 : 48,
                width: 32,
                height: 32,
              }}
              src="/back-gradient.png"
              onClick={() => router.push('/dashboard')}
            />
            <p className="chat-title-large" style={{ fontFamily: primaryFont.style.fontFamily }}>
              {currentChat?.title}
            </p>
            {hasMessages && <Progress step={currentStep} maxSteps={10} />}
            <img
              style={{ cursor: 'pointer', position: 'absolute', right: 32, width: 32, height: 32 }}
              src="/delete.png"
              onClick={deleteChatAndNavigateBack}
            />
          </div>
        )}
        {hasMessages && (
          <div className="messages-scrollview" ref={messagesContainerRef}>
            {currentChat &&
              messages.map((message, index) => (
                <Message
                  key={index}
                  message={{
                    ...message,
                    text: message.isStreaming ? streamedMessage : message.text,
                  }}
                  label={getLabel(message.step, messages)}
                  chatId={currentChat.id}
                  isActive={index === messages.length - 1}
                  suggestions={suggestions}
                  onSubmit={addUserMessage}
                  userMessage={userMessage}
                  setUserMessage={setUserMessage}
                  handleImageUpload={(urls) => handleImageUpload(urls)}
                  handleMoodboardImageSelection={(images) => handleMoodboardImageSelection(images)}
                  imagePrompts={message.step === STEPS.STORYBOARD ? imagePrompts : null}
                  moodboardPrompts={message.step === STEPS.MOODBOARD ? moodboardPrompts : null}
                />
              ))}
          </div>
        )}
        <UserInput
          hide={hasMessages && isHideUserInput(currentStep)}
          suggestions={suggestions}
          suggestionsLabel={suggestionsLabel}
          userMessage={userMessage}
          setUserMessage={setUserMessage}
          onSubmit={addUserMessage}
          isLoading={hasMessages && isMessageLoading(messages.slice(-1)[0])}
        />
      </div>
    </div>
  );
};

export default ChatPage;
