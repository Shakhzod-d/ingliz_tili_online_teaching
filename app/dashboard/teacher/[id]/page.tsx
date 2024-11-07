'use client';

import axios from 'axios';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { db } from '../../../../utils/firebase'; // Adjust the path to your Firebase config
import { arrayUnion, doc, onSnapshot, setDoc, Timestamp, updateDoc } from 'firebase/firestore';

export default function ProfileEdit() {
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<any>({});
  const [availableDays, setAvailableDays] = useState<{
    [key: string]: { start: string; end: string }[];
  }>({});
  const [ordersList, setOrdersList] = useState<any[]>([]);
  const { id } = useParams();

  // Notification yuborish
  const sendNotification = async (userId: string, message: string, type: string) => {
    try {
      const userRef = doc(db, 'users', userId);

      const notification = {
        title: 'New Notification',
        body: message,
        timestamp: Timestamp.now(),
        type: type, // "teacher" yoki "student"
        isRead: false,
      };

      // Notificationni foydalanuvchining notifications bo'limiga qo'shish
      await updateDoc(userRef, {
        notifications: arrayUnion(notification),
      });

      console.log('Notification sent to', userId);
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  useEffect(() => {
    if (!id) return;

    setLoading(true);

    // Real-time listener for user data
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

      // Clean up the listener on unmount
      return () => unsubscribe();
    }
  }, [id]);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

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

  const handleNewOrder = async (orderData: any) => {
    const { teacherId, studentId, lessonId, roomId } = orderData;
    const message = `New order from ${studentId} for lesson ${lessonId}.`;

    // Teacherga notification yuborish
    await sendNotification(teacherId, message, 'teacher');

    // Orderni Firestore'ga qo'shish
    const orderRef = doc(db, 'orders', lessonId);
    await setDoc(orderRef, orderData);
  };

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
    <div>
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
            <p>Day: {item.day}</p>
            <p>Time: {item.time}</p>
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
  );
}
