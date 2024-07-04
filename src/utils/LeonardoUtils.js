import axios from 'axios';

const API_BASE_URL = 'https://cloud.leonardo.ai/api/rest/v1';
const BEARER_TOKEN = process.env.LEONARDO_TOKEN;
const MODEL_ID = 'b24e16ff-06e3-43eb-8d33-4416c2d75876';

const headers = {
  accept: 'application/json',
  authorization: `Bearer ${BEARER_TOKEN}`,
  'content-type': 'application/json',
};

// Function to send a generation request
async function sendGenerationRequest(data) {
  try {
    const response = await axios.post(`${API_BASE_URL}/generations`, data, { headers });
    return response.data;
  } catch (error) {
    console.error('Error sending generation request:', error);
    throw error;
  }
}

// Function to retrieve generation results
async function getGenerationResults(generationId) {
  try {
    const response = await axios.get(`${API_BASE_URL}/generations/${generationId}`, { headers });
    return response.data;
  } catch (error) {
    console.error('Error retrieving generation results:', error);
    throw error;
  }
}

// Example usage function
export async function generateAndRetrieveImages(
  prompt,
  numImages = 1,
  size = 1024,
  alchemy = false,
  num_inference_steps = 10,
  sd_version = 'SDXL_LIGHTNING',
  guidance_scale = 4,
) {
  try {
    // Send generation request
    const generationData = {
      alchemy: alchemy,
      height: size,
      width: size,
      modelId: MODEL_ID,
      num_images: numImages,
      num_inference_steps: num_inference_steps,
      sd_version: sd_version,
      guidance_scale: guidance_scale,
      presetStyle: 'DYNAMIC',
      prompt: prompt,
    };

    const generationResponse = await sendGenerationRequest(generationData);

    // Wait for generation to complete (you might want to implement a more sophisticated polling mechanism)
    await new Promise((resolve) => setTimeout(resolve, 20000)); // Wait for 20 seconds

    // Retrieve results
    const results = await getGenerationResults(generationResponse.sdGenerationJob.generationId);
    return results;
  } catch (error) {
    console.error('Error in generate and retrieve process:', error);
  }
}
