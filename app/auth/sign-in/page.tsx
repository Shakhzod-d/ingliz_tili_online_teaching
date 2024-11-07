'use client';

import { useRouter } from 'next/navigation';
import { useRef, useState, useEffect } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../../utils/firebase'; // Adjust the path based on your project structure
import Link from 'next/link';

export default function SignIn() {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [isClient, setIsClient] = useState(false);
  const emailRef = useRef<HTMLInputElement | any>(null);
  const passwordRef = useRef<HTMLInputElement | any>(null);

  useEffect(() => {
    setIsClient(true); // this ensures window is defined
  }, []);

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

      // Assume that you have user roles stored in Firestore or in a custom claim
      const role = await fetchUserRole(user.uid);

      localStorage.setItem('role', role);
      localStorage.setItem('studentId', user.uid);

      // Save the authToken (you may also use Firebase session management instead)
      document.cookie = `authToken=${await user.getIdToken()}; path=/;`;
      document.cookie = `userRole=${role}; path=/;`;

      alert('Login successful');

      if (role === 'teacher') {
        router.push(`/dashboard/teacher/${user.uid}`);
      } else if (role === 'student') {
        router.push(`/dashboard/student/${user.uid}`);
      } else {
        alert("Role aniqlab bo'lmadi!!!");
      }
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch user role from Firestore (you may replace this with your database structure)
  const fetchUserRole = async (userId: string) => {
    // Implement your method to fetch the user role here (e.g., from Firestore)
    return 'student'; // or 'teacher' based on your data structure
  };

  if (!isClient) return null; // Do not render anything during SSR

  return (
    <form onSubmit={fetchData}>
      <input type="email" placeholder="Enter your email" required ref={emailRef} />
      <input type="password" placeholder="Enter your password" required ref={passwordRef} />
      <button disabled={loading}>Login</button>
      <Link href={'/auth/sign-up'}>Register</Link>
    </form>
  );
}
