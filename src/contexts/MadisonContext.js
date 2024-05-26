'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import OpenAI from 'openai';

import { useAuth } from './AuthContext';
import { config } from '@/utils/AssistantUtils';

export const MadisonContext = createContext({
  openai: null,
  assistant: null,
  currentRun: null,
  createThread: async () => {},
  createRun: async () => {},
});

export const useMadison = () => useContext(MadisonContext);

export const MadisonProvider = ({ children }) => {
  const { user } = useAuth();

  const [assistant, setAssistant] = useState(null);
  const [currentRun, setCurrentRun] = useState(null);

  // Create OpenAI client
  const openai = new OpenAI({
    default_headers: { 'OpenAI-Beta': 'assistants=v2' },
    apiKey: process.env.OPENAI_API_KEY,
    dangerouslyAllowBrowser: true,
  });

  // Function to create OR retrieve the assistant ID
  const createOrRetrieveAssistant = async () => {
    if (process.env.ASSISTANT_ID) {
      // NOTE: This ensures no redundant assistants are created -- we assume one assistant for all users
      setAssistant({ id: process.env.ASSISTANT_ID });
    } else {
      const assistant_ = await openai.beta.assistants.create(config);
      console.log(assistant_);
      setAssistant(assistant_);
    }
  };

  // Function to start the conversation by creating a thread
  const createThread = async () => {
    const thread = await openai.beta.threads.create();
    return thread.id;
  };

  // Function to create a run
  const createRun = async (threadId) => {
    let run = await openai.beta.threads.runs.createAndPoll(threadId, {
      assistant_id: assistant.id,
      instructions: `Please address the user as ${user?.name}.`,
    });

    setCurrentRun(run);
  };

  // Hook to create assistant upon initialization
  useEffect(() => {
    createOrRetrieveAssistant();
  }, []);

  return (
    <MadisonContext.Provider value={{ openai, assistant, currentRun, createThread, createRun }}>
      {children}
    </MadisonContext.Provider>
  );
};
