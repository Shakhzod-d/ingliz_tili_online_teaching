// app/api/logout/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Clear the 'token' cookie by setting it with an expired date
    const response = NextResponse.json({ message: 'Logged out successfully' });
    response.cookies.set('authToken', '', { expires: new Date(0) });
    response.cookies.set('userRole', '', { expires: new Date(0) });
    return response;
  } catch (error) {
    console.error('Error logging out:', error);
    return NextResponse.json({ error: 'Failed to log out' }, { status: 500 });
  }
}
