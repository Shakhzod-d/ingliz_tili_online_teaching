'use client';

import axios from 'axios';
import Link from 'next/link';
import { useState, useRef } from 'react';

export default function RegisterForm() {
  const [loading, setLoading] = useState<boolean>(false);
  const [role, setRole] = useState<string>('');
  const passwordRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  const sendData = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    let data = {};

    if (role == 'teacher') {
      data = {
        name: nameRef.current?.value,
        email: emailRef.current?.value,
        password: passwordRef.current?.value,
        role: role,
        rates: 0,
        price: 0,
        lessons: [],
        comments: [],
        avaibleDays: [],
        isActive: false,
      };
    } else if (role == 'student') {
      data = {
        name: nameRef.current?.value,
        email: emailRef.current?.value,
        password: passwordRef.current?.value,
        role: role,
      };
    }

    try {
      await axios.post('https://48b745c40cead56f.mokky.dev/register', data);
      alert('Success');
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={sendData}>
      <input type="text" placeholder="Enter your full name" required ref={nameRef} />
      <input type="email" placeholder="Enter your email" required ref={emailRef} />
      <input type="password" placeholder="Enter your password" required ref={passwordRef} />

      <p>Who you are?</p>
      <label>
        <input
          type="radio"
          name="role"
          value="student"
          required
          onChange={() => setRole('student')}
        />
        <span>Student</span>
      </label>
      <label>
        <input
          type="radio"
          name="role"
          value="teacher"
          required
          onChange={() => setRole('teacher')}
        />
        <span>Teacher</span>
      </label>

      <button disabled={loading}>Register</button>
      <Link href="/auth/sign-in">Login</Link>
    </form>
  );
}
