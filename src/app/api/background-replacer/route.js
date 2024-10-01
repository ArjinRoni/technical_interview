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

const ADDITIONAL_PROMPT = ", high quality, cinematic, photoshoot, professional product photography";

const EXTERNAL_SERVICE_URL = 'http://34.81.132.129:5000/replace_background';

const EXTERNAL_SERVICE_TIMEOUT = 7 * 60 * 1000; // 7 minutes in milliseconds

const agent = new https.Agent({
  rejectUnauthorized: false
});

/**
 * Fetches an image from the given URL and converts it to a standard Base64-encoded string.
 * @param {string} url - The URL of the image to fetch and convert.
 * @returns {Promise<string>} - The Base64-encoded string of the image.
 */
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

    // Convert the PNG buffer to standard Base64
    const base64 = pngBuffer.toString('base64');

    // Log the first 15 characters of the Base64 string for readability
    console.log(`Image Base64 (first 15 chars): ${base64.substring(0, 15)}...`);

    // Return the standard Base64 string
    return base64;
  } catch (error) {
    console.error('Error processing image:', error.message);
    throw new Error(`Failed to process image from URL: ${url}`);
  }
}

/**
 * This API route handles background replacement requests.
 * It receives the payload from the client, communicates with OpenAI's assistant,
 * and sends the data to the external background replacement service.
 */
export async function POST(request) {
  try {
    const productInfo = await request.json();
    console.log('Product Info received:', { ...productInfo, imageUrl: 'URL omitted for brevity' });

    // Fetch and convert image to standard Base64
    const imageBase64 = await getImageAsBase64(productInfo.imageUrl);
    console.log('Image converted to base64. Length:', imageBase64.length);

    // Send only product info to OpenAI, not the Base64 image
    const completion = await openai.chat.completions.create({
      model: bgReplacerConfig.model,
      messages: [
        { role: "system", content: bgReplacerConfig.instructions },
        { role: "user", content: `Generate background replacement prompts for this product: ${JSON.stringify(productInfo)}. ${productInfo.additionalUserNote}` }
      ],
      functions: bgReplacerConfig.functions,
      function_call: { name: "generate_background_replacement_prompts" }
    });

    console.log('OpenAI response:', completion);

    if (!completion || !completion.choices || !completion.choices[0]) {
      throw new Error('Invalid response from OpenAI API');
    }

    const functionArgs = JSON.parse(completion.choices[0].message.function_call.arguments);

    console.log('Function arguments:', functionArgs);

    // Append the additional prompt to prompt_style and prompt_main
    functionArgs.prompt_style += ADDITIONAL_PROMPT;
    functionArgs.prompt_main += ADDITIONAL_PROMPT;

    // Send the generated prompts and the standard Base64 image to the external background replacement service
    const externalResponse = await axios.post('http://34.81.132.129:5000/replace_background', {
      ...functionArgs,
      url: productInfo.imageUrl,
      imageBase64 // Include the standard Base64 image data here
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