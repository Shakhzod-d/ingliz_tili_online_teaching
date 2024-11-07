import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Cookie borligini tekshirish
  // const token = request.cookies.get('authToken')?.value;
  // const role = request.cookies.get('userRole')?.value; // Roleni cookie'dan olish
  // const authRoutes = ['/auth/sign-in', '/auth/sign-up', '/']; // Login qilinmagan foydalanuvchi uchun ruxsat etilgan routelar
  // const isAuthRoute = authRoutes.includes(request.nextUrl.pathname);
  // // Agar token yo'q bo'lsa, foydalanuvchi faqat /auth/sign-in, /auth/sign-up va / sahifalariga kirishi mumkin
  // if (!token && !isAuthRoute) {
  //   return NextResponse.redirect(new URL('/auth/sign-in', request.url));
  // }
  // // Agar foydalanuvchi "/auth/sign-in" sahifasida bo'lsa va token mavjud bo'lsa, uni boshqa sahifaga yo'naltirish
  // if (token && request.nextUrl.pathname === '/auth/sign-in') {
  //   return NextResponse.redirect(new URL('/', request.url));
  // }
  // // Login qilingandan so'ng roli asosida sahifalarga kirish imkoniyatini nazorat qilish
  // if (token) {
  //   if (role === 'teacher' && request.nextUrl.pathname.startsWith('/dashboard/student')) {
  //     // Teacher bo'lsa, student dashboard'iga kira olmaydi
  //     return NextResponse.redirect(new URL('/', request.url));
  //   } else if (role === 'student' && request.nextUrl.pathname.startsWith('/dashboard/teacher')) {
  //     // Student bo'lsa, teacher dashboard'iga kira olmaydi
  //     return NextResponse.redirect(new URL('/', request.url));
  //   }
  // }
  // return NextResponse.next();
}

// Middleware faqat kerakli sahifalar uchun amal qiladi
export const config = {};
