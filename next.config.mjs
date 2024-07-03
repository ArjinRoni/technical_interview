/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    ASSISTANT_ID: process.env.ASSISTANT_ID,
    ACCESS_CODE: process.env.ACCESS_CODE,
    INSTANCE_BASE_URL: process.env.INSTANCE_BASE_URL,
    MIXPANEL_TOKEN: process.env.MIXPANEL_TOKEN,
    LEONARDO_TOKEN: process.env.LEONARDO_TOKEN,
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
