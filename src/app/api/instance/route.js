import { NextResponse } from 'next/server';
const https = require('https');
import fetch from 'node-fetch';

const agent = new https.Agent({
  ca: process.env.INSTANCE_CERTIFICATE,
  rejectUnauthorized: false,
});

export async function POST(request) {
  const { url, method, body, headers } = await request.json();
  console.log('Sending request to: ', url);

  try {
    const response = await fetch(url, {
      method,
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      agent,
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
