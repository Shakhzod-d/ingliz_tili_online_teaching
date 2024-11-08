'use client';

import { db } from '@/utils/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { useParams } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function NotificationsComponent() {
  const [data, setData] = useState<any>({});
  const { id } = useParams();
  const notificationSound = new Audio('/libs/tone.mp3');
  const prevNotificationsRef = useRef<any[]>([]);

  useEffect(() => {
    if (typeof id === 'string') {
      const docRef = doc(db, 'users', id);

      const unsubscribe = onSnapshot(docRef, (snapshot) => {
        if (snapshot.exists()) {
          const userData = snapshot.data();
          setData(userData);

          const newNotifications = userData.notifications || [];
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
        }
      });

      return () => unsubscribe();
    }
  }, [id]);

  // Barcha notifications ni ko'rsatish
  const notifications = data.notifications || [];

  return (
    <div>
      <h2>Notifications</h2>
      <ul>
        {notifications.map((notification: any, index: number) => (
          <li key={index}>
            <p>Lesson ID: {notification.lessonId}</p>
            <p>Status: {notification.status}</p>
            <p>Message: {notification.message}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
