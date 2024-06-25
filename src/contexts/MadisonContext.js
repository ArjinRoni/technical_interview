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
  generateImage: async () => {},
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

  // Function to generate an image given an image prompt
  const generateImage = async (prompt, n = 1, model = 'dall-e-2') => {
    const response = await openai.images.generate({
      model,
      prompt,
      n,
      size: model === 'dall-e-2' ? '256x256' : '1024x1024',
      response_format: 'b64_json',
    });

    const imageBase64 = response.data[0].b64_json;
    return imageBase64;
  };

  // Function to add user message to the thread
  const addUserMessageToThread = async ({
    message,
    threadId,
    onTrainingCalled = async () => {},
    onMoodboardCalled = async () => {},
    onTextDelta = () => {},
    onTextDone = () => {},
  }) => {
    // Append message to the thread
    await openai.beta.threads.messages.create(threadId, { role: 'user', content: message });

    const accumulatedArgs = {};

    // Create a new run with streaming
    let run = openai.beta.threads.runs
      .stream(threadId, { assistant_id: assistant.id })
      .on('textCreated', (text) => null)
      .on('textDelta', (textDelta, snapshot) => onTextDelta(textDelta.value))
      .on('textDone', (text, snapshot) => onTextDone(text))
      .on('toolCallCreated', (toolCall) => {
        accumulatedArgs[toolCall.id] = { name: toolCall.function.name, args: '' };
      })
      .on('toolCallDelta', (delta, snapshot) => {
        if (snapshot.type === 'function' && delta.function.arguments) {
          accumulatedArgs[snapshot.id].args += delta.function.arguments;
        }
      })
      .on('toolCallDone', async (toolCall) => {
        // Pass if the tool call type is not a function
        if (toolCall.type !== 'function') return;

        // Get the name of the function call and the arguments passed
        const name = accumulatedArgs[toolCall.id].name;
        const argsString = accumulatedArgs[toolCall.id].args;
        let args;
        try {
          args = JSON.parse(argsString);
        } catch (error) {
          console.error('Error parsing function arguments:', error);
          return; // Skip processing this tool call if we can't parse the arguments
        }

        // Initialize the response to be passed to the stream as the tool output
        let toolOutput = null;

        // TRIGGER TRAINING
        if (name === 'trigger_training') {
          const { business_description, classification_token, image_urls } = args;
          console.log(
            `Triggered training with 
            business description of "${business_description}" and 
            classification token of "${classification_token}" with 
            ${image_urls.length} images.`,
          );

          // Call the specified function for handling training
          const success = await onTrainingCalled(
            business_description,
            classification_token,
            image_urls,
          );

          // Determine the tool output based on the response received
          toolOutput = success ? { status: 'success' } : { status: 'error' };
        }

        // TRIGGER MOODBOARD
        if (name === 'trigger_moodboard') {
          const { image_prompts } = args;
          console.log(`Triggered moodboard with image prompts of [${image_prompts}].`);

          // Call the specified function for handling moodboard
          const success = await onMoodboardCalled(image_prompts);

          // Determine the tool output based on the response received
          toolOutput = success ? { status: 'success' } : { status: 'error' };

          // Get the current run and submit tool outputs
          const toolOutputs = [{ tool_call_id: toolCall.id, output: JSON.stringify(toolOutput) }];
          const currentRun = run.currentRun();
          await openai.beta.threads.runs.submitToolOutputs(threadId, currentRun.id, {
            tool_outputs: toolOutputs,
          });

          return; // For moodboard only, we return without further streaming
        }

        // TRIGGER INFERENCE
        if (name === 'trigger_inference') {
          toolOutput = { status: 'success' }; // Simulate a successful inference response
        }

        // Get the current run
        const currentRun = run.currentRun();

        // Submit tool outputs based on the function called
        if (currentRun) {
          const toolOutputs = [{ tool_call_id: toolCall.id, output: JSON.stringify(toolOutput) }];

          // NOTE: We need to stream it here again for it to update the interface
          openai.beta.threads.runs
            .submitToolOutputsStream(threadId, currentRun.id, { tool_outputs: toolOutputs })
            .on('textDelta', (textDelta, snapshot) => onTextDelta(textDelta.value))
            .on('textDone', (text, snapshot) => onTextDone(text));
        }
      });
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
        generateImage,
        addUserMessageToThread,
        createRun,
        resumeRun,
      }}
    >
      {children}
    </MadisonContext.Provider>
  );
};
