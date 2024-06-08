'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import OpenAI from 'openai';

import { useAuth } from './AuthContext';
import { config } from '@/utils/AssistantUtils';

export const MadisonContext = createContext({
  openai: null,
  assistant: null,
  currentRun: null,
  setCurrentRun: () => {},
  createThread: async () => {},
  addUserMessageToThread: async () => {},
  createRun: async () => {},
  resumeRun: async () => {},
});

export const useMadison = () => useContext(MadisonContext);

export const MadisonProvider = ({ children }) => {
  const { user } = useAuth();

  // TODO: Can create a helper assistant to set custom / unique titles for each ad.
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
      console.log('Created new assistant: ', assistant_);
      setAssistant(assistant_);
    }
  };

  // Function to start the conversation by creating a thread
  const createThread = async () => {
    const thread = await openai.beta.threads.create();
    return thread.id;
  };

  // Function to add user message to the thread
  const addUserMessageToThread = async ({ message, threadId, onTrainingComplete }) => {
    // Append message to the thread
    await openai.beta.threads.messages.create(threadId, {
      role: 'user',
      content: message,
    });

    // Create a new run only if there is no active run or the previous run is completed
    let run = await openai.beta.threads.runs.createAndPoll(threadId, {
      assistant_id: assistant.id,
    });

    // Set the current run to display the assistant response to the user
    setCurrentRun(run);

    // Check if the run requires an action
    if (run.status === 'requires_action') {
      const requiredAction = run.required_action;
      if (requiredAction.type === 'submit_tool_outputs') {
        const toolCalls = requiredAction.submit_tool_outputs.tool_calls;
        const toolOutputs = [];

        for (const toolCall of toolCalls) {
          if (toolCall.type === 'function') {
            const functionName = toolCall.function.name;
            const functionArgs = JSON.parse(toolCall.function.arguments);

            if (functionName === 'trigger_training') {
              const classificationToken = functionArgs.classification_token;
              console.log(
                `Triggering training API with classification token: ${classificationToken}`,
              );

              // Call the onTrainingComplete callback to initiate the training process
              const trainingSuccess = await onTrainingComplete(classificationToken);
              console.log(`trainingSuccess:  ${trainingSuccess}`);
              if (trainingSuccess) {
                // Training completed successfully
                const trainingResponse = {
                  status: 'success',
                  message: `Images uploaded successfully for classification token: ${classificationToken}. Training has been completed.`,
                };

                toolOutputs.push({
                  tool_call_id: toolCall.id,
                  output: JSON.stringify(trainingResponse),
                });
              } else {
                // Training failed or encountered an error
                const trainingResponse = {
                  status: 'error',
                  message: `Training failed for classification token: ${classificationToken}.`,
                };

                toolOutputs.push({
                  tool_call_id: toolCall.id,
                  output: JSON.stringify(trainingResponse),
                });
              }
            } else if (functionName === 'trigger_inference') {
              // For now, let's simulate a successful inference response
              const inferenceResponse = {
                status: 'success',
                message: 'Inference process started successfully',
              };

              toolOutputs.push({
                tool_call_id: toolCall.id,
                output: JSON.stringify(inferenceResponse),
              });
            } else {
              throw new Error(`Unknown function: ${functionName}`);
            }
          }
        }

        // Submit the tool outputs
        run = await openai.beta.threads.runs.submitToolOutputsAndPoll(threadId, run.id, {
          tool_outputs: toolOutputs,
        });

        // Update the current run to display the tool output to the user
        setCurrentRun(run);
      }
    }
  };

  // Function to create a run
  const createRun = async (threadId) => {
    let run = await openai.beta.threads.runs.createAndPoll(threadId, {
      assistant_id: assistant.id,
      additional_instructions: `Please address the user as ${user?.name?.split(' ')[0]?.trim()}`,
    });

    setCurrentRun(run);
  };

  // Function to resume a run from where we left off
  const resumeRun = async (threadId) => {
    try {
      const run = await openai.beta.threads.runs.retrieve(threadId, { assistant_id: assistant.id });
      setCurrentRun(run);
    } catch (error) {
      console.log('Got error trying to resume run: ', error);
    }
  };

  // Hook to create assistant upon initialization
  useEffect(() => {
    createOrRetrieveAssistant();
  }, []);

  return (
    <MadisonContext.Provider
      value={{
        openai,
        assistant,
        currentRun,
        setCurrentRun,
        createThread,
        addUserMessageToThread,
        createRun,
        resumeRun,
      }}
    >
      {children}
    </MadisonContext.Provider>
  );
};
