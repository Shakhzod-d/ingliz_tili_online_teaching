'use client';

import { db } from '@/utils/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function () {
  const { status, id } = useParams();
  const [data, setData] = useState<any>([]); // Foydalanuvchi va buyurtmalar ma'lumotlarini saqlash uchun

  // Firestore'dan foydalanuvchi ma'lumotlarini olish
  useEffect(() => {
    if (!id) return;

    if (typeof id === 'string') {
      // Firestore'da foydalanuvchini kuzatish
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
  return (
    <div>
      <h2>Hello, {status}</h2>

      {status == 'past' ? (
        <div className="cards">
          {data.orders?.map((item: any) => (
            <div key={item.lessonId} className="card">
              <p>
                Order ID: <b>{item.roomId}</b>
              </p>
              {item.isAccepted === 'accepted' ? (
                <p>Order accepted! </p>
              ) : // <Link href={`/rooms/${item.roomId}`} target="_blank">
              //   Go to lesson room
              // </Link>
              item.isAccepted === 'canceled' ? (
                <p>Order rad etildi!</p>
              ) : (
                <p>Order xali accept qilinmadi</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="cards">
          {data.orders
            ?.filter((item: { isAccepted: string }) => item.isAccepted === 'accepted')
            .map((item: any) => (
              <div key={item.lessonId} className="card">
                <p>
                  Order ID: <b>{item.roomId}</b>
                </p>{' '}
                <Link href={`/rooms/${item.roomId}`} target="_blank">
                  Go to lesson room
                </Link>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
