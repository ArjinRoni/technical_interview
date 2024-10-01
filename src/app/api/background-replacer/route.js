import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import axios from 'axios';
import { bgReplacerConfig } from '@/utils/BackgroundReplacerAssistant';
import sharp from 'sharp';
import https from 'https';

// Initialize OpenAI client with server-side API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const ADDITIONAL_PROMPT = ", high quality, cinematic, ((photoshoot)), professional product photography";

const EXTERNAL_SERVICE_URL = 'http://34.81.132.129:5000/replace_background';

const EXTERNAL_SERVICE_TIMEOUT = 7 * 60 * 1000; // 7 minutes in milliseconds

const agent = new https.Agent({
  rejectUnauthorized: false
});

/**
 * This API route handles background replacement requests.
 * It receives the payload from the client, communicates with OpenAI's assistant,
 * and sends the data to the external background replacement service.
 */
export async function POST(request) {
  try {
    const productInfo = await request.json();
    console.log('Product Info received:', { ...productInfo, imageUrl: 'URL omitted for brevity' });

    // Fetch and convert image to base64
    const imageBase64 = await getImageAsBase64(productInfo.imageUrl);
    console.log('Image converted to base64. Length:', imageBase64.length);

    // Send only product info to OpenAI, not the base64 image
    const completion = await openai.chat.completions.create({
      model: bgReplacerConfig.model,
      messages: [
        { role: "system", content: bgReplacerConfig.instructions },
        { role: "user", content: `Generate background replacement prompts for this product: ${JSON.stringify(productInfo)}. ${productInfo.additionalUserNote}` }
      ],
      tools: bgReplacerConfig.tools,
      tool_choice: { type: "function", function: { name: "generate_background_replacement_prompts" } }
    });

    const functionArgs = JSON.parse(completion.choices[0].message.tool_calls[0].function.arguments);
    console.log('OpenAI generated prompts:', functionArgs);

    // Append the additional prompt to prompt_style and prompt_main
    functionArgs.prompt_style += ADDITIONAL_PROMPT;
    functionArgs.prompt_main += ADDITIONAL_PROMPT;

    console.log('Enhanced prompts:', functionArgs);

    // Send the enhanced prompts AND the base64 image to the external background replacement service
    const externalResponse = await axios.post('http://34.81.132.129:5000/replace_background', {
      ...functionArgs,
      url: productInfo.imageUrl,
      imageBase64 // Include the base64 image data here
    });

    console.log('External service response:', externalResponse.data);

    if (externalResponse.status === 200) {
      return NextResponse.json({ 
        success: true, 
        data: {
          ...externalResponse.data,
          formattedRequest: functionArgs // Include the enhanced prompts in the response
        }
      });
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

async function getImageAsBase64(url) {
  try {
    const response = await axios.get(url, { 
      responseType: 'arraybuffer',
      httpsAgent: agent
    });
    const buffer = Buffer.from(response.data);

    // Use sharp to convert the image to PNG format
    const pngBuffer = await sharp(buffer)
      .png()
      .toBuffer();

    // Convert the PNG buffer to base64
    const base64 = pngBuffer.toString('base64');

    // Ensure the base64 string is properly padded
    const paddedBase64 = base64.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

    // Return the base64 string without the data URI prefix
    return paddedBase64;
  } catch (error) {
    console.error('Error processing image:', error.message);
    throw new Error(`Failed to process image from URL: ${url}`);
  }
}