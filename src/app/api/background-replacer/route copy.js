import { NextResponse } from 'next/server';
import { Configuration, OpenAIApi } from 'openai';
import axios from 'axios';
import { bgReplacerConfig } from '@/utils/BackgroundReplacerAssistant';

// Initialize OpenAI client with server-side API key
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

/**
 * This API route handles background replacement requests.
 * It receives the payload from the client, communicates with OpenAI's assistant,
 * and sends the data to the external background replacement service.
 */
export async function POST(request) {
  const productInfo = await request.json();

  try {
    console.log('Product Info received:', productInfo);

    const completion = await openai.createChatCompletion({
      model: bgReplacerConfig.model,
      messages: [
        { role: "system", content: bgReplacerConfig.instructions },
        { role: "user", content: `Generate image prompts for this product: ${JSON.stringify(productInfo)}` }
      ],
      tools: bgReplacerConfig.tools,
      tool_choice: { type: "function", function: { name: "generate_background_replacement_prompts" } }
    });

    console.log('OpenAI response:', completion.data);

    const functionArgs = JSON.parse(completion.data.choices[0].message.tool_calls[0].function.arguments);

    console.log('Function arguments:', functionArgs);

    // Send the generated prompts to the external background replacement service
    const externalResponse = await axios.post('http://34.81.132.129:5000/replace_background', functionArgs);

    console.log('External service response:', externalResponse.data);

    if (externalResponse.status === 200) {
      return NextResponse.json({ success: true, data: externalResponse.data });
    } else {
      throw new Error('Background replacement service failed.');
    }
  } catch (error) {
    console.error('Error in background replacer API:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message, 
      stack: error.stack 
    }, { status: 500 });
  }
}