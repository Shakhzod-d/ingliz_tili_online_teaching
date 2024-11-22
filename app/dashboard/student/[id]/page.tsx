'use client';

import { useParams } from 'next/navigation';
import { Key, ReactNode, useEffect, useState } from 'react';
import { db } from '../../../../utils/firebase'; // Firebase konfiguratsiyangizni import qiling
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { messaging } from '../../../../utils/firebase'; // Firebase Messaging konfiguratsiyangizni import qiling
import Link from 'next/link';
import { getToken } from 'firebase/messaging';
import Navbar from '@/components/shared/navbar';
import { Timestamp } from 'firebase/firestore'; // Import for Firebase Timestamp
import Button from '@/components/ui/logout-btn';

export default function StudentDashboard({ children }: { children: React.ReactNode }) {
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

  // Helper function to compare times
  const isLessonActiveOrApproaching = (lessonTime: any) => {
    console.log('lessontime', lessonTime);

    const currentTime = new Date();
    const lessonStartTime = new Date(lessonTime.seconds * 1000);
    const timeDifference = lessonStartTime.getTime() - currentTime.getTime();

    console.log(currentTime, lessonStartTime, timeDifference);

    return {
      isActive: timeDifference <= 0, // Active if it's the same minute
      isApproaching: timeDifference > 0 && timeDifference <= 1800000, // Approaching within 30 mins
    };
  };

  useEffect(() => {
    // Iterate over lessons to determine active or approaching lessons
    data.orders?.forEach((lesson: { time: string; lessonId: string; roomId: string }) => {
      const { isActive, isApproaching } = isLessonActiveOrApproaching(lesson.time);

      if (isActive) {
        // Show in Active Lessons UI
        setActiveLessons((prev: any) => [...prev, lesson]);
      }
    });
  }, [data.orders, fcmToken]);

  // State to store active lessons
  const [activeLessons, setActiveLessons] = useState<any>([]);

  // FCM token olish funksiyasini komponent yuklanganda chaqirish
  useEffect(() => {
    requestPermission();
  }, []);

  console.log(data);

  return (
    <>
      <div className="lessons">
        <h1>Student Dashboard</h1>
        <p>
          Your name: <b>{data.name}</b>
        </p>
        ){/* Active Lessons Section */}
        {activeLessons.length > 0 && (
          <div className="active-lessons">
            <h2>Active Lessons</h2>
            {activeLessons.map((lesson: any) => (
              <div key={lesson.lessonId}>
                <Link href={`/rooms/${lesson.roomId}`} target="_blank">
                  Join Lesson
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
