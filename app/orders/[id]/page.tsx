'use client';

import { useParams } from 'next/navigation';

export default function () {
  const { id } = useParams();

  return (
    <div>
      <h1>Orders</h1>
    </div>
  );
}