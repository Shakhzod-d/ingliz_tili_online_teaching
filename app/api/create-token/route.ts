import { NextRequest, NextResponse } from 'next/server';
import { AccessToken, VideoGrant } from 'livekit-server-sdk';

const API_SECRET = process.env.LIVEKIT_API_SECRET;

export async function POST(req: NextRequest) {
  try {
    const { roomName, participantName } = await req.json();
    if (!roomName || !participantName) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    // Firebase orqali API_KEY ni olish
    const response = await fetch('https://your-project-id.cloudfunctions.net/getApiKey');
    if (!response.ok) {
      throw new Error('Failed to fetch API_KEY');
    }
    const { apiKey } = await response.json();

    // Token yaratish
    const at = new AccessToken(apiKey, API_SECRET, {
      identity: participantName,
      name: participantName,
    });
    at.ttl = '5m';
    const grant: VideoGrant = {
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
    };
    at.addGrant(grant);

    return NextResponse.json({ token: at.toJwt() });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create token' }, { status: 500 });
  }
}
