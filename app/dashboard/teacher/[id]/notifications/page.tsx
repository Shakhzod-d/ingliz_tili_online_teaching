'use client';

import { db } from '@/utils/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function () {
  const [data, setData] = useState<any>([]);

  const { id } = useParams();

  useEffect(() => {
    if (typeof id === 'string') {
      const docRef = doc(db, 'users', id);

      // Real vaqt kuzatuv funksiyasi
      const unsubscribe = onSnapshot(docRef, (snapshot) => {
        if (snapshot.exists()) {
          setData(snapshot.data() as typeof data);
        }
      });

      // Tozlash funksiyasi
      return () => unsubscribe();
    }
  }, [id]);
  return (
    <div>
      <h2>Notifications</h2>
    </div>
  );
}
