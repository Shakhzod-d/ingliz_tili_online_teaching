'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check for token in cookies to determine if the user is logged in
    setIsLoggedIn(document.cookie.includes('token='));
  }, []);

  const handleLogout = async () => {
    try {
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
  };

  return (
    <nav>
      <Link href={'/'}>Home</Link>

      {!isLoggedIn ? (
        <>
          <Link href={'/auth/sign-in'}>Login</Link>
          <Link href={'/auth/sign-up'}>Register</Link>
        </>
      ) : (
        <button onClick={handleLogout}>Log Out</button>
      )}
    </nav>
  );
};

export default Navbar;
