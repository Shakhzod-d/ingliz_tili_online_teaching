'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Button from '../ui/logout-btn';

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<any>(false);
  const router = useRouter();

  useEffect(() => {
    // Check if authToken exists in cookies to determine login status
    const isUserLoggedIn = document.cookie.includes('authToken=');

    setIsLoggedIn(isUserLoggedIn || localStorage.getItem('role')?.length);
  }, []);

  // const handleLogout = async () => {
  //   try {
  //     // Clear login state and remove stored values
  //     localStorage.removeItem('role');
  //     localStorage.removeItem('studentId');
  //     const response = await fetch('/api/logout', { method: 'GET' });
  //     if (response.ok) {
  //       setIsLoggedIn(false);
  //       router.refresh();
  //     } else {
  //       console.error('Failed to log out');
  //     }
  //   } catch (error) {
  //     console.error('Error logging out:', error);
  //   }
  //   router.push('/auth/sign-in');
  // };

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
            href={`/dashboard/${window.localStorage.getItem('role')}/${window.localStorage.getItem(
              'studentId',
            )}`}
          >
            Dashboard
          </Link>
          <Button />
        </>
      )}
    </nav>
  );
};

export default Navbar;
