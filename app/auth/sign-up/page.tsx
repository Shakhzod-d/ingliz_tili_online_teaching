'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useRef } from 'react';
import { auth, db } from '../../../utils/firebase'; // Adjust the path as needed
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
// import router from 'next/router';
import { toast } from 'react-toastify';
import Navbar from '@/components/shared/navbar';

export default function Register() {
  const [loading, setLoading] = useState<boolean>(false);
  const [role, setRole] = useState<string>('student');
  const passwordRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  const router = useRouter();

  const sendData = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Firebase orqali yangi foydalanuvchi ro'yxatdan o'tkazish
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        emailRef.current?.value as string,
        passwordRef.current?.value as string,
      );
      const user = userCredential.user;

      // Foydalanuvchi ma'lumotlarini tayyorlash
      const userData = {
        name: nameRef.current?.value,
        email: emailRef.current?.value,
        role: role,
        id: user.uid,
        ...(role === 'teacher'
          ? { rates: 0, price: 0, lessons: [], comments: [], availableDays: [], isActive: false }
          : {}),
      };

      // Foydalanuvchi ma'lumotlarini Firestore ga saqlash
      await setDoc(doc(db, 'users', user.uid), userData);

      toast.success('Registration successful');
      router.push('/auth/sign-in');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <form onSubmit={sendData}>
        <input type="text" placeholder="Enter your full name" required ref={nameRef} />
        <input type="email" placeholder="Enter your email" required ref={emailRef} />
        <input type="password" placeholder="Enter your password" required ref={passwordRef} />

        <p>Who are you?</p>
        <div className="select-role">
          <label>
            <input
              type="radio"
              name="role"
              value="student"
              checked={role === 'student'}
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
              checked={role === 'teacher'}
              required
              onChange={() => setRole('teacher')}
            />
            <span>Teacher</span>
          </label>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Registering...' : 'Register'}
        </button>
        <Link href="/auth/sign-in">Login</Link>
      </form>
    </>
  );
}
