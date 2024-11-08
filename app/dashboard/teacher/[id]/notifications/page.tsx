'use client';

import { db } from '@/utils/firebase';
import { unsubscribe } from 'diagnostics_channel';
import { doc, onSnapshot } from 'firebase/firestore';
import { useParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';

export default function () {
  const [data, setData] = useState<any>([]);
  const notificationSound = new Audio('/libs/tone.mp3');
  const prevNotificationsRef = useRef<any[]>([]);

  const { id } = useParams();

  useEffect(() => {
    if (typeof id === 'string') {
      const docRef = doc(db, 'users', id);

      // Real vaqt kuzatuv funksiyasi
      const unsubscribe = onSnapshot(docRef, (snapshot) => {
        if (snapshot.exists()) {
          setData(snapshot.data() as typeof data);
        }
        const userData = snapshot.data();
        const newNotifications = userData?.notifications || [];
        const prevNotifications = prevNotificationsRef.current;

        // Faqat yangi status o'zgarganda toast chiqarish
        if (newNotifications.length > prevNotifications.length) {
          const latestNotification = newNotifications[newNotifications.length - 1];
          const prevLatestNotification = prevNotifications[prevNotifications.length - 1];

          if (
            !prevLatestNotification ||
            latestNotification.status !== prevLatestNotification.status
          ) {
            toast.info(latestNotification.message, {
              position: 'top-right',
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
            });
            notificationSound.play();
          }
        }

        prevNotificationsRef.current = newNotifications;
        // Tozlash funksiyasi
        return () => unsubscribe();
      });
    }
  }, [id]);

  console.log(data);

  return (
    <div>
      <h2>Notifications</h2>
    </div>
  );
}
