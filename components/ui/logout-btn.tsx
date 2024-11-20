'use client';

import { useRouter } from 'next/navigation';

export default function Button() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      // Clear login state and remove stored values
      localStorage.removeItem('role');
      localStorage.removeItem('studentId');
      const response = await fetch('/api/logout', { method: 'GET' });
      if (response.ok) {
        router.refresh();
      } else {
        console.error('Failed to log out');
      }
    } catch (error) {
      console.error('Error logging out:', error);
    }
    router.push('/auth/sign-in');
  };
  return <button onClick={handleLogout}>Log Out</button>;
}
