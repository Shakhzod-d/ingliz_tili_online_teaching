'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  console.log(window.location.href.includes('dashboard'));

  useEffect(() => {
    // Check for token in cookies to determine if the user is logged in
    console.log(document.cookie);

    setIsLoggedIn(
      document.cookie.includes('authToken=') || window.location.href.includes('dashboard'),
    );
  }, [window.location.href]);

  const handleLogout = async () => {
    try {
      setIsLoggedIn(false);
      localStorage.removeItem('role');
      localStorage.removeItem('studentId');
      const response = await fetch('/api/logout', { method: 'GET' });
      if (response.ok) {
        setIsLoggedIn(false);
        router.refresh(); // Refresh the page to update the UI
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
      <Link href={'/'}>Home</Link>

      {!isLoggedIn || window.location.href.toString().includes('dashboard') ? (
        <>
          <Link href={'/auth/sign-in'}>Login</Link>
          <Link href={'/auth/sign-up'}>Register</Link>
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
