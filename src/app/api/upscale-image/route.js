import { NextResponse } from 'next/server';
import axios from 'axios';

const UPSCALER_SERVICE_URL = 'http://34.81.132.129:5001/upscale_image';

export async function POST(request) {
  try {
    const { imageBase64 } = await request.json();

    if (!imageBase64) {
      return NextResponse.json({ success: false, error: 'Image data is required' }, { status: 400 });
    }

    const response = await axios.post(UPSCALER_SERVICE_URL, { imageBase64 }, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 300000 // 5 minutes timeout
    });

    if (response.data.success) {
      return NextResponse.json({
        success: true,
        data: {
          upscaledImage: response.data.image
        }
      });
    } else {
      throw new Error(response.data.error || 'Upscaling failed');
    }
  } catch (error) {
    console.error('Error in upscale image API:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'An unexpected error occurred'
    }, { status: 500 });
  }
}
