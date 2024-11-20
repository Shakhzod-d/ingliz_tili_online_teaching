'use client';

import Button from '@/components/ui/logout-btn';
import Link from 'next/link';
import { useParams } from 'next/navigation';

// app/dashboard/layout.tsx
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { id: studentId } = useParams();
  return (
    <main className="main">
      <aside className="aside">
        <h2>LOGO</h2>
        <ul>
          <li>
            <Link href={`/dashboard/student/${studentId}`}>Dashboard</Link>
          </li>
          <li>
            <Link href={`/dashboard/student/${studentId}/book-order`}>Teachers</Link>
          </li>
          <li>
            <Link href={`/dashboard/student/${studentId}/lessons/future`}>Future lessons</Link>
          </li>
          <li>
            <Link href={`/dashboard/student/${studentId}/lessons/past`}>Past lessons</Link>
          </li>
        </ul>
      </aside>
      <div>
        <nav className="navbar flex items-center mb-10">
          {/* <Navbar /> */}
          <h2>Your Profile</h2>
          <li></li>
          <Button />
        </nav>
        {children}
      </div>
    </main>
  );
}
