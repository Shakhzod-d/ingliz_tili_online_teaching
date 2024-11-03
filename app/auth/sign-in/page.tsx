'use client';

import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';

export default function LoginForm() {
  const [loading, setLoading] = useState<boolean>(false);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const router = useRouter();

  const fetchData = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Agar `emailRef` yoki `passwordRef` null bo'lsa, qaytish
    if (!emailRef.current || !passwordRef.current) return;

    // data
    const data = {
      email: emailRef.current.value,
      password: passwordRef.current.value,
    };

    try {
      // API orqali ma'lumotlarni olish
      const response = await axios.post('https://48b745c40cead56f.mokky.dev/auth', data);
      const role = response.data.data.role;
      const userId = response.data.data.id;

      // Role ni localStorage ichiga saqlash
      localStorage.setItem('role', role);

      // Rolga qarab yo'naltirish
      if (role === 'teacher') {
        router.push(`/dashboard/teacher/${userId}`);
      } else if (role === 'student') {
        router.push(`/dashboard/student/${userId}`);
      } else {
        alert('Role not recognized');
      }

      alert('Success');
    } catch (error) {
      console.error(error);
      alert((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={fetchData}>
      <input type="email" placeholder="Enter your email" required ref={emailRef} />
      <input type="password" placeholder="Enter your password" required ref={passwordRef} />
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
      <Link href="/auth/sign-up">Register</Link>
    </form>
  );
}
