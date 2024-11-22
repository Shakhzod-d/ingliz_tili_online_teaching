import { randomString } from '@/lib/client-utils';
import { ConnectionDetails } from '@/lib/types';
import { db } from '@/utils/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { AccessToken, AccessTokenOptions, VideoGrant } from 'livekit-server-sdk';
import { NextRequest, NextResponse } from 'next/server';

let API_KEY = '';
let API_SECRET = '';
let LIVEKIT_URL = '';

export async function GET(request: NextRequest) {
  try {
    const currentCollection = collection(db, 'current');
    const snapshot = await getDocs(currentCollection);

    if (!snapshot.empty) {
      const currentData = snapshot.docs[0].data();
      API_KEY = currentData.a;
      API_SECRET = currentData.b;
      LIVEKIT_URL = currentData.c;
    } else {
      throw new Error('No documents found in the "current" collection.');
    }
  } catch (error) {}
  try {
    // Parse query parameters
    const roomName = request.nextUrl.searchParams.get('roomName');
    const participantName = request.nextUrl.searchParams.get('participantName');
    const metadata = request.nextUrl.searchParams.get('metadata') ?? '';
    const region = request.nextUrl.searchParams.get('region');
    const livekitServerUrl = LIVEKIT_URL || 'wss://start-up-zdpsxu9p.livekit.cloud';
    if (livekitServerUrl === undefined) {
      throw new Error('Invalid region');
    }

    if (typeof roomName !== 'string') {
      return new NextResponse('Missing required query parameter: roomName', { status: 400 });
    }
    if (participantName === null) {
      return new NextResponse('Missing required query parameter: participantName', { status: 400 });
    }

    // Generate participant token
    const participantToken = await createParticipantToken(
      {
        identity: `${participantName}__${randomString(4)}`,
        name: participantName,
        metadata,
      },
      roomName,
    );

    // Return connection details
    const data: ConnectionDetails = {
      serverUrl: livekitServerUrl,
      roomName: roomName,
      participantToken: participantToken,
      participantName: participantName,
    };
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof Error) {
      return new NextResponse(error.message, { status: 500 });
    }
  }
}

function createParticipantToken(userInfo: AccessTokenOptions, roomName: string) {
  const at = new AccessToken(API_KEY, API_SECRET, userInfo);
  at.ttl = '5m';
  const grant: VideoGrant = {
    room: roomName,
    roomJoin: true,
    canPublish: true,
    canPublishData: true,
    canSubscribe: true,
  };
  at.addGrant(grant);
  return at.toJwt();
}

/**
 * Get the LiveKit server URL for the given region.
 */
function getLiveKitURL(region: string | null): string {
  let targetKey = 'LIVEKIT_URL';
  if (region) {
    targetKey = `LIVEKIT_URL_${region}`.toUpperCase();
  }
  const url = process.env[targetKey];
  if (!url) {
    throw new Error(`${targetKey} is not defined`);
  }
  return url;
}
