'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { auth, db } from '../../../utils/firebase'; // Adjust the path as needed
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

export default function Register() {
  const [loading, setLoading] = useState<boolean>(false);
  const [role, setRole] = useState<string>('');
  const passwordRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  const router = useRouter();

  const sendData = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Register user with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        emailRef.current?.value as string,
        passwordRef.current?.value as string,
      );
      const user = userCredential.user;

      // Prepare user data based on role
      const userData = {
        name: nameRef.current?.value,
        email: emailRef.current?.value,
        role: role,
        id: user.uid,
        ...(role === 'teacher'
          ? { rates: 0, price: 0, lessons: [], comments: [], availableDays: [], isActive: false }
          : {}),
      };

      // Save additional user information in Firestore
      await setDoc(doc(db, 'users', user.uid), userData);

      alert('Registration successful');
      router.push('/auth/sign-in');
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
      <div className="select-role">
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
      </div>

      <button disabled={loading}>Register</button>
      <Link href="/auth/sign-in">Login</Link>
    </form>
  );
}
