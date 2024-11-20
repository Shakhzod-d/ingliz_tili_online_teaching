'use client';

import axios from 'axios';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { db } from '../../../../utils/firebase'; // Firebase konfiguratsiyasini to'g'ri joylang
import {
  arrayUnion,
  doc,
  getDoc,
  onSnapshot,
  setDoc,
  Timestamp,
  updateDoc,
} from 'firebase/firestore';
import { ToastContainer } from 'react-toastify';
import { messaging } from '../../../../utils/firebase'; // Firebase Messaging konfiguratsiyasi
import { getToken } from 'firebase/messaging';
import Navbar from '@/components/shared/navbar';

export default function ProfileEdit() {
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<any>({});
  const [availableDays, setAvailableDays] = useState<{
    [key: string]: { start: string; end: string }[];
  }>({});
  const [ordersList, setOrdersList] = useState<any[]>([]);
  const { id } = useParams();

  // Foydalanuvchiga notification yuborish
  const sendNotification = async (userId: string, message: string, type: string) => {
    try {
      const userRef = doc(db, 'users', userId);

      const notification = {
        title: 'New Notification',
        body: message,
        timestamp: Timestamp.now(),
        type, // "teacher" yoki "student"
        isRead: false,
      };

      // Notificationni foydalanuvchi hujjatiga qo'shish
      await updateDoc(userRef, {
        notifications: arrayUnion(notification),
      });

      console.log('Notification sent to', userId);
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  // Foydalanuvchi ma'lumotlarini yuklash
  useEffect(() => {
    if (!id) return;
    setLoading(true);

    // Foydalanuvchi hujjatiga real-time listener
    if (typeof id === 'string') {
      const userDocRef = doc(db, 'users', id);
      const unsubscribe = onSnapshot(userDocRef, (docSnapshot) => {
        if (docSnapshot.exists()) {
          const userData = docSnapshot.data();
          setData(userData);
          setAvailableDays(userData.availableDays || {});
          setOrdersList(userData.lessons || []);
        }
        setLoading(false);
      });

      // Komponent unmounted bo'lganda listenerni to'xtatish
      return () => unsubscribe();
    }
  }, [id]);

  // Hafta kunlari
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Vaqt diapazonlarini boshqarish
  const handleTimeRangeChange = (
    day: string,
    index: number,
    type: 'start' | 'end',
    value: string,
  ) => {
    setAvailableDays((prev) => {
      const dayTimes = prev[day] || [];
      const updatedTimes = [...dayTimes];
      updatedTimes[index] = { ...updatedTimes[index], [type]: value };
      return { ...prev, [day]: updatedTimes };
    });
  };

  const requestPermissionAndSaveToken = async (userId: any) => {
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        console.log('Notificationga ruxsat berildi');

        // FCM tokenini olish
        const token = await getToken(messaging, {
          vapidKey:
            'BF1o1YRMXgOjaJXcSoYTuGpZ52E0mff7VzQKihZYFRT_KbHwQrHwMan4GAvzwuo2I6-IROlmBAm2WXIHkqyOTrQ',
        });
        console.log(token);

        if (token) {
          console.log('FCM token:', token);

          // Foydalanuvchiga tegishli hujjatni yangilash
          const userRef = doc(db, 'users', userId);
          await updateDoc(userRef, {
            fcmToken: token, // Tokenni saqlash uchun Firestore'ga yoziladi
          });

          console.log("Token Firebase Firestore bazasiga muvaffaqiyatli qo'shildi");
        } else {
          console.log('Tokenni olishda xatolik');
        }
      } else {
        console.error('Notification uchun ruxsat berilmadi');
      }
    } catch (error) {
      console.error('Token olishda xatolik:', error);
    }
  };

  useEffect(() => {
    // if (id) {
    requestPermissionAndSaveToken(id); // User ID'ga asoslanib tokenni saqlash
    // }
  }, [id]);

  const addTimeRange = (day: string) => {
    setAvailableDays((prev) => ({
      ...prev,
      [day]: [...(prev[day] || []), { start: '', end: '' }],
    }));
  };

  const removeTimeRange = (day: string, index: number) => {
    setAvailableDays((prev) => ({
      ...prev,
      [day]: prev[day].filter((_, i) => i !== index),
    }));
  };

  // Foydalanuvchi profilini yangilash
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const profileData = {
      ...data,
      availableDays,
      isActive: true,
    };
    try {
      if (typeof id === 'string') {
        const userDocRef = doc(db, 'users', id);
        await updateDoc(userDocRef, profileData);
        console.log('Profile data saved successfully');
      }
    } catch (error) {
      console.error('Error saving profile data:', error);
    }
  };

  const sendNotificationToStudent = async (studentFcmToken: string, lessonStatus: string) => {
    const notificationPayload = {
      message: {
        token: studentFcmToken,
        notification: {
          title: `Your lesson was ${lessonStatus}`,
          body: `Your lesson has been ${lessonStatus} by the teacher.`,
        },
      },
    };

    try {
      const response = await fetch('/api/sendNotification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notificationPayload),
      });
      if (!response.ok) {
        throw new Error('Failed to send notification');
      }
      console.log('Notification sent successfully to the student');
    } catch (error) {
      console.error('Failed to send notification to the student:', error);
    }
  };

  // Yangi buyurtma qo'shish va o'qituvchiga xabar yuborish
  const handleNewOrder = async (orderData: any) => {
    const { teacherId, studentId, lessonId, roomId } = orderData;
    const message = `New order from ${studentId} for lesson ${lessonId}.`;

    // O'qituvchiga xabar yuborish
    await sendNotification(teacherId, message, 'teacher');

    // Firestore'ga buyurtmani qo'shish
    const orderRef = doc(db, 'orders', lessonId);
    await setDoc(orderRef, orderData);
  };

  // Buyurtmani qabul qilish yoki rad etish
  const handleAcceptOrCancel = async (lessonId: number, status: 'accepted' | 'canceled') => {
    const updatedOrders = ordersList.map((lesson) =>
      lesson.lessonId === lessonId ? { ...lesson, isAccepted: status, status: 'viewed' } : lesson,
    );
    setOrdersList(updatedOrders);

    try {
      if (typeof id === 'string') {
        const userDocRef = doc(db, 'users', id);
        await updateDoc(userDocRef, { lessons: updatedOrders });

        const lesson = ordersList.find((lesson) => lesson.lessonId === lessonId);
        if (lesson) {
          const studentDocRef = doc(db, 'users', lesson.studentId);

          // Talabaning FCM tokenini olish
          const studentSnapshot = await getDoc(studentDocRef);
          const studentData = studentSnapshot.data();
          const studentFcmToken = studentData?.fcmToken;

          if (studentFcmToken) {
            // Talabaga notification yuborish
            await sendNotificationToStudent(studentFcmToken, status);
          }

          // Talabaning buyurtmalar ro'yxatini yangilash
          await updateDoc(studentDocRef, {
            orders: updatedOrders.map((order) =>
              order.lessonId === lessonId
                ? { ...order, isAccepted: status, status: 'viewed' }
                : order,
            ),
          });

          console.log('Student orders updated successfully');
        }
      }
    } catch (error) {
      console.error('Failed to update orders:', error);
    }
  };

  if (loading) {
    return <p>loading...</p>;
  }

  console.log(data);

  return (
    <>
      <Navbar />
      <div>
        <Link href={`/dashboard/teacher/${id}/orders`}>Orders</Link>
        <Link href={`/dashboard/teacher/${id}/notifications`}>Notifications</Link>
        <h2>Edit your profile</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Full name"
            required
            value={data.name || ''}
            onChange={(e) => setData({ ...data, name: e.target.value })}
          />
          <input
            type="number"
            placeholder="Price"
            required
            value={data.price || ''}
            onChange={(e) => setData({ ...data, price: e.target.value })}
          />

          <h3>Select Available Days and Times</h3>
          {daysOfWeek.map((day) => (
            <div key={day}>
              <p>{day}</p>
              {(availableDays[day] || []).map((timeRange, index) => (
                <div key={index}>
                  <input
                    type="time"
                    value={timeRange.start}
                    onChange={(e) => handleTimeRangeChange(day, index, 'start', e.target.value)}
                  />
                  <span> to </span>
                  <input
                    type="time"
                    value={timeRange.end}
                    onChange={(e) => handleTimeRangeChange(day, index, 'end', e.target.value)}
                  />
                  <button type="button" onClick={() => removeTimeRange(day, index)}>
                    Remove
                  </button>
                </div>
              ))}
              <button type="button" onClick={() => addTimeRange(day)}>
                Add Time Range
              </button>
            </div>
          ))}

          <button type="submit">Save</button>
        </form>

        <div>
          <h2>Orders</h2>
          {ordersList.map((item) => (
            <div
              key={item.studentId}
              style={{
                border: '2px solid red',
                display: 'inline-block',
                padding: '15px',
                margin: '40px',
              }}
            >
              {item.status === 'new' && <b style={{ color: 'green' }}>NEW</b>}
              <p>Student: {item.studentId}</p>
              {/* <p>Day: {item.day}</p> */}
              <p>Time: {item.time.seconds}</p>
              <p>Message: {item.comment}</p>
              <p>
                Lesson Status: <b style={{ color: 'red' }}>{item.lessonStatus}</b>
              </p>
              {item.isAccepted === 'new' ? (
                <div>
                  <button onClick={() => handleAcceptOrCancel(item.lessonId, 'canceled')}>
                    Cancel
                  </button>
                  <button onClick={() => handleAcceptOrCancel(item.lessonId, 'accepted')}>
                    Accept
                  </button>
                </div>
              ) : item.isAccepted == 'accepted' ? (
                <Link href={`/rooms/${item.roomId}`} target="_blank">
                  Go to lesson room
                </Link>
              ) : (
                <button disabled>{item.isAccepted}</button>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
