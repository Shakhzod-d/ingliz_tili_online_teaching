'use client';

import { useParams } from 'next/navigation';
import { Key, ReactNode, useEffect, useState } from 'react';
import { db } from '../../../../utils/firebase'; // Firebase konfiguratsiyangizni import qiling
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { messaging } from '../../../../utils/firebase'; // Firebase Messaging konfiguratsiyangizni import qiling
import Link from 'next/link';
import { getToken } from 'firebase/messaging';

export default function StudentDashboard() {
  const { id } = useParams(); // Bu 'id' foydalanuvchining IDsi

  const [data, setData] = useState<any>([]); // Foydalanuvchi va buyurtmalar ma'lumotlarini saqlash uchun
  const [fcmToken, setFcmToken] = useState<string | null>(null); // FCM token uchun state

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

  // Brauzer bildirishnomalari uchun ruxsat olish va FCM token olish
  const requestPermission = async () => {
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        const token = await getToken(messaging, {
          vapidKey:
            'BF1o1YRMXgOjaJXcSoYTuGpZ52E0mff7VzQKihZYFRT_KbHwQrHwMan4GAvzwuo2I6-IROlmBAm2WXIHkqyOTrQ',
        });
        console.log('FCM Token:', token);
        setFcmToken(token); // Tokenni state ga o'rnatish
        if (id) {
          saveTokenToDatabase(id, token); // Tokenni Firestore'ga saqlash
        }
      } else {
        console.error('Ruxsat berilmadi');
      }
    } catch (error) {
      console.error('Ruxsat olishda xatolik yoki tokenni olishda muammo:', error);
    }
  };

  // FCM tokenni Firestore'ga saqlash
  const saveTokenToDatabase = async (userId: any, token: string) => {
    try {
      await setDoc(doc(db, 'users', userId), { fcmToken: token }, { merge: true });
      console.log('Token muvaffaqiyatli saqlandi');
    } catch (error) {
      console.error('Tokenni saqlashda xatolik:', error);
    }
  };

  // FCM token olish funksiyasini komponent yuklanganda chaqirish
  useEffect(() => {
    requestPermission();
  }, []);

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
