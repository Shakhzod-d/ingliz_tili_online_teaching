import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Cookie borligini tekshirish
  const token = request.cookies.get('authToken')?.value;

  // Agar token yo'q bo'lsa va foydalanuvchi boshqa sahifaga kirmoqchi bo'lsa, yo'naltirish
  if (!token) {
    const loginUrl = new URL('/auth/sign-in', request.url);
    if (request.nextUrl.pathname !== '/auth/sign-in') {
      return NextResponse.redirect(loginUrl);
    }
  }

  // Agar foydalanuvchi "/sign-in" sahifasida bo'lsa va token mavjud bo'lsa, uni boshqa sahifaga yo'naltirish
  if (token && request.nextUrl.pathname === '/auth/sign-in') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// Middleware faqat "/dashboard" va "/teacher" sahifalari uchun amal qiladi
export const config = {
  matcher: ['/dashboard/:path*', '/teacher/:path*'],
};
