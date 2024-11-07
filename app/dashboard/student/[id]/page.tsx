'use client';

import { useParams } from 'next/navigation';
import { Key, ReactNode, useEffect, useState } from 'react';
import { db } from '../../../../utils/firebase'; // Firebase konfiguratsiyangizni import qiling
import { doc, onSnapshot } from 'firebase/firestore';
import Link from 'next/link';

export default function StudentDashboard() {
  const { id } = useParams();

  const [data, setData] = useState<any>([]);

  useEffect(() => {
    if (!id) return;

    if (typeof id === 'string') {
      // Firestore'ga murojaat qilib, foydalanuvchi ma'lumotlarini olish
      const userRef = doc(db, 'users', id);
      const unsubscribe = onSnapshot(userRef, (snapshot) => {
        if (snapshot.exists()) {
          setData(snapshot.data());
        } else {
          console.error('Foydalanuvchi topilmadi');
        }
      });

      // Komponent unmounted bo'lganda unsubsribe qilish
      return () => unsubscribe();
    }
  }, [id]);

  console.log(data);

  return (
    <div>
      <h1>Student Dashboard</h1>

      <p>
        Your name: <b>{data.name}</b>
      </p>

      <div className="cards">
        {data.orders?.map(
          (item: { isAccepted: string; roomId: ReactNode; lessonId: Key | null | undefined }) => (
            <div key={item.lessonId} className="card">
              <p>
                Order ID: <b>{item.roomId}</b>
              </p>
              {item.isAccepted === 'accepted' ? (
                <Link href={`/rooms/${item.roomId}`} target="_blank">
                  Go to lesson room
                </Link>
              ) : item.isAccepted === 'canceled' ? (
                <p>Order rad etildi!</p>
              ) : (
                <p>Order xali accept qilinmadi</p>
              )}
            </div>
          ),
        )}
      </div>
    </div>
  );
}
