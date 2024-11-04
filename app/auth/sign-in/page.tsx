'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useRef, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';

export default function () {
  const router = useRouter();
  // const searchParams = useSearchParams();
  // const redirectUrl = searchParams.get('redirect') || '/';

  const [loading, setLoading] = useState<boolean>(false);
  const emailRef = useRef<HTMLInputElement | any>(null);
  const passwordRef = useRef<HTMLInputElement | any>(null);

  const fetchData = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const data = {
      email: emailRef.current.value,
      password: passwordRef.current.value,
    };

    try {
      const req = await axios.post('https://48b745c40cead56f.mokky.dev/auth', data);
      localStorage.setItem('role', req.data.data.role);
      document.cookie = `authToken=${req.data.data.token}; path=/;`;
      alert('Login successful');

      if (req.data.data.role == 'teacher') {
        router.push('/dashboard/teacher/' + req.data.data.id);
      } else if (req.data.data.role == 'teacher') {
        router.push('/dashboard/teacher/' + req.data.data.id);
      } else {
        alert("role aniqlab bo'lmadi!!!");
      }

      // router.push(redirectUrl); // Kirgandan so'ng foydalanuvchini oldingi sahifaga qaytarish
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={fetchData}>
      <input type="email" placeholder="Enter your email" required ref={emailRef} />
      <input type="password" placeholder="Enter your password" required ref={passwordRef} />
      <button disabled={loading}>Login</button>
      <Link href={'/auth/sign-up'}>Register</Link>
    </form>
  );
}
