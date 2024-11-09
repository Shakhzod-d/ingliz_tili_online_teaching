'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<any>(false || localStorage.getItem('role')?.length);
  const router = useRouter();

  useEffect(() => {
    // Check if authToken exists in cookies to determine login status
    const isUserLoggedIn = document.cookie.includes('authToken=');
    setIsLoggedIn(isUserLoggedIn);
  }, []);

  const handleLogout = async () => {
    try {
      // Clear login state and remove stored values
      localStorage.removeItem('role');
      localStorage.removeItem('studentId');
      const response = await fetch('/api/logout', { method: 'GET' });
      if (response.ok) {
        setIsLoggedIn(false);
        router.refresh();
      } else {
        console.error('Failed to log out');
      }
    } catch (error) {
      console.error('Error logging out:', error);
    }
    router.push('/auth/sign-in');
  };

  return (
    <nav>
      <Link href="/">Home</Link>

      {!isLoggedIn ? (
        <>
          <Link href="/auth/sign-in">Login</Link>
          <Link href="/auth/sign-up">Register</Link>
        </>
      ) : (
        <>
          <Link
            href={`/dashboard/${localStorage.getItem('role')}/${localStorage.getItem('studentId')}`}
          >
            Dashboard
          </Link>
          <button onClick={handleLogout}>Log Out</button>
        </>
      )}
    </nav>
  );
};

export default Navbar;
