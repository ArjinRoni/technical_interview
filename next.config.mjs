/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    ASSISTANT_ID: process.env.ASSISTANT_ID,
    ACCESS_CODE: process.env.ACCESS_CODE,
    INSTANCE_BASE_URL: process.env.INSTANCE_BASE_URL,
    INSTANCE_CERTIFICATE: process.env.INSTANCE_CERTIFICATE,
    MIXPANEL_TOKEN: process.env.MIXPANEL_TOKEN,
    LEONARDO_TOKEN: process.env.LEONARDO_TOKEN,
    USE_LEONARDO_API_FOR_VIDEOS: process.env.USE_LEONARDO_API_FOR_VIDEOS,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
        port: '',
      },
    ],
  },
};

export default nextConfig;
