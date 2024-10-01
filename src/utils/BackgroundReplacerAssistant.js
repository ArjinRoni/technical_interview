// BackgroundReplacerAssistant.js

// System prompt for the Background Replacer Assistant
const bgReplacerInstructions = `
    You are a specialized assistant designed to process product information fetched from Pazarama and generate prompts for background replacement on images.

    Your task is to receive the fetched product text data and generate a JSON structure with the following fields:
    - prompt_style: A stable diffusion prompt for stylistic choice, this should be a short stable diffusion prompt or dall e prompt describing the style of the background
    - prompt_main: The main prompt, in this you should not describe the product itself, but eg. "a bottle" + background description. 
    - classification_token: A single (simple) word (in English) describing the object, e.g., "bottle", "sunglasses"
    - url: The URL of the product image from Pazarama


    Use the product information to create compelling and relevant prompts. Be creative with the prompt_style to enhance the visual appeal of the product. Prompts should be around 20 tokens. For the main prompt, use "<classification_token>, <background_prompt>" Classification token should be a single word, and background prompt should be a 10-12 word description of the background in stable diffusion prompt format. You are the master of prompt writing and you have seen prompts from Civitai, leonardo ai, 

    Ensure all data is accurately captured and formatted.
`;

// Export the configuration
export const bgReplacerConfig = {
  name: 'BackgroundReplacer',
  instructions: bgReplacerInstructions,
  model: 'gpt-4o', // Ensure you're using the correct model
  temperature: 0.7,
  functions: [
    {
      name: "generate_background_replacement_prompts",
      description: "Generate prompts for background replacement based on product information",
      parameters: {
        type: "object",
        properties: {
          prompt_style: {
            type: "string",
            description: "Style prompt for the background replacement keep this at minimum 20 tokens"
          },
          prompt_main: {
            type: "string",
            description: "Main prompt describing the image content, keep this at minimum 25 tokens"
          },
          classification_token: {
            type: "string",
            description: "Token for classifying the object of advertisement"
          },
          url: {
            type: "string",
            description: "URL of the product image"
          }
        },
        required: ["prompt_style", "prompt_main", "classification_token", "url"]
      }
    }
  ],
};