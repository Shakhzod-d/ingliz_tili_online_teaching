import { NextResponse } from 'next/server';

// Firebase Cloud Functions endpoint
const FIREBASE_API_KEY_URL = 'https://your-project-id.cloudfunctions.net/getApiKey';

export async function GET() {
  try {
    // Firebase Function orqali API_KEY ni chaqiramiz
    const response = await fetch(FIREBASE_API_KEY_URL);
    if (!response.ok) {
      throw new Error('Failed to fetch API_KEY from Firebase');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching API key:', error);
    return NextResponse.json({ error: 'Failed to fetch API key' }, { status: 500 });
  }
}
