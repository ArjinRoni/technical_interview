import axios from 'axios';
import { generateSignedUrls } from './MediaUtils';

const API_BASE_URL = 'https://cloud.leonardo.ai/api/rest/v1';
const BEARER_TOKEN = process.env.LEONARDO_TOKEN;
const MODEL_ID = 'b24e16ff-06e3-43eb-8d33-4416c2d75876';

const headers = {
  accept: 'application/json',
  authorization: `Bearer ${BEARER_TOKEN}`,
  'content-type': 'application/json',
};

// Function to get a presigned URL for uploading an image
async function getPresignedUrl() {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/init-image`,
      { extension: 'jpg' },
      { headers },
    );
    return response.data.uploadInitImage;
  } catch (error) {
    console.error('Error getting presigned URL:', error);
    throw error;
  }
}

// Function to upload image via presigned URL
async function uploadImage(url, fields, imageBlob) {
  try {
    // Parse the fields
    const parsedFields = JSON.parse(`${fields}`);

    // Create the final form data
    const formData = new FormData();

    // Append all parsed fields from the presigned URL
    Object.entries(parsedFields).forEach(([k, v]) => formData.append(k, v));

    // Append the file last
    formData.append('file', imageBlob);

    const response = await axios.post(url, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading image:', error.response ? error.response.data : error.message);
    throw error;
  }
}

// Function to generate video with an init image
async function generateVideo(imageId, motionStrength, useMotionStrength = true) {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/generations-motion-svd`,
      {
        imageId: imageId,
        isInitImage: true,
        motionStrength: useMotionStrength ? motionStrength : null,
      },
      { headers },
    );
    return response.data.motionSvdGenerationJob.generationId;
  } catch (error) {
    console.error('Error generating video:', error);
    throw error;
  }
}

// Function to get the generated video
async function getGeneratedVideo(generationId) {
  try {
    const response = await axios.get(`${API_BASE_URL}/generations/${generationId}`, { headers });
    return response.data;
  } catch (error) {
    console.error('Error getting generated video:', error);
    throw error;
  }
}

// Function to handle Leonardo AI video generation
export async function handleLeonardoVideoGeneration(imageUrls, motionScales, storage) {
  // Generate signed URLs for the images
  const signedImageUrls = await generateSignedUrls({
    images: imageUrls,
    storage,
    setImages: null,
    setUploading: null,
  });

  const results = [];
  for (let i = 0; i < signedImageUrls.length; i++) {
    try {
      // Step 1: Get a presigned URL
      const { url: uploadUrl, fields, id: imageId } = await getPresignedUrl();

      // Step 2: Get the image blob and upload the image
      const imageResponse = await axios.get(signedImageUrls[i], { responseType: 'blob' });
      const imageBlob = imageResponse.data;
      await uploadImage(uploadUrl, fields, imageBlob);

      // Step 3: Generate video
      const generationId = await generateVideo(imageId, Math.ceil(motionScales[i] / 24));

      // Step 4: Get the generated video
      let videoData;
      for (let attempt = 0; attempt < 10; attempt++) {
        // Try for a total of 10 attemps x 10 seconds = 100 seconds
        await new Promise((resolve) => setTimeout(resolve, 10000)); // Wait for 10 seconds
        videoData = await getGeneratedVideo(generationId);
        if (videoData.generations_by_pk.generated_images.length > 0) break;
      }

      if (!videoData || videoData.generations_by_pk.generated_images.length === 0) {
        throw new Error('Failed to retrieve video data after multiple attempts');
      }

      results.push({
        originalImageUrl: signedImageUrls[i],
        generatedVideoUrl: videoData.generations_by_pk.generated_images[0].motionMP4URL,
      });
    } catch (error) {
      console.error(`Error in video generation process for image ${i + 1}:`, error);
      results.push({
        originalImageUrl: signedImageUrls[i],
        generatedVideoUrl: null,
        error: error.message,
      });
    }
  }

  return results.map((x) => x.generatedVideoUrl);
}

// Keeping the existing functions for completeness
export async function sendGenerationRequest(data) {
  try {
    const response = await axios.post(`${API_BASE_URL}/generations`, data, { headers });
    return response.data;
  } catch (error) {
    console.error('Error sending generation request:', error);
    throw error;
  }
}

export async function getGenerationResults(generationId) {
  try {
    const response = await axios.get(`${API_BASE_URL}/generations/${generationId}`, { headers });
    return response.data;
  } catch (error) {
    console.error('Error retrieving generation results:', error);
    throw error;
  }
}

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
    await new Promise((resolve) => setTimeout(resolve, 20000));
    const results = await getGenerationResults(generationResponse.sdGenerationJob.generationId);
    return results;
  } catch (error) {
    console.error('Error in generate and retrieve process:', error);
  }
}
