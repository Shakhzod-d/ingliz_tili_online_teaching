import { NextResponse } from 'next/server';
import { JWT } from 'google-auth-library';
import path from 'path';
import fs from 'fs';

export async function POST(req: Request) {
  try {
    // JSON payloadni olish
    const notificationPayload = await req.json();

    // Service account fayliga yo'lni aniqlash
    const keyPath = path.join(process.cwd(), './service-account.json');

    // Fayl bor-yo'qligini tekshirish
    if (!fs.existsSync(keyPath)) {
      console.error('Service account file not found');
      return NextResponse.json({ error: 'Service account file not found' }, { status: 500 });
    }

    // Service account JSON ma'lumotlarini o'qish
    const serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));

    // JWT mijozini yaratish
    const client = new JWT({
      email: serviceAccount.client_email,
      key: serviceAccount.private_key.replace(/\\n/g, '\n'), // Private keydagi qator belgilari
      scopes: ['https://www.googleapis.com/auth/firebase.messaging'],
    });

    // Access token olish
    const { access_token: accessToken } = await client.authorize();

    // FCM API'ga so'rov yuborish
    const response = await fetch(
      `https://fcm.googleapis.com/v1/projects/say-it-well/messages:send`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`, // Token qo'shiladi
        },
        body: JSON.stringify(notificationPayload), // Payloadni JSON formatga o'girish
      },
    );

    // Javobni qayta ishlash
    const data = await response.json();
    if (!response.ok) {
      console.error('FCM API error:', data);
      return NextResponse.json(
        { error: 'FCM API Error', details: data },
        { status: response.status },
      );
    }

    // Muvaffaqiyatli javob
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    // Xatoliklarni qayta ishlash
    console.error('Error sending notification:', error.message || error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: error.message || 'Unknown error' },
      { status: 500 },
    );
  }
}
