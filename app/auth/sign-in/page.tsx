'use client';

import { useRouter } from 'next/navigation';
import { useRef, useState, useEffect } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, firestore } from '../../../utils/firebase'; // Adjust the path based on your project structure
import Link from 'next/link';
import { doc, getDoc } from 'firebase/firestore';
import { toast } from 'react-toastify';
import Navbar from '@/components/shared/navbar';

export default function SignIn() {
  if (typeof window === 'undefined') {
    // Safe to use window here
    return '';
  }
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const emailRef = useRef<HTMLInputElement | any>(null);
  const passwordRef = useRef<HTMLInputElement | any>(null);

  const fetchData = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        emailRef.current.value,
        passwordRef.current.value,
      );
      const user = userCredential.user;

      // User role ni Firestore yoki boshqa manbadan olamiz
      const role = await fetchUserRole(user.uid);

      if (typeof window !== 'undefined') {
        // Client tomonida `window` mavjudligini tekshirish
        window.localStorage.setItem('role', role);
        window.localStorage.setItem('studentId', user.uid);

        // authToken va userRole cookielarini saqlash
        document.cookie = `authToken=${await user.getIdToken()}; path=/;`;
        document.cookie = `userRole=${role}; path=/;`;

        toast.success('Login successful');
      }

      console.log(role);

      if (role === 'teacher') {
        router.push(`/dashboard/teacher/${user.uid}`);
      } else if (role === 'student') {
        router.push(`/dashboard/student/${user.uid}`);
      } else {
        toast.error("Role aniqlab bo'lmadi!!!");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Firestore dan user role ni olish
  const fetchUserRole = async (userId: string) => {
    try {
      const docRef = doc(firestore, 'users', userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        return data.role || 'student'; // 'role' mavjud bo'lmasa, 'student' ni qaytaradi
      }
    } catch (error) {
      console.error('Role olishda xato:', error);
    }
    return 'student'; // xato bo'lsa, 'student' rolini qaytaradi
  };

  return (
    <>
      <Navbar />
      <form onSubmit={fetchData}>
        <input type="email" placeholder="Enter your email" required ref={emailRef} />
        <input type="password" placeholder="Enter your password" required ref={passwordRef} />
        <button disabled={loading}>Login</button>
        <Link href={'/auth/sign-up'}>Register</Link>
      </form>
    </>
  );
}
