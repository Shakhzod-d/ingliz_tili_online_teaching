// app/api/sendNotification/route.ts

import { NextResponse } from 'next/server';
import { JWT } from 'google-auth-library';
import path from 'path';
import fs from 'fs';

export async function POST(req: Request) {
  const notificationPayload = await req.json();

  try {
    const keyPath = path.join(process.cwd(), '/public/service-account.json');

    console.log(keyPath);

    const serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));

    const client = new JWT({
      email: serviceAccount.client_email,
      key: serviceAccount.private_key,
      scopes: ['https://www.googleapis.com/auth/firebase.messaging'],
    });

    const { access_token: accessToken } = await client.authorize();

    const response = await fetch(
      `https://fcm.googleapis.com/v1/projects/say-it-well/messages:send`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(notificationPayload),
      },
    );

    const data = await response.json();
    return NextResponse.json(data, { status: response.ok ? 200 : response.status });
  } catch (error) {
    console.error('Error sending notification:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
