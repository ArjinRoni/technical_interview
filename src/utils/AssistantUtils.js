// Prompt for the assistant
const instructions = `
    Instructions for the AI Assistant:
    (REDACTED) resonates with their target audience. Gather all the necessary information, generate high-quality prompts, and leverage the power of AI to deliver exceptional results.
`;

// Reusable config for the assistant
export const config = {
  name: 'Madison',
  instructions: instructions,
  model: 'gpt-4o', // 'gpt-4-0125-preview'
  temperature: 0.9,
  functions: [ // Changed from 'tools' to 'functions'
    {
      type: 'function',
      function: {
        name: 'trigger_training',
        description:
          'Function to trigger the training process upon receipt of a classification token.',
        parameters: {
          type: 'object',
          properties: {
            classification_token: {
              type: 'string',
              description: 'Token for classifying the object of advertisement',
            },
          },
          required: ['classification_token'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'trigger_inference',
        description: 'Trigger the inference process with provided image prompts.',
        parameters: {
          type: 'object',
          properties: {
            image_prompts: {
              type: 'array',
              items: {
                type: 'string',
              },
              description:
                'The prompts that user confirmed to be sent to inference for image generation',
            },
          },
          required: ['image_prompts'],
        },
      },
    },
  ],
};